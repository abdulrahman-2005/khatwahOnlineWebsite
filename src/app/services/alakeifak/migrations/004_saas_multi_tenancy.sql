-- ============================================
-- alakeifak: SaaS Multi-Tenancy & OMS Upgrade
-- Migration 004 — Run AFTER 003
-- ============================================
-- 
-- This migration introduces:
--   1. restaurant_members — team-based access model (replaces owner_id checks)
--   2. restaurant_payments — offline billing ledger (Vodafone Cash, InstaPay)
--   3. SaaS columns on restaurants (is_active, subscription_end_date)
--   4. OMS columns on orders (order_type, table_number)
--   5. Data migration: existing owner_id → restaurant_members
--   6. Supabase Realtime publication for orders
--
-- ⚠️  Run inside a transaction. Test on staging first.
-- ============================================

BEGIN;

-- ─────────────────────────────────────────────
-- 1. RESTAURANT MEMBERS (Team-based Access)
-- ─────────────────────────────────────────────
-- Replaces the strict 1:1 owner_id relationship.
-- Multiple users can manage one restaurant,
-- and one user can manage multiple restaurants.

CREATE TABLE IF NOT EXISTS restaurant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,                                      -- Invite-first: email is set before user signs up
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked automatically on login
  role TEXT NOT NULL DEFAULT 'admin',                        -- 'owner' | 'admin'
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate membership
  UNIQUE(restaurant_id, email)
);

-- Composite index optimized for the RLS lookup pattern:
--   WHERE restaurant_id = X AND email = auth.email()
-- This is the most critical index in the entire SaaS — every
-- write RLS policy will hit it on every row operation.
CREATE INDEX IF NOT EXISTS idx_rest_members_lookup
  ON restaurant_members(restaurant_id, email);

-- Secondary index for "which restaurants does this email belong to?"
-- Used by the Workspace Selector (Phase 3).
CREATE INDEX IF NOT EXISTS idx_rest_members_email
  ON restaurant_members(email);

-- Enable RLS
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────
-- 2. RESTAURANT PAYMENTS (Offline Billing)
-- ─────────────────────────────────────────────
-- Tracks manual/offline payments recorded by super admins.
-- Each payment extends the restaurant's subscription_end_date.

CREATE TABLE IF NOT EXISTS restaurant_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id),  -- The super admin who recorded it
  notes TEXT,

  -- Denormalized snapshot for audit trail
  subscription_end_before TIMESTAMPTZ,  -- What it was before this payment
  subscription_end_after TIMESTAMPTZ    -- What it became after this payment
);

CREATE INDEX IF NOT EXISTS idx_rest_payments_restaurant
  ON restaurant_payments(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_rest_payments_date
  ON restaurant_payments(payment_date DESC);

-- Enable RLS
ALTER TABLE restaurant_payments ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────
-- 3. ALTER RESTAURANTS — SaaS Management Columns
-- ─────────────────────────────────────────────

-- is_active: The "kill switch". When FALSE:
--   • Public menu shows "This menu is currently unavailable"
--   • Partner dashboard shows "Please contact support"
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- subscription_end_date: NULL = free/unlimited (grace period).
-- When set and in the past, the restaurant is expired.
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;


-- ─────────────────────────────────────────────
-- 4. ALTER ORDERS — OMS Enhancement Columns
-- ─────────────────────────────────────────────

-- order_type: 'delivery' (default, backward-compat), 'pickup', 'in_house'
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'delivery';

-- table_number: Only used when order_type = 'in_house'
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Add constraint on order_type values
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_type_check
  CHECK (order_type IN ('delivery', 'pickup', 'in_house'));

-- Update status constraint to include the new OMS statuses.
-- The old statuses (pending, confirmed, delivered, cancelled) are kept
-- for backward compat with existing orders.
-- New flow: pending → preparing → ready → completed → (cancelled at any step)
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',     -- Just placed, awaiting partner action
    'preparing',   -- Accepted by partner, kitchen working on it
    'ready',       -- Ready for pickup/delivery/serving
    'completed',   -- Fulfilled and archived
    'confirmed',   -- LEGACY: kept for backward compat with existing orders
    'delivered',   -- LEGACY: kept for backward compat with existing orders
    'cancelled'    -- Rejected or cancelled
  ));

-- Index for active orders queries (OMS split-view)
CREATE INDEX IF NOT EXISTS idx_orders_active
  ON orders(restaurant_id, status)
  WHERE status NOT IN ('completed', 'cancelled', 'delivered');


-- ─────────────────────────────────────────────
-- 5. DATA MIGRATION: owner_id → restaurant_members
-- ─────────────────────────────────────────────
-- Copies every existing restaurant's owner into the new
-- restaurant_members table so no partner loses access.
-- Uses auth.users to resolve the email from the owner's UUID.

INSERT INTO restaurant_members (restaurant_id, email, user_id, role)
SELECT 
  r.id AS restaurant_id,
  u.email AS email,
  r.owner_id AS user_id,
  'owner' AS role
FROM restaurants r
JOIN auth.users u ON u.id = r.owner_id
ON CONFLICT (restaurant_id, email) DO NOTHING;


-- ─────────────────────────────────────────────
-- 6. HELPER FUNCTION: Auto-link user_id on login
-- ─────────────────────────────────────────────
-- When a user logs in, if their email exists in restaurant_members
-- but user_id is NULL (invited but not yet linked), fill it in.
-- This is called from the frontend after auth state change.

CREATE OR REPLACE FUNCTION link_member_on_login(p_email TEXT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurant_members
  SET user_id = p_user_id
  WHERE email = p_email
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- 7. HELPER FUNCTION: Record payment & extend subscription
-- ─────────────────────────────────────────────
-- Atomically records a payment and extends the restaurant's
-- subscription_end_date. If currently NULL or expired,
-- starts from NOW. If still active, extends from the current end.

CREATE OR REPLACE FUNCTION record_payment(
  p_restaurant_id UUID,
  p_amount NUMERIC,
  p_duration_days INTEGER,
  p_recorded_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS restaurant_payments AS $$
DECLARE
  v_current_end TIMESTAMPTZ;
  v_new_end TIMESTAMPTZ;
  v_payment restaurant_payments;
BEGIN
  -- Get current subscription end
  SELECT subscription_end_date INTO v_current_end
  FROM restaurants WHERE id = p_restaurant_id;

  -- Calculate new end date
  IF v_current_end IS NULL OR v_current_end < now() THEN
    -- Start fresh from now
    v_new_end := now() + (p_duration_days || ' days')::INTERVAL;
  ELSE
    -- Extend from current end
    v_new_end := v_current_end + (p_duration_days || ' days')::INTERVAL;
  END IF;

  -- Update restaurant
  UPDATE restaurants
  SET subscription_end_date = v_new_end
  WHERE id = p_restaurant_id;

  -- Insert payment record with audit trail
  INSERT INTO restaurant_payments (
    restaurant_id, amount, duration_days, recorded_by, notes,
    subscription_end_before, subscription_end_after
  ) VALUES (
    p_restaurant_id, p_amount, p_duration_days, p_recorded_by, p_notes,
    v_current_end, v_new_end
  ) RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- 8. SUPABASE REALTIME PUBLICATION
-- ─────────────────────────────────────────────
-- Enable realtime for the orders table so the Partner OMS
-- receives instant push updates (no more 30s polling).

COMMIT;

-- Publication commands must run outside the transaction
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;


-- ============================================
-- ✅ Migration 004 complete.
-- Next: Run 005_rls_rewrite.sql
-- ============================================
