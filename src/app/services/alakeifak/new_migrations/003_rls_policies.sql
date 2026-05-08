-- ============================================================
-- alakeifak: Consolidated RLS Policies
-- 003_rls_policies.sql — All Row Level Security policies
-- ============================================================
-- This file creates ALL RLS policies from scratch.
-- It assumes 001_schema.sql has already enabled RLS on all tables.
--
-- Access Model:
--   • Public (anon): Can read active restaurant menus, insert orders
--   • Members (authenticated): Full CRUD on their restaurant's data
--   • Super Admins: Full access to everything
--   • Owners: Can manage team members (add/remove/update roles)
--
-- Menu visibility rules:
--   • is_active = TRUE  → menu works (digital menu functional)
--   • is_verified = TRUE → shown on main page (marketing/advertising)
--   • Public read uses is_active only (unverified restaurants still
--     accessible via direct link, just not listed on main page)
--
-- Consolidated from: 014, 015b, 017, 018
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. APP_SETTINGS — Super admin only
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "settings_super_admin_all" ON app_settings
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 2. RESTAURANTS
-- ═══════════════════════════════════════════════════════════════

-- Public: anyone can read verified restaurants (for main page listing)
CREATE POLICY "restaurants_public_read" ON restaurants
  FOR SELECT USING (is_verified = TRUE);

-- Owner: can read their own (even unverified, needed for setup wizard)
CREATE POLICY "restaurants_owner_read" ON restaurants
  FOR SELECT USING (owner_id = auth.uid());

-- Members: can read their restaurants (workspace selector)
CREATE POLICY "restaurants_member_read" ON restaurants
  FOR SELECT USING (is_restaurant_member(id));

-- Owner: can insert (bootstrap case — creates restaurant before members exist)
CREATE POLICY "restaurants_owner_insert" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Members: can update their restaurant settings
CREATE POLICY "restaurants_member_update" ON restaurants
  FOR UPDATE USING (is_restaurant_member(id))
  WITH CHECK (is_restaurant_member(id));

-- Owner only: can delete restaurant (for cleanup/failed setup)
CREATE POLICY "restaurants_member_delete" ON restaurants
  FOR DELETE USING (owner_id = auth.uid());

-- Super admin: full access
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 3. RESTAURANT_MEMBERS — Critical: avoid recursion!
-- ═══════════════════════════════════════════════════════════════

-- Members can read their own memberships (workspace selector)
-- Case-insensitive email + user_id fallback for linked accounts
CREATE POLICY "members_self_read" ON restaurant_members
  FOR SELECT USING (
    LOWER(email) = LOWER(auth.email()) OR user_id = auth.uid()
  );

-- Members can read other members of restaurants they belong to
-- Uses direct subquery instead of function call to avoid recursion
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    restaurant_id IN (
      SELECT rm.restaurant_id FROM restaurant_members rm 
      WHERE LOWER(rm.email) = LOWER(auth.email()) OR rm.user_id = auth.uid()
    )
  );

-- Only owners can add members (or super admins, or first-member bootstrap)
CREATE POLICY "members_insert" ON restaurant_members
  FOR INSERT WITH CHECK (
    check_is_restaurant_owner(restaurant_id)
    OR is_super_admin()
    OR NOT EXISTS (SELECT 1 FROM restaurant_members rm WHERE rm.restaurant_id = restaurant_id)
  );

-- Only owners can update member roles
CREATE POLICY "members_update" ON restaurant_members
  FOR UPDATE USING (check_is_restaurant_owner(restaurant_id))
  WITH CHECK (check_is_restaurant_owner(restaurant_id));

-- Only owners can delete members (cannot remove yourself)
CREATE POLICY "members_delete" ON restaurant_members
  FOR DELETE USING (
    check_is_restaurant_owner(restaurant_id) AND email != auth.email()
  );

-- Super admin: full access
CREATE POLICY "members_super_admin" ON restaurant_members
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 4. ORDERS — No public SELECT (use RPCs instead)
-- ═══════════════════════════════════════════════════════════════

-- Public: customers can insert orders (no auth required)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Members: can read orders for their restaurants
CREATE POLICY "orders_member_read" ON orders
  FOR SELECT USING (is_restaurant_member(restaurant_id));

-- Members: can update order status
CREATE POLICY "orders_member_update" ON orders
  FOR UPDATE USING (is_restaurant_member(restaurant_id));

