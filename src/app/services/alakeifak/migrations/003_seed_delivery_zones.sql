-- ============================================
-- alakeifak: Default Arish Delivery Zones
-- Run AFTER 002_rls_policies.sql
-- ============================================

-- Function to seed default Arish delivery zones for a new restaurant
CREATE OR REPLACE FUNCTION seed_default_delivery_zones(p_restaurant_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO delivery_zones (restaurant_id, region_name, fee) VALUES
    (p_restaurant_id, 'وسط البلد', 10.00),
    (p_restaurant_id, 'المساعيد', 15.00),
    (p_restaurant_id, 'الريسة', 15.00),
    (p_restaurant_id, 'حي السلام', 15.00),
    (p_restaurant_id, 'الزهور', 20.00),
    (p_restaurant_id, 'حي الجامعة', 20.00),
    (p_restaurant_id, 'السبيل', 15.00),
    (p_restaurant_id, 'الفاتح', 15.00),
    (p_restaurant_id, 'القناطر', 20.00),
    (p_restaurant_id, 'العبور', 20.00),
    (p_restaurant_id, 'الكيلو 4', 25.00),
    (p_restaurant_id, 'المساعيد الجديدة', 25.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
