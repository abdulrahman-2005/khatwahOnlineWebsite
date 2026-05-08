-- ============================================================
-- alakeifak: Production Cleanup
-- 006_production_cleanup.sql — Safe to run on live database
-- ============================================================
-- This file cleans up dead code and fixes security gaps on the
-- EXISTING live database without recreating anything.
--
-- ⚠️ RUN THIS ON YOUR LIVE DATABASE to align it with the
--    consolidated new_migrations files.
--
-- Everything here is DROP IF EXISTS or idempotent — safe to re-run.
-- ============================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- 1. DROP UNUSED DEBUG FUNCTIONS (Security Risk)
-- These are SECURITY DEFINER functions that leak internal data.
-- ═══════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS debug_super_admin_check();
DROP FUNCTION IF EXISTS diagnose_admin_access();


-- ═══════════════════════════════════════════════════════════════
-- 2. DROP UNUSED COLUMN
-- cancellation_reason is never read or written by the app.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE orders DROP COLUMN IF EXISTS cancellation_reason;


-- ═══════════════════════════════════════════════════════════════
-- 3. FIX DUPLICATE RLS POLICIES ON MENU TABLES
-- Migration 015b created *_member_manage AND 017 created *_member_all.
-- Both exist simultaneously — redundant. Drop the _member_all duplicates.
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "categories_member_all" ON categories;
DROP POLICY IF EXISTS "subcategories_member_all" ON subcategories;
DROP POLICY IF EXISTS "items_member_all" ON items;
DROP POLICY IF EXISTS "item_sizes_member_all" ON item_sizes;
DROP POLICY IF EXISTS "extras_member_all" ON extras;
DROP POLICY IF EXISTS "delivery_zones_member_all" ON delivery_zones;


-- ═══════════════════════════════════════════════════════════════
-- 4. FIX MENU PUBLIC READ POLICIES
-- Migration 017 set these to USING (TRUE) — anyone can read all
-- menus including inactive restaurants. Replace with is_active check.
--
-- Business rule:
--   is_active = TRUE  → menu works (functional gate)
--   is_verified = TRUE → listed on main page (marketing only)
-- ═══════════════════════════════════════════════════════════════

-- Categories
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));

-- Subcategories
DROP POLICY IF EXISTS "subcategories_public_read" ON subcategories;
CREATE POLICY "subcategories_public_read" ON subcategories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM categories c 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE c.id = category_id AND r.is_active = TRUE
  ));

-- Items
DROP POLICY IF EXISTS "items_public_read" ON items;
CREATE POLICY "items_public_read" ON items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM subcategories sc 
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE sc.id = subcategory_id AND r.is_active = TRUE
  ));

-- Item Sizes
DROP POLICY IF EXISTS "item_sizes_public_read" ON item_sizes;
CREATE POLICY "item_sizes_public_read" ON item_sizes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM items i 
    JOIN subcategories sc ON i.subcategory_id = sc.id
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE i.id = item_id AND r.is_active = TRUE
  ));

-- Extras
DROP POLICY IF EXISTS "extras_public_read" ON extras;
CREATE POLICY "extras_public_read" ON extras
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));

-- Delivery Zones
DROP POLICY IF EXISTS "delivery_zones_public_read" ON delivery_zones;
CREATE POLICY "delivery_zones_public_read" ON delivery_zones
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));


-- ═══════════════════════════════════════════════════════════════
-- 5. ADD search_path TO FUNCTIONS MISSING IT
-- Per Supabase best practices, SECURITY DEFINER functions
-- should have explicit search_path to prevent path hijacking.
-- ═══════════════════════════════════════════════════════════════

-- is_restaurant_member — also make case-insensitive (from 017)
CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id 
      AND LOWER(email) = LOWER(auth.email())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- check_is_restaurant_owner — also make case-insensitive
CREATE OR REPLACE FUNCTION check_is_restaurant_owner(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id 
      AND LOWER(email) = LOWER(auth.email())
      AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- seed_default_delivery_zones — add search_path
CREATE OR REPLACE FUNCTION seed_default_delivery_zones(p_restaurant_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO delivery_zones (restaurant_id, region_name, fee) VALUES
    (p_restaurant_id, 'وسط البلد', 10.00),
    (p_restaurant_id, 'المساعيد', 15.00),
    (p_restaurant_id, 'الريسة', 15.00),
    (p_restaurant_id, 'الزهور', 20.00),
    (p_restaurant_id, 'السبيل', 15.00),
    (p_restaurant_id, 'العبور', 20.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- place_order_secure — add search_path
CREATE OR REPLACE FUNCTION place_order_secure(payload JSONB)
RETURNS JSONB AS $$
DECLARE
  new_order RECORD;
BEGIN
  INSERT INTO orders (
    restaurant_id, total_amount, cart_snapshot, 
    customer_name, customer_phone, order_type, 
    delivery_address, delivery_zone_id, table_number
  )
  VALUES (
    (payload->>'restaurant_id')::uuid,
    (payload->>'total_amount')::numeric,
    payload->'cart_snapshot',
    payload->>'customer_name',
    payload->>'customer_phone',
    payload->>'order_type',
    payload->>'delivery_address',
    NULLIF(payload->>'delivery_zone_id', '')::uuid,
    payload->>'table_number'
  )
  RETURNING * INTO new_order;
  RETURN to_jsonb(new_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- get_order_secure — add search_path
CREATE OR REPLACE FUNCTION get_order_secure(order_id UUID)
RETURNS JSONB AS $$
DECLARE
  found_order RECORD;
BEGIN
  SELECT * INTO found_order FROM orders WHERE id = order_id;
  RETURN to_jsonb(found_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- get_public_order_count — add search_path
CREATE OR REPLACE FUNCTION get_public_order_count(p_restaurant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  order_count INTEGER;
BEGIN
  SELECT count(*) INTO order_count FROM orders WHERE restaurant_id = p_restaurant_id;
  RETURN order_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- link_member_on_login — add search_path
CREATE OR REPLACE FUNCTION link_member_on_login(p_email TEXT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurant_members
  SET user_id = p_user_id
  WHERE email = p_email
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- record_payment — add search_path
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
  SELECT subscription_end_date INTO v_current_end
  FROM restaurants WHERE id = p_restaurant_id;

  IF v_current_end IS NULL OR v_current_end < now() THEN
    v_new_end := now() + (p_duration_days || ' days')::INTERVAL;
  ELSE
    v_new_end := v_current_end + (p_duration_days || ' days')::INTERVAL;
  END IF;

  UPDATE restaurants
  SET subscription_end_date = v_new_end
  WHERE id = p_restaurant_id;

  INSERT INTO restaurant_payments (
    restaurant_id, amount, duration_days, recorded_by, notes,
    subscription_end_before, subscription_end_after
  ) VALUES (
    p_restaurant_id, p_amount, p_duration_days, p_recorded_by, p_notes,
    v_current_end, v_new_end
  ) RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


COMMIT;

-- ============================================================
-- ✅ 006_production_cleanup.sql complete.
--
-- Changes made:
--   • Dropped 2 debug functions (security risk)
--   • Dropped cancellation_reason column (unused)
--   • Removed 6 duplicate RLS policies (_member_all)
--   • Fixed 6 menu public read policies (TRUE → is_active check)
--   • Added search_path to 8 SECURITY DEFINER functions
--
-- Verify after running:
--   SELECT routine_name FROM information_schema.routines 
--   WHERE routine_schema = 'public';
--   -- Should NOT contain: debug_super_admin_check, diagnose_admin_access
-- ============================================================
