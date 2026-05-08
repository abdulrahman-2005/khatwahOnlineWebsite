BEGIN;

-- 1. DROP ALL PUBLIC READ ACCESS TO ORDERS
-- This prevents the data leak you discovered.
DROP POLICY IF EXISTS "orders_public_read" ON orders;
DROP POLICY IF EXISTS "orders_public_read_by_tracking" ON orders;

-- 2. CREATE SECURE RPC FOR INSERTING ORDERS
-- This function runs as SECURITY DEFINER, meaning it can insert the order
-- and return the generated ID/Tracking ID without needing public SELECT access.
CREATE OR REPLACE FUNCTION place_order_secure(payload JSONB)
RETURNS JSONB AS $$
DECLARE
  new_order RECORD;
BEGIN
  INSERT INTO orders (
    restaurant_id, 
    total_amount, 
    cart_snapshot, 
    customer_name, 
    customer_phone, 
    order_type, 
    delivery_address, 
    delivery_zone_id, 
    table_number
  )
  VALUES (
    (payload->>'restaurant_id')::uuid,
    (payload->>'total_amount')::numeric,
    payload->'cart_snapshot',
    payload->>'customer_name',
    payload->>'customer_phone',
    payload->>'order_type',
    payload->>'delivery_address',
    NULLIF(payload->>'delivery_zone_id', '')::uuid,
    payload->>'table_number'
  )
  RETURNING * INTO new_order;
  
  RETURN to_jsonb(new_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE SECURE RPC FOR FETCHING A SINGLE ORDER BY ID
-- This allows a user to poll for their digital ticket status 
-- ONLY if they know the exact unguessable UUID.
CREATE OR REPLACE FUNCTION get_order_secure(order_id UUID)
RETURNS JSONB AS $$
DECLARE
  found_order RECORD;
BEGIN
  SELECT * INTO found_order FROM orders WHERE id = order_id;
  RETURN to_jsonb(found_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
