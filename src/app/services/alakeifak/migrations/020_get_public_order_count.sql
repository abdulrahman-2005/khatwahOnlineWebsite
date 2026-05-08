BEGIN;

-- Create a secure RPC to fetch the total order count for a restaurant
-- This is used to display the "Order #X" in the WhatsApp message securely
-- without exposing actual order data to anonymous users via RLS.
CREATE OR REPLACE FUNCTION get_public_order_count(p_restaurant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  order_count INTEGER;
BEGIN
  SELECT count(*) INTO order_count FROM orders WHERE restaurant_id = p_restaurant_id;
  RETURN order_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
