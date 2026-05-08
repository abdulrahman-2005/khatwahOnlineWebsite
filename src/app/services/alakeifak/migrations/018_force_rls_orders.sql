-- ====================================================================
-- 018: FORCE RLS ON ORDERS TABLE
-- ====================================================================
-- The previous migrations created policies but RLS may never have been
-- enabled on the table itself. Without ENABLE ROW LEVEL SECURITY,
-- Postgres ignores ALL policies and returns everything.
-- ====================================================================

BEGIN;

-- STEP 1: FORCE-ENABLE RLS. This is the missing piece.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- STEP 2: Nuke every single policy on orders (clean slate)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'orders'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.orders';
    END LOOP;
END $$;

-- STEP 3: Rebuild ONLY the policies we actually need

-- Customers can INSERT orders (no auth required — public menu flow)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Restaurant members can READ their own restaurant's orders
CREATE POLICY "orders_member_read" ON orders
  FOR SELECT USING (is_restaurant_member(restaurant_id));

-- Restaurant members can UPDATE order status
CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING (is_restaurant_member(restaurant_id));

-- Super admins get full access
CREATE POLICY "orders_super_admin" ON orders
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ⛔ NO PUBLIC SELECT POLICY EXISTS. Anonymous users CANNOT read orders.

COMMIT;

-- ====================================================================
-- VERIFICATION: Run this query AFTER the migration to confirm RLS is on.
-- It should return: orders | true | true
--
--   SELECT tablename, rowsecurity, forcerowsecurity
--   FROM pg_tables 
--   WHERE schemaname = 'public' AND tablename = 'orders';
-- ====================================================================
