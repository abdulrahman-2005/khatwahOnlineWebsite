-- ============================================================
-- 007_restaurant_tags.sql — Simple Tags for Restaurants
-- ============================================================
-- Adds a simple TEXT[] `tags` column to restaurants.
-- Structure: {"pizza", "burger", "italian"}
-- ============================================================

-- 1. Drop the existing jsonb column if it exists to cleanly recreate
ALTER TABLE restaurants DROP COLUMN IF EXISTS tags;

-- 2. Add tags column as a simple TEXT array
ALTER TABLE restaurants ADD COLUMN tags TEXT[] DEFAULT '{}';

-- 3. GIN index for fast array containment queries
CREATE INDEX IF NOT EXISTS idx_restaurants_tags ON restaurants USING GIN (tags);

-- ============================================================
-- ✅ 007_restaurant_tags.sql complete.
-- ============================================================
