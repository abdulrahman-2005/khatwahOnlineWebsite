-- ============================================
-- alakeifak: Admin Performance & Indexing
-- Migration 007
-- ============================================

BEGIN;

-- 1. ADD MISSING INDEXES
-- These indexes prevent sequential scans during aggregate queries 
-- like `orders(count)` and `restaurant_members(count)` in the admin dashboard.

-- Indexes for sorting
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_date ON restaurant_payments(payment_date DESC);

-- Index for counting members per restaurant
CREATE INDEX IF NOT EXISTS idx_restaurant_members_rest_id ON restaurant_members(restaurant_id);

-- 1.5 FIX is_super_admin FUNCTION
-- Handle potential spaces in the comma-separated string, and optimize variables.
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_admin_emails TEXT;
BEGIN
  v_email := (select auth.email());
  IF v_email IS NULL THEN RETURN FALSE; END IF;

  BEGIN
    SELECT value INTO v_admin_emails
    FROM app_settings
    WHERE key = 'super_admin_emails';
  EXCEPTION WHEN undefined_table THEN
    v_admin_emails := '';
  END;

  IF v_admin_emails IS NOT NULL AND v_admin_emails != '' THEN
    -- Use regexp_split_to_array to split by comma and optional spaces
    RETURN v_email = ANY(regexp_split_to_array(v_admin_emails, '\s*,\s*'));
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1.6 FIX is_restaurant_member FUNCTION
-- Wrap auth.email() in (select auth.email()) so that it can be correctly cached in queries.
CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = (select auth.email())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- 2. FIX RLS PERFORMANCE
-- We must wrap function calls in `(select function_name())` to cache 
-- the result per query. Otherwise, PostgreSQL evaluates the function 
-- for EVERY single row, causing extreme lag (N+1 queries in RLS).

-- Restaurant Members
DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "members_insert" ON restaurant_members;
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "members_super_admin" ON restaurant_members;
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING ((select is_super_admin()))
  WITH CHECK ((select is_super_admin()));

-- Restaurant Payments
DROP POLICY IF EXISTS "payments_super_admin" ON restaurant_payments;
CREATE POLICY "payments_super_admin" ON restaurant_payments
  FOR ALL USING ((select is_super_admin()))
  WITH CHECK ((select is_super_admin()));

DROP POLICY IF EXISTS "payments_member_read" ON restaurant_payments;
CREATE POLICY "payments_member_read" ON restaurant_payments
  FOR SELECT USING ((select is_restaurant_member(restaurant_id)));

-- Restaurants
DROP POLICY IF EXISTS "restaurants_member_update" ON restaurants;
CREATE POLICY "restaurants_member_update" ON restaurants
  FOR UPDATE USING ((select is_restaurant_member(id)))
  WITH CHECK ((select is_restaurant_member(id)));

DROP POLICY IF EXISTS "restaurants_super_admin" ON restaurants;
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING ((select is_super_admin()))
  WITH CHECK ((select is_super_admin()));

DROP POLICY IF EXISTS "restaurants_member_read" ON restaurants;
CREATE POLICY "restaurants_member_read" ON restaurants
  FOR SELECT USING ((select is_restaurant_member(id)));

-- Orders
DROP POLICY IF EXISTS "orders_member_read" ON orders;
CREATE POLICY "orders_member_read" ON orders
  FOR SELECT USING ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "orders_member_update" ON orders;
CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING ((select is_restaurant_member(restaurant_id)));

-- Categories
DROP POLICY IF EXISTS "categories_member_insert" ON categories;
CREATE POLICY "categories_member_insert" ON categories
  FOR INSERT WITH CHECK ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "categories_member_update" ON categories;
CREATE POLICY "categories_member_update" ON categories
  FOR UPDATE USING ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "categories_member_delete" ON categories;
CREATE POLICY "categories_member_delete" ON categories
  FOR DELETE USING ((select is_restaurant_member(restaurant_id)));

-- Extras
DROP POLICY IF EXISTS "extras_member_insert" ON extras;
CREATE POLICY "extras_member_insert" ON extras
  FOR INSERT WITH CHECK ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "extras_member_update" ON extras;
CREATE POLICY "extras_member_update" ON extras
  FOR UPDATE USING ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "extras_member_delete" ON extras;
CREATE POLICY "extras_member_delete" ON extras
  FOR DELETE USING ((select is_restaurant_member(restaurant_id)));

-- Delivery Zones
DROP POLICY IF EXISTS "delivery_zones_member_insert" ON delivery_zones;
CREATE POLICY "delivery_zones_member_insert" ON delivery_zones
  FOR INSERT WITH CHECK ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "delivery_zones_member_update" ON delivery_zones;
CREATE POLICY "delivery_zones_member_update" ON delivery_zones
  FOR UPDATE USING ((select is_restaurant_member(restaurant_id)));

DROP POLICY IF EXISTS "delivery_zones_member_delete" ON delivery_zones;
CREATE POLICY "delivery_zones_member_delete" ON delivery_zones
  FOR DELETE USING ((select is_restaurant_member(restaurant_id)));

COMMIT;
