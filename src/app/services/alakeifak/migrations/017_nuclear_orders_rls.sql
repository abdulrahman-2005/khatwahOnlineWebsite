BEGIN;

-- ====================================================================
-- NUCLEAR OPTION: WIPE ALL POLICIES ON THE ORDERS TABLE
-- ====================================================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Loop through every single policy currently on the orders table and drop it
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.orders';
    END LOOP;
END $$;

-- ====================================================================
-- REBUILD ONLY THE 4 SECURE POLICIES
-- ====================================================================

-- 1. PUBLIC INSERT: Customers must be able to submit orders.
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- 2. MEMBER READ: Restaurant staff can read orders for their own restaurant.
CREATE POLICY "orders_member_read" ON orders
  FOR SELECT USING (is_restaurant_member(restaurant_id));

-- 3. MEMBER UPDATE: Restaurant staff can update the status of their orders.
CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING (is_restaurant_member(restaurant_id));

-- 4. SUPER ADMIN: Super admins get full access.
CREATE POLICY "orders_super_admin" ON orders
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 🚨 NOTE: THERE IS DELIBERATELY NO PUBLIC SELECT POLICY 🚨
-- The public can NEVER query the orders table directly anymore.
-- They must use the secure RPC functions created in migration 016.

COMMIT;
