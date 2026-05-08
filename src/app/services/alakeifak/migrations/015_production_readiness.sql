-- ============================================
-- alakeifak: Production Readiness Migration
-- Migration 015
-- ============================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- 1. FIX ORDERS RLS (Remove public read, restrict to tracking_id)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "orders_public_read" ON orders;

-- Removed public read entirely. We will use RPC functions for secure insertion and retrieval.

-- ═══════════════════════════════════════════════════════════════
-- 1.5 FIX RESTAURANTS DELETE POLICY (Owner only)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "restaurants_member_delete" ON restaurants;
CREATE POLICY "restaurants_member_delete" ON restaurants
  FOR DELETE USING (owner_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- 2. FIX MENU TABLES RLS (Missing public read & member write)
-- ═══════════════════════════════════════════════════════════════

-- Categories
DROP POLICY IF EXISTS "categories_anon_read" ON categories;
DROP POLICY IF EXISTS "categories_member_insert" ON categories;
DROP POLICY IF EXISTS "categories_member_update" ON categories;
DROP POLICY IF EXISTS "categories_member_delete" ON categories;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "categories_member_manage" ON categories;
CREATE POLICY "categories_member_manage" ON categories
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));

-- Subcategories
DROP POLICY IF EXISTS "subcategories_anon_read" ON subcategories;
DROP POLICY IF EXISTS "subcategories_member_insert" ON subcategories;
DROP POLICY IF EXISTS "subcategories_member_update" ON subcategories;
DROP POLICY IF EXISTS "subcategories_member_delete" ON subcategories;
DROP POLICY IF EXISTS "subcategories_public_read" ON subcategories;
CREATE POLICY "subcategories_public_read" ON subcategories
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM categories c JOIN restaurants r ON c.restaurant_id = r.id
    WHERE c.id = category_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "subcategories_member_manage" ON subcategories;
CREATE POLICY "subcategories_member_manage" ON subcategories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM categories c WHERE c.id = category_id AND is_restaurant_member(c.restaurant_id)
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM categories c WHERE c.id = category_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Items
DROP POLICY IF EXISTS "items_anon_read" ON items;
DROP POLICY IF EXISTS "items_member_insert" ON items;
DROP POLICY IF EXISTS "items_member_update" ON items;
DROP POLICY IF EXISTS "items_member_delete" ON items;
DROP POLICY IF EXISTS "items_public_read" ON items;
CREATE POLICY "items_public_read" ON items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM subcategories sc 
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE sc.id = subcategory_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "items_member_manage" ON items;
CREATE POLICY "items_member_manage" ON items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM subcategories sc JOIN categories c ON sc.category_id = c.id
    WHERE sc.id = subcategory_id AND is_restaurant_member(c.restaurant_id)
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM subcategories sc JOIN categories c ON sc.category_id = c.id
    WHERE sc.id = subcategory_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Item Sizes
DROP POLICY IF EXISTS "item_sizes_anon_read" ON item_sizes;
DROP POLICY IF EXISTS "item_sizes_member_insert" ON item_sizes;
DROP POLICY IF EXISTS "item_sizes_member_update" ON item_sizes;
DROP POLICY IF EXISTS "item_sizes_member_delete" ON item_sizes;
DROP POLICY IF EXISTS "item_sizes_public_read" ON item_sizes;
CREATE POLICY "item_sizes_public_read" ON item_sizes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM items i 
    JOIN subcategories sc ON i.subcategory_id = sc.id
    JOIN categories c ON sc.category_id = c.id 
    JOIN restaurants r ON c.restaurant_id = r.id
    WHERE i.id = item_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "item_sizes_member_manage" ON item_sizes;
CREATE POLICY "item_sizes_member_manage" ON item_sizes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM items i JOIN subcategories sc ON i.subcategory_id = sc.id JOIN categories c ON sc.category_id = c.id
    WHERE i.id = item_id AND is_restaurant_member(c.restaurant_id)
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM items i JOIN subcategories sc ON i.subcategory_id = sc.id JOIN categories c ON sc.category_id = c.id
    WHERE i.id = item_id AND is_restaurant_member(c.restaurant_id)
  ));

