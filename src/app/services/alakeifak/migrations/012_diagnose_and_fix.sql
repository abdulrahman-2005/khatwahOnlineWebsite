-- ============================================
-- alakeifak: Diagnose and Fix Super Admin Access
-- Migration 012
-- ============================================

BEGIN;

-- 1. First, let's check what's happening
-- Create a diagnostic function that doesn't rely on RLS
CREATE OR REPLACE FUNCTION diagnose_admin_access()
RETURNS TABLE(
  step TEXT,
  result TEXT
) AS $$
BEGIN
  -- Step 1: Check if user is authenticated
  RETURN QUERY SELECT 'auth.email()'::TEXT, COALESCE(auth.email(), 'NULL')::TEXT;
  
  -- Step 2: Check if app_settings table exists
  RETURN QUERY SELECT 'app_settings exists'::TEXT, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings')
    THEN 'YES' ELSE 'NO' END;
  
  -- Step 3: Check super admin emails (bypass RLS with SECURITY DEFINER)
  RETURN QUERY SELECT 'super_admin_emails'::TEXT, 
    COALESCE((SELECT value FROM app_settings WHERE key = 'super_admin_emails'), 'NOT SET')::TEXT;
  
  -- Step 4: Check is_super_admin result
  RETURN QUERY SELECT 'is_super_admin()'::TEXT, is_super_admin()::TEXT;
  
  -- Step 5: Count restaurants
  RETURN QUERY SELECT 'restaurant count'::TEXT, COUNT(*)::TEXT FROM restaurants;
  
  -- Step 6: Check RLS status
  RETURN QUERY SELECT 'restaurants RLS enabled'::TEXT,
    CASE WHEN relrowsecurity THEN 'YES' ELSE 'NO' END
    FROM pg_class WHERE relname = 'restaurants';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION diagnose_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION diagnose_admin_access() TO anon;


-- 2. Create a simpler version of is_super_admin that logs what it's doing
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
  
  -- If no email, definitely not admin
  IF v_email IS NULL THEN 
    RAISE NOTICE 'is_super_admin: No email found';
    RETURN FALSE; 
  END IF;

  RAISE NOTICE 'is_super_admin: Checking email %', v_email;

  -- Read from app_settings (SECURITY DEFINER bypasses RLS)
  BEGIN
    SELECT value INTO v_admin_emails
    FROM app_settings
    WHERE key = 'super_admin_emails';
    
    RAISE NOTICE 'is_super_admin: Admin emails from DB: %', v_admin_emails;
  EXCEPTION 
    WHEN undefined_table THEN
      RAISE NOTICE 'is_super_admin: app_settings table does not exist';
      RETURN FALSE;
    WHEN OTHERS THEN
      RAISE NOTICE 'is_super_admin: Error reading app_settings: %', SQLERRM;
      RETURN FALSE;
  END;

  -- If no admin emails configured, return false
  IF v_admin_emails IS NULL OR v_admin_emails = '' THEN
    RAISE NOTICE 'is_super_admin: No admin emails configured';
    RETURN FALSE;
  END IF;

  -- Split comma-separated emails and trim whitespace
  v_admin_array := string_to_array(v_admin_emails, ',');
  
  -- Check if user's email matches any admin email (case-insensitive, trimmed)
  FOREACH v_trimmed_email IN ARRAY v_admin_array
  LOOP
    IF LOWER(TRIM(v_trimmed_email)) = LOWER(v_email) THEN
      RAISE NOTICE 'is_super_admin: MATCH FOUND for %', v_email;
      RETURN TRUE;
    END IF;
  END LOOP;

  RAISE NOTICE 'is_super_admin: No match found for %', v_email;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO anon;


-- 3. Recreate all policies that depend on is_super_admin
-- (They were dropped by CASCADE in migration 011)

-- app_settings policies
DROP POLICY IF EXISTS "settings_super_admin_select" ON app_settings;
CREATE POLICY "settings_super_admin_select" ON app_settings
  FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_insert" ON app_settings;
CREATE POLICY "settings_super_admin_insert" ON app_settings
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_update" ON app_settings;
CREATE POLICY "settings_super_admin_update" ON app_settings
  FOR UPDATE USING (is_super_admin()) 
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_delete" ON app_settings;
CREATE POLICY "settings_super_admin_delete" ON app_settings
  FOR DELETE USING (is_super_admin());

-- restaurants policies
DROP POLICY IF EXISTS "restaurants_super_admin" ON restaurants;
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- restaurant_members policies
DROP POLICY IF EXISTS "members_super_admin" ON restaurant_members;
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

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

-- restaurant_payments policies
DROP POLICY IF EXISTS "payments_super_admin" ON restaurant_payments;
CREATE POLICY "payments_super_admin" ON restaurant_payments
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- 4. Ensure super admin email is set
INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', 'bodyazmy.new.2005@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;

-- ============================================
-- ✅ Migration 012 complete.
-- 
-- Testing:
--   1. Run: SELECT * FROM diagnose_admin_access();
--   2. Check Supabase logs for NOTICE messages
--   3. Verify is_super_admin() returns true
--   4. Try fetching restaurants again
--
-- Expected output from diagnose_admin_access():
--   auth.email()          | your-email@gmail.com
--   app_settings exists   | YES
--   super_admin_emails    | bodyazmy.new.2005@gmail.com
--   is_super_admin()      | true
--   restaurant count      | <number>
--   restaurants RLS       | YES
-- ============================================
