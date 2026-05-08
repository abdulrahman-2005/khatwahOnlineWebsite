-- ============================================
-- alakeifak: Fix Super Admin Access & Circular Dependency
-- Migration 011
-- ============================================
--
-- Root Cause:
-- 1. app_settings table has RLS enabled
-- 2. RLS policies require is_super_admin() to read
-- 3. is_super_admin() needs to read app_settings
-- 4. This creates a circular dependency!
--
-- Solution:
-- Make is_super_admin() a SECURITY DEFINER function that bypasses RLS
-- when reading app_settings. This breaks the circular dependency.
-- ============================================

BEGIN;

-- 1. Recreate is_super_admin with SECURITY DEFINER to bypass RLS
-- Use CASCADE to drop dependent policies (they'll be recreated below)
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_admin_emails TEXT;
  v_admin_array TEXT[];
  v_trimmed_email TEXT;
BEGIN
  -- Get current user's email
  v_email := auth.email();
  IF v_email IS NULL THEN 
    RETURN FALSE; 
  END IF;

  -- Read from app_settings (SECURITY DEFINER bypasses RLS)
  BEGIN
    SELECT value INTO v_admin_emails
    FROM app_settings
    WHERE key = 'super_admin_emails';
  EXCEPTION 
    WHEN undefined_table THEN
      -- Table doesn't exist yet
      RETURN FALSE;
    WHEN OTHERS THEN
      -- Any other error (including RLS issues)
      RETURN FALSE;
  END;

  -- If no admin emails configured, return false
  IF v_admin_emails IS NULL OR v_admin_emails = '' THEN
    RETURN FALSE;
  END IF;

  -- Split comma-separated emails and trim whitespace
  v_admin_array := string_to_array(v_admin_emails, ',');
  
  -- Check if user's email matches any admin email (case-insensitive, trimmed)
  FOREACH v_trimmed_email IN ARRAY v_admin_array
  LOOP
    IF LOWER(TRIM(v_trimmed_email)) = LOWER(v_email) THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO anon;


-- 2. Fix app_settings RLS policies to avoid recursion
-- Drop existing policies
DROP POLICY IF EXISTS "settings_super_admin_select" ON app_settings;
DROP POLICY IF EXISTS "settings_super_admin_insert" ON app_settings;
DROP POLICY IF EXISTS "settings_super_admin_update" ON app_settings;
DROP POLICY IF EXISTS "settings_super_admin_delete" ON app_settings;

-- Recreate with proper structure
-- SELECT: Super admins can read (is_super_admin bypasses RLS via SECURITY DEFINER)
CREATE POLICY "settings_super_admin_select" ON app_settings
  FOR SELECT USING (is_super_admin());

-- INSERT: Super admins only
CREATE POLICY "settings_super_admin_insert" ON app_settings
  FOR INSERT WITH CHECK (is_super_admin());

-- UPDATE: Super admins only
CREATE POLICY "settings_super_admin_update" ON app_settings
  FOR UPDATE USING (is_super_admin()) 
  WITH CHECK (is_super_admin());

-- DELETE: Super admins only
CREATE POLICY "settings_super_admin_delete" ON app_settings
  FOR DELETE USING (is_super_admin());


-- 3. Verify restaurants_super_admin policy exists
-- This should already exist from migration 005/007, but let's ensure it's correct
DROP POLICY IF EXISTS "restaurants_super_admin" ON restaurants;
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- 4. Recreate other super admin policies that were dropped by CASCADE

-- restaurant_members super admin policy
DROP POLICY IF EXISTS "members_super_admin" ON restaurant_members;
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- restaurant_payments super admin policy
DROP POLICY IF EXISTS "payments_super_admin" ON restaurant_payments;
CREATE POLICY "payments_super_admin" ON restaurant_payments
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Recreate members_insert policy (it depends on is_super_admin)
DROP POLICY IF EXISTS "members_insert" ON restaurant_members;
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK (
    check_is_restaurant_owner(restaurant_id)
    OR is_super_admin()
    OR NOT EXISTS (
      SELECT 1 FROM restaurant_members rm 
      WHERE rm.restaurant_id = restaurant_id
    )
  );


-- 5. Add helpful debug function (optional, can be removed in production)
CREATE OR REPLACE FUNCTION debug_super_admin_check()
RETURNS TABLE(
  current_email TEXT,
  admin_emails TEXT,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.email() as current_email,
    (SELECT value FROM app_settings WHERE key = 'super_admin_emails') as admin_emails,
    is_super_admin() as is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION debug_super_admin_check() TO authenticated;


-- 6. Ensure the bootstrap super admin email is set
-- This is idempotent - won't overwrite if already exists
INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', 'bodyazmy.new.2005@gmail.com')
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================
-- ✅ Migration 011 complete.
-- 
-- Key Changes:
--   • is_super_admin() now uses SECURITY DEFINER to bypass RLS
--   • Added proper error handling for missing table
--   • Added GRANT statements for function execution
--   • Recreated app_settings policies correctly
--   • Added debug function for troubleshooting
--   • Ensured bootstrap super admin is set
--
-- Testing:
--   1. Sign in as super admin (bodyazmy.new.2005@gmail.com)
--   2. Go to /services/alakeifak/admin
--   3. Should see all restaurants in the table
--   4. Run: SELECT * FROM debug_super_admin_check();
--   5. Should show is_admin = true
--
-- Troubleshooting:
--   If restaurants still don't show:
--   1. Check: SELECT * FROM debug_super_admin_check();
--   2. Check: SELECT * FROM app_settings WHERE key = 'super_admin_emails';
--   3. Check: SELECT * FROM pg_policies WHERE tablename = 'restaurants';
--   4. Verify email matches exactly (case-insensitive, but no typos)
-- ============================================
