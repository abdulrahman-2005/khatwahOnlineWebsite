-- ============================================
-- alakeifak: Fix RLS Infinite Recursion
-- Migration 009
-- ============================================

BEGIN;

-- 1. Redefine helpers with explicit search_path to guarantee RLS bypass

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = auth.email()
  ) INTO v_is_member;
  RETURN v_is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Drop the recursive team read policy
DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;

-- 3. Recreate it safely using the SECURITY DEFINER function
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    is_restaurant_member(restaurant_id)
  );

-- 4. Fix the delete policy which was the original cause of recursion
DROP POLICY IF EXISTS "members_delete" ON restaurant_members;

CREATE POLICY "members_delete" ON restaurant_members
  FOR DELETE USING (
    check_is_restaurant_owner(restaurant_id)
    AND email != auth.email()
  );

COMMIT;
