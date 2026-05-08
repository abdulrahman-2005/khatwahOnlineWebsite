# Quick Fix Guide - Team Member Addition Error

## Problem
Adding team members in `/admin` or `/partner` returns infinite recursion database error.

## Solution
Run migration 010 to fix RLS policies.

## Steps to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `src/app/services/alakeifak/migrations/010_fix_rls_recursion_final.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click **Run**
7. ✅ Verify "Success" message

### Option 2: Supabase CLI

```bash
# Navigate to project root
cd /path/to/your/project

# Apply the migration
supabase db push

# Or run specific migration
psql $DATABASE_URL -f src/app/services/alakeifak/migrations/010_fix_rls_recursion_final.sql
```

### Option 3: Direct SQL Connection

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i src/app/services/alakeifak/migrations/010_fix_rls_recursion_final.sql

# Exit
\q
```

## Verify the Fix

### Test 1: Partner Dashboard
1. Go to `/services/alakeifak/partner`
2. Click "الفريق" (Team) tab
3. Enter an email: `test@example.com`
4. Click "دعوة" (Invite)
5. ✅ Should see success message

### Test 2: Admin Dashboard
1. Go to `/services/alakeifak/admin`
2. Click "Team" button on any restaurant
3. Enter an email and select role
4. Click "Add"
5. ✅ Should see success message

### Test 3: Check Database
```sql
-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'restaurant_members';

-- Should show:
-- members_self_read
-- members_team_read
-- members_insert
-- members_delete
-- members_update
-- members_super_admin
```

## Rollback (If Needed)

If something goes wrong:

```sql
-- Restore previous state
BEGIN;

DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;
DROP POLICY IF EXISTS "members_insert" ON restaurant_members;
DROP POLICY IF EXISTS "members_delete" ON restaurant_members;
DROP POLICY IF EXISTS "members_update" ON restaurant_members;

-- Re-run migration 009
\i src/app/services/alakeifak/migrations/009_fix_rls_recursion.sql

COMMIT;
```

## Common Issues

### Issue: "function auth.email() does not exist"
**Solution**: Ensure Supabase Auth is properly configured

### Issue: "permission denied for table restaurant_members"
**Solution**: Run migration as database owner or with proper privileges

### Issue: Still getting recursion error
**Solution**: 
1. Check if migration was applied: `SELECT * FROM pg_policies WHERE tablename = 'restaurant_members';`
2. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'restaurant_members';`
3. Clear Supabase cache and retry

## Support

For issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Review full documentation: `ALAKEIFAK_RLS_RECURSION_FIX.md`
3. Contact development team

---

**Migration File**: `010_fix_rls_recursion_final.sql`  
**Status**: Ready to apply  
**Estimated Time**: < 1 minute
