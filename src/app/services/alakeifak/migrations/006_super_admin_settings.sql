-- ============================================
-- alakeifak: Super Admin Settings Table & RLS
-- Migration 006
-- ============================================

BEGIN;

-- 1. Create the table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Bootstrap the initial super admin
INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', 'bodyazmy.new.2005@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Only Super Admins can manage settings)
DROP POLICY IF EXISTS "settings_super_admin_select" ON app_settings;
CREATE POLICY "settings_super_admin_select" ON app_settings
  FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_insert" ON app_settings;
CREATE POLICY "settings_super_admin_insert" ON app_settings
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_update" ON app_settings;
CREATE POLICY "settings_super_admin_update" ON app_settings
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "settings_super_admin_delete" ON app_settings;
CREATE POLICY "settings_super_admin_delete" ON app_settings
  FOR DELETE USING (is_super_admin());

COMMIT;
