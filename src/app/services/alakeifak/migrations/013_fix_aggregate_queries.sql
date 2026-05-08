-- ============================================
-- alakeifak: Fix Aggregate Queries for Super Admin
-- Migration 013
-- ============================================
--
-- Root Cause:
-- The admin dashboard query includes aggregates:
--   restaurants?select=*,orders(count),restaurant_members(count)
-- 
-- The 500 error occurs because:
-- 1. orders table doesn't have a super_admin policy
-- 2. When counting orders, RLS blocks super admin access
-- 3. Same issue might affect restaurant_members count
--
-- Solution:
-- Add super admin policies to orders table
-- Verify restaurant_members has proper super admin access
-- ============================================

BEGIN;

-- 1. Add super admin policy to orders table
DROP POLICY IF EXISTS "orders_super_admin" ON orders;
CREATE POLICY "orders_super_admin" ON orders
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- 2. Verify restaurant_members super admin policy exists
-- (Should already exist from migration 012, but let's be sure)
DROP POLICY IF EXISTS "members_super_admin" ON restaurant_members;
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- 3. Add super admin policies to other related tables that might be queried

-- Categories
DROP POLICY IF EXISTS "categories_super_admin" ON categories;
CREATE POLICY "categories_super_admin" ON categories
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Subcategories
DROP POLICY IF EXISTS "subcategories_super_admin" ON subcategories;
CREATE POLICY "subcategories_super_admin" ON subcategories
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Items
DROP POLICY IF EXISTS "items_super_admin" ON items;
CREATE POLICY "items_super_admin" ON items
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Item Sizes
DROP POLICY IF EXISTS "item_sizes_super_admin" ON item_sizes;
CREATE POLICY "item_sizes_super_admin" ON item_sizes
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Extras
DROP POLICY IF EXISTS "extras_super_admin" ON extras;
CREATE POLICY "extras_super_admin" ON extras
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Delivery Zones
DROP POLICY IF EXISTS "delivery_zones_super_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_super_admin" ON delivery_zones
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

COMMIT;

-- ============================================
-- ✅ Migration 013 complete.
-- 
-- Key Changes:
--   • Added super_admin policy to orders table
--   • Verified restaurant_members super_admin policy
--   • Added super_admin policies to all related tables
--   • Super admins now have full access to all tables
--
-- Testing:
--   1. Go to /services/alakeifak/admin
--   2. Should see all restaurants with order counts
--   3. No more 500 errors
--
-- The query that was failing:
--   restaurants?select=*,orders(count),restaurant_members(count)
-- Should now work because super admins can read orders and members
-- ============================================
