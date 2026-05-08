-- ============================================================
-- alakeifak: Consolidated Schema
-- 001_schema.sql — Tables, Columns, Constraints, Indexes, Triggers
-- ============================================================
-- This file creates the entire Alakeifak database from scratch.
-- It is the single source of truth for all structural objects.
--
-- Consolidated from: 001, 004, 006, 007, 015b, 016b
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. TABLES
-- ═══════════════════════════════════════════════════════════════

-- 1.1 Restaurants — Core tenant entity
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#0247FE',
  is_verified BOOLEAN DEFAULT FALSE,
  is_open BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_end_date TIMESTAMPTZ,
  show_delivery_pricing BOOLEAN DEFAULT TRUE,
  tags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🔥',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.5 Item Sizes (replaces base price)
CREATE TABLE IF NOT EXISTS item_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- 1.6 Extras (standalone side items with smart suggestion mapping)
CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  suggested_subcategories UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.7 Delivery Zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  region_name TEXT NOT NULL,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.8 Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  tracking_id TEXT UNIQUE NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cart_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  order_type TEXT DEFAULT 'delivery',
  table_number TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.9 Restaurant Members (Team-based access, replaces owner_id checks)
CREATE TABLE IF NOT EXISTS restaurant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'admin',  -- 'owner' | 'admin'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, email)
);

-- 1.10 Restaurant Payments (Offline billing ledger)
CREATE TABLE IF NOT EXISTS restaurant_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  subscription_end_before TIMESTAMPTZ,
  subscription_end_after TIMESTAMPTZ
);

-- 1.11 App Settings (Super admin configuration)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);


-- ═══════════════════════════════════════════════════════════════
-- 2. CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_type_check
  CHECK (order_type IN ('delivery', 'pickup', 'in_house'));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',     -- Just placed, awaiting partner action
    'preparing',   -- Accepted by partner, kitchen working on it
    'ready',       -- Ready for pickup/delivery/serving
    'completed',   -- Fulfilled and archived
    'confirmed',   -- LEGACY: kept for backward compat
    'delivered',   -- LEGACY: kept for backward compat
    'cancelled'    -- Rejected or cancelled
  ));


-- ═══════════════════════════════════════════════════════════════
-- 3. INDEXES
-- ═══════════════════════════════════════════════════════════════

-- Restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_verified ON restaurants(is_verified);
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug_active ON restaurants(slug) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_restaurants_tags ON restaurants USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_restaurants_tags_main_search ON restaurants USING GIN ((tags -> 'mainSearch'));

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_sort ON categories(restaurant_id, sort_order);

-- Subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_sort ON subcategories(category_id, sort_order);

-- Items
CREATE INDEX IF NOT EXISTS idx_items_subcategory ON items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_items_subcategory_sort ON items(subcategory_id, sort_order);

-- Item Sizes
CREATE INDEX IF NOT EXISTS idx_item_sizes_item ON item_sizes(item_id);

-- Extras
CREATE INDEX IF NOT EXISTS idx_extras_restaurant ON extras(restaurant_id);

-- Delivery Zones
CREATE INDEX IF NOT EXISTS idx_delivery_zones_restaurant ON delivery_zones(restaurant_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_active
  ON orders(restaurant_id, status)
  WHERE status NOT IN ('completed', 'cancelled', 'delivered');
CREATE INDEX IF NOT EXISTS idx_orders_cancelled
  ON orders(restaurant_id, cancelled_at)
  WHERE cancelled_at IS NOT NULL;

-- Restaurant Members
CREATE INDEX IF NOT EXISTS idx_rest_members_lookup ON restaurant_members(restaurant_id, email);
CREATE INDEX IF NOT EXISTS idx_rest_members_email ON restaurant_members(email);
CREATE INDEX IF NOT EXISTS idx_restaurant_members_rest_id ON restaurant_members(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_members_email ON restaurant_members(email);

-- Restaurant Payments
CREATE INDEX IF NOT EXISTS idx_rest_payments_restaurant ON restaurant_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_rest_payments_date ON restaurant_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_date ON restaurant_payments(payment_date DESC);


-- ═══════════════════════════════════════════════════════════════
-- 4. ENABLE ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- ✅ 001_schema.sql complete.
-- Next: Run 002_functions.sql
-- ============================================================
