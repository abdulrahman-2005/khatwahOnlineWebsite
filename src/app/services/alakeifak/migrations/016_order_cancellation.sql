-- ============================================
-- alakeifak: Order Cancellation & Delivery Toggle
-- Migration 016 — Run AFTER 015
-- ============================================
--
-- This migration introduces:
--   1. Order cancellation tracking columns on orders table
--   2. Delivery pricing visibility toggle on restaurants table
--
-- Financial model for cancellations:
--   When cancelled at pending/preparing → total_amount set to 0  (equal/break-even)
--   When cancelled at ready/confirmed  → total_amount flipped to -original (loss)
--   Analytics checks: total_amount > 0 = revenue, 0 = equal cancel, < 0 = loss
--
-- ⚠️ Run inside a transaction. Test on staging first.
-- ============================================

BEGIN;

-- ─────────────────────────────────────────────
-- 1. ORDER CANCELLATION TRACKING
-- ─────────────────────────────────────────────

-- When the order was cancelled (NULL if not cancelled)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Optional free-text reason the partner provided
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Index for efficient analytics queries filtering by cancellation
CREATE INDEX IF NOT EXISTS idx_orders_cancelled
  ON orders(restaurant_id, cancelled_at)
  WHERE cancelled_at IS NOT NULL;

-- ─────────────────────────────────────────────
-- 2. DELIVERY PRICING VISIBILITY TOGGLE
-- ─────────────────────────────────────────────
-- When FALSE:
--   • Customer sees delivery zone names but NOT prices
--   • Delivery fee is excluded from cart total
--   • WhatsApp message omits delivery fee line

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS show_delivery_pricing BOOLEAN DEFAULT TRUE;

COMMIT;

-- ============================================
-- ✅ Migration 016 complete.
-- Financial logic implemented in application layer:
--   cancelOrder(id, currentStatus, originalAmount)
--   - pending/preparing → UPDATE orders SET status='cancelled', cancelled_at=now(), total_amount=0
--   - ready/confirmed   → UPDATE orders SET status='cancelled', cancelled_at=now(), total_amount=(-originalAmount)
-- ============================================
