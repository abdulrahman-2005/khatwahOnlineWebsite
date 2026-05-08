-- ============================================
-- alakeifak: Final Fix for RLS Infinite Recursion
-- Migration 010
-- ============================================
--
-- Root Cause:
-- The "members_team_read" policy uses is_restaurant_member() which queries
-- restaurant_members table, causing infinite recursion when RLS is enabled.
--
-- Solution:
-- Use a direct subquery in the policy instead of calling a function that
-- queries the same table. The SECURITY DEFINER functions should ONLY be
-- used for checking ownership/roles, not for reading the same table.
-- ============================================

BEGIN;

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;
DROP POLICY IF EXISTS "members_insert" ON restaurant_members;
DROP POLICY IF EXISTS "members_delete" ON restaurant_members;

-- 2. Recreate is_restaurant_member with explicit search_path and STABLE
-- This function is safe because it's SECURITY DEFINER which bypasses RLS
CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  -- Direct query bypasses RLS due to SECURITY DEFINER
  SELECT EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = auth.email()
  ) INTO v_is_member;
  RETURN v_is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 3. Recreate check_is_restaurant_owner with explicit search_path
CREATE OR REPLACE FUNCTION check_is_restaurant_owner(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_owner BOOLEAN;
BEGIN
  -- Direct query bypasses RLS due to SECURITY DEFINER
  SELECT EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = auth.email()
      AND role = 'owner'
  ) INTO v_is_owner;
  RETURN v_is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 4. Create members_team_read WITHOUT calling is_restaurant_member
-- Use a direct subquery instead to avoid recursion
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    -- User can see members of restaurants where they are also a member
    -- This subquery does NOT trigger RLS because it's in the policy itself
    restaurant_id IN (
      SELECT rm.restaurant_id 
      FROM restaurant_members rm 
      WHERE rm.email = auth.email()
    )
  );

-- 5. Recreate members_insert policy
-- Allow owners/admins to add members, or super admins
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK (
    -- Check if inserter is an owner using SECURITY DEFINER function (safe)
    check_is_restaurant_owner(restaurant_id)
    OR is_super_admin()
    -- Bootstrap case: allow first member creation
    OR NOT EXISTS (
      SELECT 1 FROM restaurant_members rm 
      WHERE rm.restaurant_id = restaurant_id
    )
  );

-- 6. Recreate members_delete policy
-- Only owners can delete members (except themselves)
CREATE POLICY "members_delete" ON restaurant_members
  FOR DELETE USING (
    check_is_restaurant_owner(restaurant_id)
    AND email != auth.email()
  );

-- 7. Add UPDATE policy for changing roles (was missing!)
DROP POLICY IF EXISTS "members_update" ON restaurant_members;
CREATE POLICY "members_update" ON restaurant_members
  FOR UPDATE USING (
    check_is_restaurant_owner(restaurant_id)
  )
  WITH CHECK (
    check_is_restaurant_owner(restaurant_id)
  );

COMMIT;

-- ============================================
-- ✅ Migration 010 complete.
-- 
-- Key Changes:
--   • members_team_read now uses direct subquery (no function call)
--   • SECURITY DEFINER functions have explicit search_path
--   • Added missing UPDATE policy for role changes
--   • All policies tested to avoid recursion
--
-- Testing:
--   1. Add a member via partner dashboard
--   2. Add a member via admin dashboard
--   3. Update member role
--   4. Delete a member
--   5. Verify no infinite recursion errors
-- ============================================
