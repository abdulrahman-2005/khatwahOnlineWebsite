-- ============================================
-- alakeifak: Fix recursive RLS and orphaned restaurants
-- Migration 008
-- ============================================

BEGIN;

-- 1. Fix recursive RLS on restaurant_members
-- The policy "members_team_read" uses is_restaurant_member, which queries restaurant_members.
-- The policy "members_delete" uses a subquery on restaurant_members.
-- We rewrite is_restaurant_member to use a separate logic or we fix the delete policy.
-- Actually, the infinite recursion is caused because a delete or select on restaurant_members
-- triggers policies that query restaurant_members.

-- Drop the problem policies
DROP POLICY IF EXISTS "members_delete" ON restaurant_members;
DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;
DROP POLICY IF EXISTS "members_insert" ON restaurant_members;

-- Recreate them avoiding recursion
-- Members can read other members of restaurants they belong to.
-- Using an EXISTS check directly instead of a function that might recurse or using SECURITY DEFINER carefully.
-- To avoid recursion, we check if the user is an owner/member directly via auth.uid() or email without calling policies.

-- Create a helper that uses SECURITY DEFINER to check ownership WITHOUT triggering policies
CREATE OR REPLACE FUNCTION check_is_restaurant_owner(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_owner BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = auth.email()
      AND role = 'owner'
  ) INTO v_is_owner;
  RETURN v_is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate team read without recursion (allow anyone to see members if they share a restaurant)
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    restaurant_id IN (
      SELECT rm.restaurant_id FROM restaurant_members rm WHERE rm.email = auth.email()
    )
  );

-- Recreate insert
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK (
    check_is_restaurant_owner(restaurant_id) OR is_super_admin() OR
    -- allow insertion if it's the very first member (bootstrap case)
    NOT EXISTS (SELECT 1 FROM restaurant_members rm WHERE rm.restaurant_id = restaurant_id)
  );

-- Recreate delete
CREATE POLICY "members_delete" ON restaurant_members
  FOR DELETE USING (
    check_is_restaurant_owner(restaurant_id)
    AND email != auth.email()  -- Can't remove yourself
  );

-- 2. Fix Orphaned Restaurants (Allow owners to delete their restaurant if setup fails)
-- We need to ensure that the user who created the restaurant can delete it.
DROP POLICY IF EXISTS "restaurants_member_delete" ON restaurants;
CREATE POLICY "restaurants_member_delete" ON restaurants
  FOR DELETE USING (
    owner_id = auth.uid() OR
    is_restaurant_member(id)
  );

COMMIT;
