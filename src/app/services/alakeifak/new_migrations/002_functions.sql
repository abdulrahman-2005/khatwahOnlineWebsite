-- ============================================================
-- alakeifak: Consolidated Functions & Triggers
-- 002_functions.sql — All active functions, triggers, and GRANTs
-- ============================================================
-- This file creates all database functions used by the application.
-- Functions marked SECURITY DEFINER bypass RLS for internal lookups.
--
-- Consolidated from: 001, 003, 004, 010, 014, 015b, 016a, 017, 019, 020
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. TRIGGER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- 1.1 Auto-generate tracking_id on order insert
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_id := '#ORD-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tracking_id ON orders;
CREATE TRIGGER set_tracking_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.tracking_id IS NULL OR NEW.tracking_id = '')
  EXECUTE FUNCTION generate_tracking_id();


-- 1.2 Auto-update updated_at for restaurants
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS restaurants_updated_at ON restaurants;
CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- 1.3 Server-side order total validation
-- Recalculates total_amount from cart_snapshot on INSERT,
-- discarding any client-provided value to prevent tampering.
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
        extra_price := extra_price + COALESCE((ext->>'price')::NUMERIC, 0) 
                                   * COALESCE((ext->>'quantity')::INT, 1);
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

  -- Assign the recalculated total directly (INSERT only)
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


-- 1.4 Order rate limiting (anti-spam)
-- Limits to 5 orders per phone number per 10 minutes.
CREATE OR REPLACE FUNCTION check_order_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_orders_count INT;
BEGIN
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


-- ═══════════════════════════════════════════════════════════════
-- 2. RLS HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS)
-- ═══════════════════════════════════════════════════════════════

-- 2.1 Check if current user is a member of a restaurant
-- Used by all member-based RLS policies. Case-insensitive email match.
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

GRANT EXECUTE ON FUNCTION is_restaurant_member(UUID) TO authenticated, anon;


