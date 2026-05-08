-- ============================================================
-- alakeifak: Seed Data
-- 005_seed_data.sql — Bootstrap data for the platform
-- ============================================================
-- This file inserts essential configuration data.
-- All operations are idempotent (safe to re-run).
-- ============================================================

BEGIN;

-- Bootstrap super admin email
INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', 'bodyazmy.new.2005@gmail.com')
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================================
-- ✅ 005_seed_data.sql complete.
-- All migrations are done. The database is fully configured.
-- ============================================================