-- Super admin: full access
CREATE POLICY "orders_super_admin" ON orders
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ⛔ NO PUBLIC SELECT POLICY — anonymous users cannot query orders.
-- They must use place_order_secure() and get_order_secure() RPCs.


-- ═══════════════════════════════════════════════════════════════
-- 5. RESTAURANT_PAYMENTS — Members read, super admin full
-- ═══════════════════════════════════════════════════════════════

-- Members: can view their own payment history (read-only)
CREATE POLICY "payments_member_read" ON restaurant_payments
  FOR SELECT USING (is_restaurant_member(restaurant_id));

-- Super admin: full access (can record payments)
CREATE POLICY "payments_super_admin" ON restaurant_payments
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 6. CATEGORIES — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read categories of active restaurants
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));

-- Members: full CRUD on their restaurant's categories
CREATE POLICY "categories_member_manage" ON categories
  FOR ALL USING (is_restaurant_member(restaurant_id))
  WITH CHECK (is_restaurant_member(restaurant_id));

-- Super admin: full access
CREATE POLICY "categories_super_admin" ON categories
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 7. SUBCATEGORIES — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read subcategories of active restaurants
CREATE POLICY "subcategories_public_read" ON subcategories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM categories c 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE c.id = category_id AND r.is_active = TRUE
  ));

-- Members: full CRUD via category → restaurant chain
CREATE POLICY "subcategories_member_manage" ON subcategories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM categories c 
    WHERE c.id = subcategories.category_id AND is_restaurant_member(c.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM categories c 
    WHERE c.id = subcategories.category_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Super admin: full access
CREATE POLICY "subcategories_super_admin" ON subcategories
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 8. ITEMS — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read items of active restaurants
CREATE POLICY "items_public_read" ON items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM subcategories sc 
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE sc.id = subcategory_id AND r.is_active = TRUE
  ));

-- Members: full CRUD via subcategory → category → restaurant chain
CREATE POLICY "items_member_manage" ON items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM subcategories sc 
    JOIN categories c ON sc.category_id = c.id
    WHERE sc.id = items.subcategory_id AND is_restaurant_member(c.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM subcategories sc 
    JOIN categories c ON sc.category_id = c.id
    WHERE sc.id = items.subcategory_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Super admin: full access
CREATE POLICY "items_super_admin" ON items
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 9. ITEM_SIZES — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read item sizes of active restaurants
CREATE POLICY "item_sizes_public_read" ON item_sizes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM items i 
    JOIN subcategories sc ON i.subcategory_id = sc.id
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE i.id = item_id AND r.is_active = TRUE
  ));

-- Members: full CRUD via item → subcategory → category → restaurant chain
CREATE POLICY "item_sizes_member_manage" ON item_sizes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM items i 
    JOIN subcategories sc ON i.subcategory_id = sc.id 
    JOIN categories c ON sc.category_id = c.id
    WHERE i.id = item_sizes.item_id AND is_restaurant_member(c.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM items i 
    JOIN subcategories sc ON i.subcategory_id = sc.id 
    JOIN categories c ON sc.category_id = c.id
    WHERE i.id = item_sizes.item_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Super admin: full access
CREATE POLICY "item_sizes_super_admin" ON item_sizes
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 10. EXTRAS — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read extras of active restaurants
CREATE POLICY "extras_public_read" ON extras
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));

-- Members: full CRUD on their restaurant's extras
CREATE POLICY "extras_member_manage" ON extras
  FOR ALL USING (is_restaurant_member(restaurant_id))
  WITH CHECK (is_restaurant_member(restaurant_id));

-- Super admin: full access
CREATE POLICY "extras_super_admin" ON extras
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ═══════════════════════════════════════════════════════════════
-- 11. DELIVERY_ZONES — Public read (active restaurants), member manage
-- ═══════════════════════════════════════════════════════════════

-- Public: read delivery zones of active restaurants
CREATE POLICY "delivery_zones_public_read" ON delivery_zones
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = restaurant_id AND r.is_active = TRUE
  ));

-- Members: full CRUD on their restaurant's delivery zones
CREATE POLICY "delivery_zones_member_manage" ON delivery_zones
  FOR ALL USING (is_restaurant_member(restaurant_id))
  WITH CHECK (is_restaurant_member(restaurant_id));

-- Super admin: full access
CREATE POLICY "delivery_zones_super_admin" ON delivery_zones
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());


-- ============================================================
-- ✅ 003_rls_policies.sql complete.
-- Next: Run 004_realtime.sql
-- ============================================================