-- 2.2 Check if current user is an owner of a restaurant
-- Used for member management policies (only owners can add/remove members).
CREATE OR REPLACE FUNCTION check_is_restaurant_owner(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = p_restaurant_id 
      AND LOWER(email) = LOWER(auth.email())
      AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION check_is_restaurant_owner(UUID) TO authenticated, anon;


-- 2.3 Check if current user is a super admin
-- Reads from app_settings table (SECURITY DEFINER bypasses its RLS).
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_admin_emails TEXT;
  v_admin_array TEXT[];
  v_trimmed_email TEXT;
BEGIN
  v_email := auth.email();
  IF v_email IS NULL THEN RETURN FALSE; END IF;

  BEGIN
    SELECT value INTO v_admin_emails FROM app_settings WHERE key = 'super_admin_emails';
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;

  IF v_admin_emails IS NULL OR v_admin_emails = '' THEN RETURN FALSE; END IF;

  v_admin_array := string_to_array(v_admin_emails, ',');
  FOREACH v_trimmed_email IN ARRAY v_admin_array LOOP
    IF LOWER(TRIM(v_trimmed_email)) = LOWER(v_email) THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, anon;


-- ═══════════════════════════════════════════════════════════════
-- 3. APPLICATION RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- 3.1 Seed default Arish delivery zones for a new restaurant
-- Called by SetupWizard.jsx when creating a new restaurant.
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.2 Auto-link member user_id on login
-- Called from the frontend after auth state change.
-- If a user's email exists in restaurant_members but user_id is NULL, fill it in.
CREATE OR REPLACE FUNCTION link_member_on_login(p_email TEXT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurant_members
  SET user_id = p_user_id
  WHERE email = p_email
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.3 Record payment & extend subscription (atomic)
-- Atomically inserts a payment record and extends subscription_end_date.
-- If currently NULL or expired, starts from NOW. If still active, extends from current end.
CREATE OR REPLACE FUNCTION record_payment(
  p_restaurant_id UUID,
  p_amount NUMERIC,
  p_duration_days INTEGER,
  p_recorded_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS restaurant_payments AS $$
DECLARE
  v_current_end TIMESTAMPTZ;
  v_new_end TIMESTAMPTZ;
  v_payment restaurant_payments;
BEGIN
  -- Get current subscription end
  SELECT subscription_end_date INTO v_current_end
  FROM restaurants WHERE id = p_restaurant_id;

  -- Calculate new end date
  IF v_current_end IS NULL OR v_current_end < now() THEN
    v_new_end := now() + (p_duration_days || ' days')::INTERVAL;
  ELSE
    v_new_end := v_current_end + (p_duration_days || ' days')::INTERVAL;
  END IF;

  -- Update restaurant
  UPDATE restaurants
  SET subscription_end_date = v_new_end
  WHERE id = p_restaurant_id;

  -- Insert payment record with audit trail
  INSERT INTO restaurant_payments (
    restaurant_id, amount, duration_days, recorded_by, notes,
    subscription_end_before, subscription_end_after
  ) VALUES (
    p_restaurant_id, p_amount, p_duration_days, p_recorded_by, p_notes,
    v_current_end, v_new_end
  ) RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.4 Secure order placement (SECURITY DEFINER)
-- Public customers call this RPC to place orders without needing SELECT access.
-- Returns the created order as JSONB (including server-generated tracking_id).
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.5 Secure order fetch by UUID
-- Allows customers to poll for their digital ticket status.
-- Kept for future order-tracking page.
CREATE OR REPLACE FUNCTION get_order_secure(order_id UUID)
RETURNS JSONB AS $$
DECLARE
  found_order RECORD;
BEGIN
  SELECT * INTO found_order FROM orders WHERE id = order_id;
  RETURN to_jsonb(found_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.6 Restaurant Analytics (server-side aggregation)
-- Calculates order analytics without downloading all orders to the browser.
-- Uses SECURITY INVOKER so RLS policies apply (member must have access).
CREATE OR REPLACE FUNCTION get_restaurant_analytics(
  p_restaurant_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  preparing_orders BIGINT,
  ready_orders BIGINT,
  confirmed_orders BIGINT,
  successful_orders BIGINT,
  cancelled_orders BIGINT,
  losses_count BIGINT,
  total_loss_amount NUMERIC,
  order_revenue NUMERIC,
  delivery_fees NUMERIC,
  aov NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_orders AS (
    SELECT o.status, o.total_amount, o.order_type, COALESCE(dz.fee, 0) as delivery_fee
    FROM orders o
    LEFT JOIN delivery_zones dz ON dz.id = o.delivery_zone_id
    WHERE o.restaurant_id = p_restaurant_id
      AND (p_start_date IS NULL OR o.created_at >= p_start_date)
      AND (p_end_date IS NULL OR o.created_at <= p_end_date)
  ),
  aggregated AS (
    SELECT
      COUNT(*) AS total_orders,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'preparing') AS preparing_orders,
      COUNT(*) FILTER (WHERE status = 'ready') AS ready_orders,
      COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_orders,
      COUNT(*) FILTER (WHERE status IN ('delivered', 'confirmed', 'completed')) AS successful_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled' AND total_amount < 0) AS losses_count,
      COALESCE(SUM(ABS(total_amount)) FILTER (WHERE status = 'cancelled' AND total_amount < 0), 0) AS total_loss_amount,
      COALESCE(SUM(GREATEST(0, total_amount - delivery_fee)) FILTER (WHERE status IN ('delivered', 'confirmed', 'completed')), 0) AS order_revenue,
      COALESCE(SUM(delivery_fee) FILTER (WHERE status IN ('delivered', 'confirmed', 'completed') AND order_type = 'delivery'), 0) AS delivery_fees
    FROM filtered_orders
  )
  SELECT
    aggregated.total_orders,
    aggregated.pending_orders,
    aggregated.preparing_orders,
    aggregated.ready_orders,
    aggregated.confirmed_orders,
    aggregated.successful_orders,
    aggregated.cancelled_orders,
    aggregated.losses_count,
    aggregated.total_loss_amount,
    aggregated.order_revenue,
    aggregated.delivery_fees,
    CASE WHEN aggregated.successful_orders > 0 THEN ROUND(aggregated.order_revenue / aggregated.successful_orders, 2) ELSE 0 END AS aov,
    CASE WHEN aggregated.total_orders > 0 THEN ROUND((aggregated.successful_orders::NUMERIC / aggregated.total_orders::NUMERIC) * 100, 2) ELSE 0 END AS success_rate
  FROM aggregated;
END;
$$;


-- 3.7 Public order count (for WhatsApp message "Order #X")
-- SECURITY DEFINER so anonymous users can get the count without reading orders.
CREATE OR REPLACE FUNCTION get_public_order_count(p_restaurant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  order_count INTEGER;
BEGIN
  SELECT count(*) INTO order_count FROM orders WHERE restaurant_id = p_restaurant_id;
  RETURN order_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ============================================================
-- ✅ 002_functions.sql complete.
-- Next: Run 003_rls_policies.sql
-- ============================================================
