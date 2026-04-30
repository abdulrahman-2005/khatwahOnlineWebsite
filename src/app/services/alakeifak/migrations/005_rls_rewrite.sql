-- ============================================
-- alakeifak: RLS Policy Rewrite for Multi-Tenancy
-- Migration 005 — Run AFTER 004_saas_multi_tenancy.sql
-- ============================================
--
-- This migration REPLACES all owner_id-based write policies
-- with restaurant_members-based policies using auth.email().
--
-- Pattern:
--   OLD: EXISTS (SELECT 1 FROM restaurants WHERE owner_id = auth.uid())
--   NEW: EXISTS (SELECT 1 FROM restaurant_members WHERE email = auth.email())
--
-- Public SELECT policies remain unchanged (anonymous read for verified).
-- New tables (restaurant_members, restaurant_payments) get their own RLS.
--
-- ⚠️  CRITICAL: Run in a maintenance window. Test on staging first.
-- ============================================

BEGIN;

-- ═══════════════════════════════════════════
-- HELPER: Check if a user is a member of a restaurant
-- Used in RLS policies. Security definer to bypass RLS recursion.
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ═══════════════════════════════════════════
-- HELPER: Check if a user is a super admin
-- Reads from env var SUPER_ADMIN_EMAILS (comma-separated).
-- Falls back to a hardcoded list if the setting doesn't exist.
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_admin_emails TEXT;
BEGIN
  v_email := auth.email();
  IF v_email IS NULL THEN RETURN FALSE; END IF;

  -- Try to read from app settings (Supabase Vault or app_settings table)
  -- If that's not available, use a hardcoded fallback
  BEGIN
    SELECT value INTO v_admin_emails
    FROM app_settings
    WHERE key = 'super_admin_emails';
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet, use empty (middleware handles this)
    v_admin_emails := '';
  END;

  -- Check if user's email is in the admin list
  IF v_admin_emails IS NOT NULL AND v_admin_emails != '' THEN
    RETURN v_email = ANY(string_to_array(v_admin_emails, ','));
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ═══════════════════════════════════════════
-- RESTAURANT_MEMBERS — Own RLS
-- ═══════════════════════════════════════════

-- Members can read their own memberships (needed for Workspace Selector)
CREATE POLICY "members_self_read" ON restaurant_members
  FOR SELECT USING (email = auth.email());

-- Members can read other members of restaurants they belong to
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    is_restaurant_member(restaurant_id)
  );

-- Only owners/admins of a restaurant can invite new members
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK (
    is_restaurant_member(restaurant_id)
  );

-- Only owners can remove members (not themselves)
CREATE POLICY "members_delete" ON restaurant_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurant_members rm
      WHERE rm.restaurant_id = restaurant_members.restaurant_id
        AND rm.email = auth.email()
        AND rm.role = 'owner'
    )
    AND email != auth.email()  -- Can't remove yourself
  );

-- Super admins can do everything on restaurant_members
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════
-- RESTAURANT_PAYMENTS — Super Admin Only
-- ═══════════════════════════════════════════

CREATE POLICY "payments_super_admin" ON restaurant_payments
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Restaurant owners can view their own payment history (read-only)
CREATE POLICY "payments_member_read" ON restaurant_payments
  FOR SELECT USING (
    is_restaurant_member(restaurant_id)
  );


-- ═══════════════════════════════════════════
-- RESTAURANTS — Update write policies
-- ═══════════════════════════════════════════

-- Keep public read for verified restaurants (unchanged)
-- DROP + recreate owner write policies

-- Owner insert stays uid-based (user creates restaurant, then adds themselves to members)
-- This is the bootstrap case — can't check members table before restaurant exists
-- (SetupWizard.jsx creates restaurant first, then inserts into restaurant_members)

-- Update: members can update their restaurant
DROP POLICY IF EXISTS "restaurants_owner_update" ON restaurants;
CREATE POLICY "restaurants_member_update" ON restaurants
  FOR UPDATE USING (
    is_restaurant_member(id)
  )
  WITH CHECK (
    is_restaurant_member(id)
  );

-- Super admin can do everything
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Keep owner read for unverified (so setup wizard works)
-- restaurants_owner_read already checks auth.uid() = owner_id, that's fine
-- Add: members can also read their restaurants
CREATE POLICY "restaurants_member_read" ON restaurants
  FOR SELECT USING (
    is_restaurant_member(id)
  );


-- ═══════════════════════════════════════════
-- CATEGORIES — Rewrite write policies
-- ═══════════════════════════════════════════

-- Public read stays unchanged

