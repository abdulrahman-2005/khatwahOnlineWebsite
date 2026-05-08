-- ============================================
-- alakeifak: Fix Member Permissions & RLS
-- Migration 017
-- ============================================
-- 
-- This migration fixes the issue where added restaurant members 
-- (managers/admins) cannot see or modify restaurant data.
-- 
-- Issues Fixed:
-- 1. Missing policies for members on items, extras, categories, etc.
-- 2. Potential case sensitivity issues in email checks.
-- 3. Ensuring members have full CRUD access to their restaurant's data.
-- ============================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Update is_restaurant_member to be case-insensitive
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id 
      AND LOWER(email) = LOWER(auth.email())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;


-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Re-enable RLS on core tables (just in case)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════
-- STEP 3: Add Member Policies for Content Tables
-- ═══════════════════════════════════════════════════════════════

-- A helper to add policies to multiple tables
DO $$ 
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['categories', 'subcategories', 'items', 'item_sizes', 'extras', 'delivery_zones'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Drop existing member policies to avoid conflicts
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_member_all', t);
        
        -- Add comprehensive member policy
        -- Note: These tables (mostly) have a restaurant_id or can be traced to one.
        -- We'll add policies based on their specific structure.
    END LOOP;
END $$;

-- 1. Categories
CREATE POLICY "categories_member_all" ON categories
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));

-- 2. Subcategories (links to categories)
CREATE POLICY "subcategories_member_all" ON subcategories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM categories WHERE id = subcategories.category_id AND is_restaurant_member(restaurant_id))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM categories WHERE id = subcategories.category_id AND is_restaurant_member(restaurant_id))
  );

-- 3. Items (links to subcategories)
CREATE POLICY "items_member_all" ON items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      WHERE s.id = items.subcategory_id AND is_restaurant_member(c.restaurant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      WHERE s.id = items.subcategory_id AND is_restaurant_member(c.restaurant_id)
    )
  );

-- 4. Item Sizes (links to items)
CREATE POLICY "item_sizes_member_all" ON item_sizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN subcategories s ON i.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE i.id = item_sizes.item_id AND is_restaurant_member(c.restaurant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN subcategories s ON i.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE i.id = item_sizes.item_id AND is_restaurant_member(c.restaurant_id)
    )
  );

-- 5. Extras (links to restaurants)
CREATE POLICY "extras_member_all" ON extras
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));

-- 6. Delivery Zones (links to restaurants)
CREATE POLICY "delivery_zones_member_all" ON delivery_zones
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));


-- ═══════════════════════════════════════════════════════════════
-- STEP 4: Ensure Public Read is still available (for customers)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "subcategories_public_read" ON subcategories;
CREATE POLICY "subcategories_public_read" ON subcategories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "items_public_read" ON items;
CREATE POLICY "items_public_read" ON items FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "item_sizes_public_read" ON item_sizes;
CREATE POLICY "item_sizes_public_read" ON item_sizes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "extras_public_read" ON extras;
CREATE POLICY "extras_public_read" ON extras FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "delivery_zones_public_read" ON delivery_zones;
CREATE POLICY "delivery_zones_public_read" ON delivery_zones FOR SELECT USING (TRUE);


-- ═══════════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════════
-- STEP 5: Core Table Policies (Self Read & Workspace Selection)
-- ═══════════════════════════════════════════════════════════════

-- A. Restaurant Members
DROP POLICY IF EXISTS "members_self_read" ON restaurant_members;
CREATE POLICY "members_self_read" ON restaurant_members
  FOR SELECT USING (LOWER(email) = LOWER(auth.email()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "members_team_read" ON restaurant_members;
CREATE POLICY "members_team_read" ON restaurant_members
  FOR SELECT USING (
    restaurant_id IN (
      SELECT rm.restaurant_id FROM restaurant_members rm 
      WHERE LOWER(rm.email) = LOWER(auth.email()) OR rm.user_id = auth.uid()
    )
  );

-- B. Restaurants
DROP POLICY IF EXISTS "restaurants_member_read" ON restaurants;
CREATE POLICY "restaurants_member_read" ON restaurants
  FOR SELECT USING (is_restaurant_member(id));

DROP POLICY IF EXISTS "restaurants_member_update" ON restaurants;
CREATE POLICY "restaurants_member_update" ON restaurants
  FOR UPDATE USING (is_restaurant_member(id)) WITH CHECK (is_restaurant_member(id));

DROP POLICY IF EXISTS "restaurants_owner_read" ON restaurants;
CREATE POLICY "restaurants_owner_read" ON restaurants
  FOR SELECT USING (owner_id = auth.uid());


COMMIT;
