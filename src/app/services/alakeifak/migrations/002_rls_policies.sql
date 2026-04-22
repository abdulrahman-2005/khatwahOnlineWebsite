-- ============================================
-- alakeifak: Row Level Security Policies
-- Run AFTER 001_create_tables.sql
-- ============================================

-- ─── RESTAURANTS ───
-- Public: anyone can read verified restaurants
CREATE POLICY "restaurants_public_read" ON restaurants
  FOR SELECT USING (is_verified = TRUE);

-- Owner: can read their own (even unverified)
CREATE POLICY "restaurants_owner_read" ON restaurants
  FOR SELECT USING (auth.uid() = owner_id);

-- Owner: can insert their own
CREATE POLICY "restaurants_owner_insert" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owner: can update their own
CREATE POLICY "restaurants_owner_update" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ─── CATEGORIES ───
-- Public: read categories of verified restaurants
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = categories.restaurant_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

-- Owner: full CRUD on own restaurant's categories
CREATE POLICY "categories_owner_insert" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "categories_owner_update" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "categories_owner_delete" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- ─── SUBCATEGORIES ───
-- Public: read subcategories of verified restaurants
CREATE POLICY "subcategories_public_read" ON subcategories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM categories 
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE categories.id = subcategories.category_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

-- Owner: full CRUD on own restaurant's subcategories
CREATE POLICY "subcategories_owner_insert" ON subcategories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM categories 
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE categories.id = category_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "subcategories_owner_update" ON subcategories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM categories 
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE categories.id = subcategories.category_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "subcategories_owner_delete" ON subcategories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM categories 
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE categories.id = subcategories.category_id AND restaurants.owner_id = auth.uid()
    )
  );

-- ─── ITEMS ───
-- Public: read items of verified restaurants
CREATE POLICY "items_public_read" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subcategories 
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE subcategories.id = items.subcategory_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

-- Owner: full CRUD
CREATE POLICY "items_owner_insert" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subcategories 
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE subcategories.id = subcategory_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "items_owner_update" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM subcategories 
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE subcategories.id = items.subcategory_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "items_owner_delete" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM subcategories 
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE subcategories.id = items.subcategory_id AND restaurants.owner_id = auth.uid()
    )
  );

-- ─── ITEM_SIZES ───
CREATE POLICY "item_sizes_public_read" ON item_sizes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      JOIN subcategories ON subcategories.id = items.subcategory_id
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE items.id = item_sizes.item_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

CREATE POLICY "item_sizes_owner_insert" ON item_sizes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      JOIN subcategories ON subcategories.id = items.subcategory_id
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE items.id = item_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "item_sizes_owner_update" ON item_sizes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN subcategories ON subcategories.id = items.subcategory_id
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE items.id = item_sizes.item_id AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "item_sizes_owner_delete" ON item_sizes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN subcategories ON subcategories.id = items.subcategory_id
      JOIN categories ON categories.id = subcategories.category_id
      JOIN restaurants ON restaurants.id = categories.restaurant_id
      WHERE items.id = item_sizes.item_id AND restaurants.owner_id = auth.uid()
    )
  );

-- ─── EXTRAS ───
CREATE POLICY "extras_public_read" ON extras
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = extras.restaurant_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

CREATE POLICY "extras_owner_insert" ON extras
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "extras_owner_update" ON extras
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "extras_owner_delete" ON extras
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- ─── DELIVERY_ZONES ───
CREATE POLICY "delivery_zones_public_read" ON delivery_zones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = delivery_zones.restaurant_id 
      AND (restaurants.is_verified = TRUE OR restaurants.owner_id = auth.uid())
    )
  );

CREATE POLICY "delivery_zones_owner_insert" ON delivery_zones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "delivery_zones_owner_update" ON delivery_zones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "delivery_zones_owner_delete" ON delivery_zones
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- ─── ORDERS ───
-- Public: anyone can insert orders (customers don't need auth)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Owner: can read orders for their restaurant
CREATE POLICY "orders_owner_read" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- Public: customers can read their own order by tracking_id (via RPC or direct query)
CREATE POLICY "orders_public_read_by_tracking" ON orders
  FOR SELECT USING (TRUE);