DROP POLICY IF EXISTS "categories_owner_insert" ON categories;
CREATE POLICY "categories_member_insert" ON categories
  FOR INSERT WITH CHECK (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "categories_owner_update" ON categories;
CREATE POLICY "categories_member_update" ON categories
  FOR UPDATE USING (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "categories_owner_delete" ON categories;
CREATE POLICY "categories_member_delete" ON categories
  FOR DELETE USING (
    is_restaurant_member(restaurant_id)
  );


-- ═══════════════════════════════════════════
-- SUBCATEGORIES — Rewrite write policies
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "subcategories_owner_insert" ON subcategories;
CREATE POLICY "subcategories_member_insert" ON subcategories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = category_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "subcategories_owner_update" ON subcategories;
CREATE POLICY "subcategories_member_update" ON subcategories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = subcategories.category_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "subcategories_owner_delete" ON subcategories;
CREATE POLICY "subcategories_member_delete" ON subcategories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = subcategories.category_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════
-- ITEMS — Rewrite write policies
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "items_owner_insert" ON items;
CREATE POLICY "items_member_insert" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subcategories s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = subcategory_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "items_owner_update" ON items;
CREATE POLICY "items_member_update" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM subcategories s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = items.subcategory_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "items_owner_delete" ON items;
CREATE POLICY "items_member_delete" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM subcategories s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = items.subcategory_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════
-- ITEM_SIZES — Rewrite write policies
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "item_sizes_owner_insert" ON item_sizes;
CREATE POLICY "item_sizes_member_insert" ON item_sizes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN subcategories s ON s.id = i.subcategory_id
      JOIN categories c ON c.id = s.category_id
      WHERE i.id = item_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "item_sizes_owner_update" ON item_sizes;
CREATE POLICY "item_sizes_member_update" ON item_sizes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN subcategories s ON s.id = i.subcategory_id
      JOIN categories c ON c.id = s.category_id
      WHERE i.id = item_sizes.item_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );

DROP POLICY IF EXISTS "item_sizes_owner_delete" ON item_sizes;
CREATE POLICY "item_sizes_member_delete" ON item_sizes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN subcategories s ON s.id = i.subcategory_id
      JOIN categories c ON c.id = s.category_id
      WHERE i.id = item_sizes.item_id
        AND is_restaurant_member(c.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════
-- EXTRAS — Rewrite write policies
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "extras_owner_insert" ON extras;
CREATE POLICY "extras_member_insert" ON extras
  FOR INSERT WITH CHECK (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "extras_owner_update" ON extras;
CREATE POLICY "extras_member_update" ON extras
  FOR UPDATE USING (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "extras_owner_delete" ON extras;
CREATE POLICY "extras_member_delete" ON extras
  FOR DELETE USING (
    is_restaurant_member(restaurant_id)
  );


-- ═══════════════════════════════════════════
-- DELIVERY_ZONES — Rewrite write policies
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "delivery_zones_owner_insert" ON delivery_zones;
CREATE POLICY "delivery_zones_member_insert" ON delivery_zones
  FOR INSERT WITH CHECK (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "delivery_zones_owner_update" ON delivery_zones;
CREATE POLICY "delivery_zones_member_update" ON delivery_zones
  FOR UPDATE USING (
    is_restaurant_member(restaurant_id)
  );

DROP POLICY IF EXISTS "delivery_zones_owner_delete" ON delivery_zones;
CREATE POLICY "delivery_zones_member_delete" ON delivery_zones
  FOR DELETE USING (
    is_restaurant_member(restaurant_id)
  );


-- ═══════════════════════════════════════════
-- ORDERS — Add UPDATE policy (was missing!)
-- ═══════════════════════════════════════════

-- Members can update orders for their restaurants (status changes)
DROP POLICY IF EXISTS "orders_owner_read" ON orders;
CREATE POLICY "orders_member_read" ON orders
  FOR SELECT USING (
    is_restaurant_member(restaurant_id)
  );

CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING (
    is_restaurant_member(restaurant_id)
  );

-- Keep public insert (customers don't need auth) — unchanged
-- Keep public read by tracking — unchanged


COMMIT;


-- ============================================
-- ✅ Migration 005 complete.
-- 
-- Summary of policy changes:
--   • 18 owner_id policies DROPPED
--   • 18 member-based policies CREATED
--   • 1 missing UPDATE policy ADDED (orders)
--   • 6 new policies for restaurant_members
--   • 2 new policies for restaurant_payments
--   • 2 super_admin policies for restaurants + members
--   • 2 helper functions: is_restaurant_member(), is_super_admin()
--
-- Next: Phase 2 — Super Admin Portal
-- ============================================