-- Extras
DROP POLICY IF EXISTS "extras_anon_read" ON extras;
DROP POLICY IF EXISTS "extras_member_insert" ON extras;
DROP POLICY IF EXISTS "extras_member_update" ON extras;
DROP POLICY IF EXISTS "extras_member_delete" ON extras;
DROP POLICY IF EXISTS "extras_public_read" ON extras;
CREATE POLICY "extras_public_read" ON extras
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "extras_member_manage" ON extras;
CREATE POLICY "extras_member_manage" ON extras
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));

-- Delivery Zones
DROP POLICY IF EXISTS "delivery_zones_anon_read" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_member_insert" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_member_update" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_member_delete" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_public_read" ON delivery_zones;
CREATE POLICY "delivery_zones_public_read" ON delivery_zones
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = TRUE AND r.is_verified = TRUE
  ));

DROP POLICY IF EXISTS "delivery_zones_member_manage" ON delivery_zones;
CREATE POLICY "delivery_zones_member_manage" ON delivery_zones
  FOR ALL USING (is_restaurant_member(restaurant_id)) WITH CHECK (is_restaurant_member(restaurant_id));

-- ═══════════════════════════════════════════════════════════════
-- 3. SERVER-SIDE ORDER VALIDATION (Trigger to recalculate total)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  calculated_total NUMERIC := 0;
  item JSONB;
  ext JSONB;
  item_price NUMERIC := 0;
  extra_price NUMERIC := 0;
  delivery_fee NUMERIC := 0;
BEGIN
  -- Re-calculate total from cart snapshot
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.cart_snapshot::jsonb) LOOP
    
    -- Parse item size price
    item_price := COALESCE((item->'size'->>'price')::NUMERIC, 0);
    
    -- Parse extras price
    extra_price := 0;
    IF item->'extras' IS NOT NULL AND jsonb_typeof(item->'extras') = 'array' THEN
      FOR ext IN SELECT * FROM jsonb_array_elements(item->'extras') LOOP
        extra_price := extra_price + COALESCE((ext->>'price')::NUMERIC, 0);
      END LOOP;
    END IF;

    -- Add to calculated total: (item price + extras price) * quantity
    calculated_total := calculated_total + ( (item_price + extra_price) * COALESCE((item->>'quantity')::INT, 1) );
  END LOOP;

  -- Add delivery fee if applicable
  IF NEW.delivery_zone_id IS NOT NULL THEN
    SELECT fee INTO delivery_fee FROM delivery_zones WHERE id = NEW.delivery_zone_id;
    calculated_total := calculated_total + COALESCE(delivery_fee, 0);
  END IF;

  -- Assign the recalculated total directly, discarding client-provided value
  -- Only do this on INSERT, to allow updates (like cancelling) to change it
  IF TG_OP = 'INSERT' THEN
    NEW.total_amount := calculated_total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_order_total ON orders;
CREATE TRIGGER trigger_validate_order_total
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION validate_order_total();

-- ═══════════════════════════════════════════════════════════════
-- 4. DATABASE INDEXES FOR SCALABILITY
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_restaurants_slug_active ON restaurants(slug) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_sort ON categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_sort ON subcategories(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_items_subcategory_sort ON items(subcategory_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_members_email ON restaurant_members(email);

-- ═══════════════════════════════════════════════════════════════
-- 5. ORDER RATE LIMITING (Anti-Spam)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_order_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_orders_count INT;
BEGIN
  -- Check how many orders this phone number placed in the last 10 minutes
  SELECT COUNT(*) INTO recent_orders_count
  FROM orders
  WHERE customer_phone = NEW.customer_phone
    AND created_at > NOW() - INTERVAL '10 minutes';

  IF recent_orders_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Please wait before placing another order.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_order_rate_limit ON orders;
CREATE TRIGGER trigger_check_order_rate_limit
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION check_order_rate_limit();

COMMIT;
