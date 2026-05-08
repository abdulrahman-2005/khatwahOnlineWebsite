-- ============================================================
-- alakeifak: Admin Analytics RPC (Enhanced v2)
-- 021_admin_analytics_rpc.sql
-- ============================================================
-- Server-side analytics that bypass the 1000-row Supabase limit.
-- Three functions: platform stats, full analytics, restaurant detail, customer detail.

-- ══════════════════════════════════════════════════════════════
-- 1. CRM Platform Stats (lightweight, for admin CRM tab)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_admin_platform_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total_orders BIGINT;
  v_cancelled_count BIGINT;
  v_losses NUMERIC;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;
  SELECT count(*) INTO v_total_orders FROM orders;
  SELECT count(*) INTO v_cancelled_count FROM orders WHERE status = 'cancelled';
  SELECT coalesce(sum(abs(total_amount)), 0) INTO v_losses FROM orders WHERE status = 'cancelled' AND total_amount < 0;
  RETURN jsonb_build_object('totalOrders', v_total_orders, 'cancelledCount', v_cancelled_count, 'losses', v_losses);
END;
$$;
GRANT EXECUTE ON FUNCTION get_admin_platform_stats() TO authenticated;

-- ══════════════════════════════════════════════════════════════
-- 2. Full Analytics Dashboard (enhanced v2)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_admin_analytics(p_date_range TEXT, p_custom_start TEXT DEFAULT NULL, p_custom_end TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ := now();
  v_prev_start TIMESTAMPTZ;
  v_prev_end TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

  -- Date range resolution
  IF p_date_range = 'custom' AND p_custom_start IS NOT NULL THEN
    v_start := p_custom_start::timestamptz;
    v_end := COALESCE(p_custom_end::timestamptz, now());
  ELSIF p_date_range = 'today' THEN
    v_start := date_trunc('day', now());
  ELSIF p_date_range = '7d' THEN
    v_start := now() - interval '7 days';
  ELSIF p_date_range = '30d' THEN
    v_start := now() - interval '30 days';
  ELSIF p_date_range = '90d' THEN
    v_start := now() - interval '90 days';
  ELSE
    v_start := '1970-01-01'::timestamptz;
  END IF;

  -- Previous period for growth comparison
  v_prev_end := v_start;
  v_prev_start := v_start - (v_end - v_start);

  SELECT jsonb_build_object(
    'globalMetrics', (
      SELECT jsonb_build_object(
        'revenue', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0),
        'losses', COALESCE(SUM(ABS(total_amount)) FILTER (WHERE status = 'cancelled' AND total_amount < 0), 0),
        'orders', COUNT(*),
        'clients', COUNT(DISTINCT customer_phone),
        'completedOrders', COUNT(*) FILTER (WHERE status IN ('completed','delivered')),
        'cancelledOrders', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'pendingOrders', COUNT(*) FILTER (WHERE status NOT IN ('completed','delivered','cancelled')),
        'aov', CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','delivered')) > 0
          THEN ROUND(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')) / COUNT(*) FILTER (WHERE status IN ('completed','delivered')), 2) ELSE 0 END,
        'approvalRate', CASE WHEN COUNT(*) > 0
          THEN ROUND((COUNT(*) FILTER (WHERE status IN ('completed','delivered'))::numeric / COUNT(*)::numeric) * 100, 1) ELSE 0 END,
        'avgItemsPerOrder', ROUND(AVG(jsonb_array_length(CASE WHEN jsonb_typeof(cart_snapshot) = 'array' THEN cart_snapshot ELSE '[]'::jsonb END))::numeric, 1),
        'newCustomers', (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_start AND created_at <= v_end
          AND customer_phone NOT IN (SELECT DISTINCT customer_phone FROM orders WHERE created_at < v_start AND customer_phone IS NOT NULL)
          AND customer_phone IS NOT NULL),
        'returningCustomers', (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_start AND created_at <= v_end
          AND customer_phone IN (SELECT DISTINCT customer_phone FROM orders WHERE created_at < v_start AND customer_phone IS NOT NULL)
          AND customer_phone IS NOT NULL)
      ) FROM orders WHERE created_at >= v_start AND created_at <= v_end
    ),
    'previousPeriod', (
      SELECT jsonb_build_object(
        'revenue', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0),
        'orders', COUNT(*),
        'clients', COUNT(DISTINCT customer_phone)
      ) FROM orders WHERE created_at >= v_prev_start AND created_at < v_prev_end
    ),
    'revenueByRestaurant', COALESCE((
      SELECT jsonb_agg(row_data ORDER BY revenue DESC) FROM (
        SELECT jsonb_build_object(
          'id', r.id, 'name', r.name, 'slug', r.slug,
          'revenue', COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('completed','delivered')), 0),
          'orders', COUNT(o.id),
          'clients', COUNT(DISTINCT o.customer_phone),
          'cancelledOrders', COUNT(o.id) FILTER (WHERE o.status = 'cancelled'),
          'cancelRate', CASE WHEN COUNT(o.id) > 0 THEN ROUND((COUNT(o.id) FILTER (WHERE o.status = 'cancelled')::numeric / COUNT(o.id)::numeric) * 100, 1) ELSE 0 END,
          'aov', CASE WHEN COUNT(o.id) FILTER (WHERE o.status IN ('completed','delivered')) > 0
            THEN ROUND(SUM(o.total_amount) FILTER (WHERE o.status IN ('completed','delivered')) / COUNT(o.id) FILTER (WHERE o.status IN ('completed','delivered')), 0) ELSE 0 END,
          'deliveryOrders', COUNT(o.id) FILTER (WHERE o.order_type = 'delivery'),
          'pickupOrders', COUNT(o.id) FILTER (WHERE o.order_type = 'pickup'),
          'dineInOrders', COUNT(o.id) FILTER (WHERE o.order_type = 'in_house')
        ) AS row_data,
        COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('completed','delivered')), 0) AS revenue
        FROM restaurants r LEFT JOIN orders o ON r.id = o.restaurant_id AND o.created_at >= v_start AND o.created_at <= v_end
        GROUP BY r.id, r.name, r.slug HAVING COUNT(o.id) > 0
      ) sub
    ), '[]'::jsonb),
    'statusBreakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', sg, 'value', cnt)) FROM (
        SELECT CASE status WHEN 'completed' THEN 'Completed' WHEN 'delivered' THEN 'Completed' WHEN 'preparing' THEN 'Preparing' WHEN 'ready' THEN 'Ready' WHEN 'cancelled' THEN 'Cancelled' ELSE 'Pending' END AS sg, COUNT(*) AS cnt
        FROM orders WHERE created_at >= v_start AND created_at <= v_end GROUP BY sg
      ) s
    ), '[]'::jsonb),
    'ordersTimeline', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('key', tk, 'label', tl, 'orders', oc, 'revenue', rv, 'cancelled', cc) ORDER BY tk) FROM (
        SELECT
          CASE WHEN p_date_range = 'today' THEN to_char(date_trunc('hour', created_at), 'HH24:00')
               ELSE to_char(date_trunc('day', created_at), 'YYYY-MM-DD') END AS tk,
          CASE WHEN p_date_range = 'today' THEN to_char(date_trunc('hour', created_at), 'HH24:00')
               ELSE to_char(date_trunc('day', created_at), 'Mon FMDD') END AS tl,
          COUNT(*) AS oc,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0) AS rv,
          COUNT(*) FILTER (WHERE status = 'cancelled') AS cc
        FROM orders WHERE created_at >= v_start AND created_at <= v_end
        GROUP BY tk, tl
      ) t
    ), '[]'::jsonb),
    'channelBreakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', ch, 'value', cnt, 'revenue', rev)) FROM (
        SELECT CASE order_type WHEN 'delivery' THEN 'Delivery' WHEN 'pickup' THEN 'Pickup' WHEN 'in_house' THEN 'Dine-in' ELSE order_type END AS ch,
          COUNT(*) AS cnt,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0) AS rev
        FROM orders WHERE created_at >= v_start AND created_at <= v_end AND order_type IS NOT NULL GROUP BY order_type
      ) c
    ), '[]'::jsonb),
    'peakHours', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', h, 'orders', cnt) ORDER BY h) FROM (
        SELECT lpad(EXTRACT(HOUR FROM created_at)::text, 2, '0') || ':00' AS h, COUNT(*) AS cnt
        FROM orders WHERE created_at >= v_start AND created_at <= v_end GROUP BY h
      ) p
    ), '[]'::jsonb),
    'dayOfWeek', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'dayName', dn, 'orders', cnt, 'revenue', rev) ORDER BY d) FROM (
        SELECT EXTRACT(DOW FROM created_at)::int AS d,
          CASE EXTRACT(DOW FROM created_at)::int WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue' WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri' WHEN 6 THEN 'Sat' END AS dn,
          COUNT(*) AS cnt,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0) AS rev
        FROM orders WHERE created_at >= v_start AND created_at <= v_end GROUP BY d, dn
      ) dow
    ), '[]'::jsonb),
    'deliveryZones', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('zone', zn, 'orders', cnt, 'revenue', rev) ORDER BY cnt DESC) FROM (
        SELECT dz.region_name AS zn, COUNT(o.id) AS cnt,
          COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('completed','delivered')), 0) AS rev
        FROM orders o JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
        WHERE o.created_at >= v_start AND o.created_at <= v_end GROUP BY dz.region_name ORDER BY cnt DESC LIMIT 15
      ) dz
    ), '[]'::jsonb),
    'topCustomers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('phone', cp, 'name', cn, 'orders', oc, 'spent', sp, 'lastOrder', lo, 'avgOrder', ao, 'restaurants', rc)) FROM (
        SELECT customer_phone AS cp, MAX(customer_name) AS cn, COUNT(*) AS oc, SUM(total_amount) AS sp,
          MAX(created_at) AS lo, ROUND(AVG(total_amount), 0) AS ao, COUNT(DISTINCT restaurant_id) AS rc
        FROM orders WHERE created_at >= v_start AND created_at <= v_end AND status IN ('completed','delivered') AND customer_phone IS NOT NULL
        GROUP BY customer_phone ORDER BY sp DESC LIMIT 20
      ) tc
    ), '[]'::jsonb),
    'topItems', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', iname, 'quantity', qty, 'revenue', rev, 'restaurantName', rname, 'restaurantSlug', rslug)) FROM (
        SELECT COALESCE(item->>'itemName', item->>'name', 'Unknown') AS iname, MAX(r.name) AS rname, MAX(r.slug) AS rslug,
          SUM(COALESCE((item->>'quantity')::int, 1)) AS qty,
          SUM(COALESCE((item->'size'->>'price')::numeric, (item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::int, 1)) AS rev
        FROM orders o JOIN restaurants r ON o.restaurant_id = r.id,
          jsonb_array_elements(CASE WHEN jsonb_typeof(o.cart_snapshot) = 'array' THEN o.cart_snapshot ELSE '[]'::jsonb END) item
        WHERE o.created_at >= v_start AND o.created_at <= v_end AND o.status IN ('completed','delivered')
        GROUP BY o.restaurant_id, COALESCE(item->>'itemName', item->>'name', 'Unknown') ORDER BY qty DESC LIMIT 20
      ) ti
    ), '[]'::jsonb),
    -- SMART: Customer Segments (whale/regular/casual/one-timer based on order count)
    'customerSegments', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('segment', seg, 'count', cnt, 'revenue', rev, 'pctRevenue', CASE WHEN total_rev > 0 THEN ROUND((rev / total_rev) * 100, 1) ELSE 0 END)) FROM (
        SELECT seg, COUNT(*) AS cnt, SUM(spent) AS rev, (SELECT SUM(s2) FROM (SELECT SUM(total_amount) AS s2 FROM orders WHERE created_at >= v_start AND created_at <= v_end AND status IN ('completed','delivered') AND customer_phone IS NOT NULL GROUP BY customer_phone) x) AS total_rev FROM (
          SELECT customer_phone,
            CASE WHEN COUNT(*) >= 10 THEN 'Whale (10+)'
                 WHEN COUNT(*) >= 5 THEN 'Regular (5-9)'
                 WHEN COUNT(*) >= 2 THEN 'Casual (2-4)'
                 ELSE 'One-timer' END AS seg,
            SUM(total_amount) AS spent
          FROM orders WHERE created_at >= v_start AND created_at <= v_end AND status IN ('completed','delivered') AND customer_phone IS NOT NULL
          GROUP BY customer_phone
        ) cs GROUP BY seg ORDER BY rev DESC
      ) segs
    ), '[]'::jsonb),
    -- SMART: Retention rate (% of prev-period customers who came back this period)
    'retention', (
      SELECT jsonb_build_object(
        'prevPeriodCustomers', (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_prev_start AND created_at < v_prev_end AND customer_phone IS NOT NULL),
        'retained', (SELECT COUNT(DISTINCT o1.customer_phone) FROM orders o1 WHERE o1.created_at >= v_start AND o1.created_at <= v_end AND o1.customer_phone IS NOT NULL
          AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_phone = o1.customer_phone AND o2.created_at >= v_prev_start AND o2.created_at < v_prev_end)),
        'retentionRate', CASE WHEN (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_prev_start AND created_at < v_prev_end AND customer_phone IS NOT NULL) > 0
          THEN ROUND((SELECT COUNT(DISTINCT o1.customer_phone) FROM orders o1 WHERE o1.created_at >= v_start AND o1.created_at <= v_end AND o1.customer_phone IS NOT NULL
            AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_phone = o1.customer_phone AND o2.created_at >= v_prev_start AND o2.created_at < v_prev_end))::numeric
            / (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_prev_start AND created_at < v_prev_end AND customer_phone IS NOT NULL)::numeric * 100, 1)
          ELSE 0 END,
        'churned', (SELECT COUNT(DISTINCT customer_phone) FROM orders WHERE created_at >= v_prev_start AND created_at < v_prev_end AND customer_phone IS NOT NULL
          AND customer_phone NOT IN (SELECT DISTINCT customer_phone FROM orders WHERE created_at >= v_start AND created_at <= v_end AND customer_phone IS NOT NULL))
      )
    ),
    -- SMART: Revenue concentration (top 10% and top 20% of customers generate what % of revenue)
    'revenueConcentration', (
      WITH ranked AS (
        SELECT customer_phone, SUM(total_amount) AS spent,
          NTILE(10) OVER (ORDER BY SUM(total_amount) DESC) AS decile
        FROM orders WHERE created_at >= v_start AND created_at <= v_end AND status IN ('completed','delivered') AND customer_phone IS NOT NULL
        GROUP BY customer_phone
      ), total AS (SELECT SUM(spent) AS t FROM ranked)
      SELECT jsonb_build_object(
        'top10pct', ROUND(COALESCE((SELECT SUM(spent) FROM ranked WHERE decile = 1), 0) / NULLIF((SELECT t FROM total), 0) * 100, 1),
        'top20pct', ROUND(COALESCE((SELECT SUM(spent) FROM ranked WHERE decile <= 2), 0) / NULLIF((SELECT t FROM total), 0) * 100, 1),
        'bottom50pct', ROUND(COALESCE((SELECT SUM(spent) FROM ranked WHERE decile > 5), 0) / NULLIF((SELECT t FROM total), 0) * 100, 1)
      )
    ),
    -- SMART: Restaurant health scores (0-100 composite of fulfillment, growth, client diversity)
    'restaurantHealth', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', rid, 'name', rn, 'slug', rsl, 'score', score, 'fulfillment', ful, 'orderCount', oc, 'clientCount', cc, 'cancelRate', cr) ORDER BY score DESC) FROM (
        SELECT r.id AS rid, r.name AS rn, r.slug AS rsl,
          COUNT(o.id) AS oc,
          COUNT(DISTINCT o.customer_phone) AS cc,
          ROUND(CASE WHEN COUNT(o.id) > 0 THEN (COUNT(o.id) FILTER (WHERE o.status IN ('completed','delivered'))::numeric / COUNT(o.id)::numeric) * 100 ELSE 0 END, 1) AS ful,
          ROUND(CASE WHEN COUNT(o.id) > 0 THEN (COUNT(o.id) FILTER (WHERE o.status = 'cancelled')::numeric / COUNT(o.id)::numeric) * 100 ELSE 0 END, 1) AS cr,
          -- Score: 40% fulfillment + 30% client diversity (capped at 50) + 30% volume (capped at 100)
          ROUND(
            (CASE WHEN COUNT(o.id) > 0 THEN (COUNT(o.id) FILTER (WHERE o.status IN ('completed','delivered'))::numeric / COUNT(o.id)::numeric) ELSE 0 END) * 40
            + LEAST(COUNT(DISTINCT o.customer_phone)::numeric / 50, 1) * 30
            + LEAST(COUNT(o.id)::numeric / 100, 1) * 30
          , 0) AS score
        FROM restaurants r LEFT JOIN orders o ON r.id = o.restaurant_id AND o.created_at >= v_start AND o.created_at <= v_end
        GROUP BY r.id, r.name, r.slug HAVING COUNT(o.id) > 0
      ) rh
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_admin_analytics(TEXT, TEXT, TEXT) TO authenticated;

-- ══════════════════════════════════════════════════════════════
-- 3. Restaurant Detail Drill-down
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_admin_restaurant_detail(p_restaurant_id UUID, p_date_range TEXT DEFAULT '30d', p_custom_start TEXT DEFAULT NULL, p_custom_end TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ := now();
  v_result JSONB;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

  IF p_date_range = 'custom' AND p_custom_start IS NOT NULL THEN
    v_start := p_custom_start::timestamptz; v_end := COALESCE(p_custom_end::timestamptz, now());
  ELSIF p_date_range = 'today' THEN v_start := date_trunc('day', now());
  ELSIF p_date_range = '7d' THEN v_start := now() - interval '7 days';
  ELSIF p_date_range = '90d' THEN v_start := now() - interval '90 days';
  ELSE v_start := now() - interval '30 days';
  END IF;

  SELECT jsonb_build_object(
    'restaurant', (SELECT jsonb_build_object('id', id, 'name', name, 'slug', slug, 'whatsapp_number', whatsapp_number, 'is_active', is_active, 'is_open', is_open, 'created_at', created_at, 'subscription_end_date', subscription_end_date) FROM restaurants WHERE id = p_restaurant_id),
    'metrics', (
      SELECT jsonb_build_object(
        'revenue', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0),
        'orders', COUNT(*),
        'clients', COUNT(DISTINCT customer_phone),
        'cancelledOrders', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'aov', CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','delivered')) > 0 THEN ROUND(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')) / COUNT(*) FILTER (WHERE status IN ('completed','delivered')), 2) ELSE 0 END,
        'fulfillmentRate', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status IN ('completed','delivered'))::numeric / COUNT(*)::numeric) * 100, 1) ELSE 0 END
      ) FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end
    ),
    'timeline', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('key', tk, 'label', tl, 'orders', oc, 'revenue', rv) ORDER BY tk) FROM (
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS tk, to_char(date_trunc('day', created_at), 'Mon FMDD') AS tl,
          COUNT(*) AS oc, COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0) AS rv
        FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end GROUP BY date_trunc('day', created_at)
      ) t
    ), '[]'::jsonb),
    'statusBreakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', sg, 'value', cnt)) FROM (
        SELECT CASE status WHEN 'completed' THEN 'Completed' WHEN 'delivered' THEN 'Completed' WHEN 'preparing' THEN 'Preparing' WHEN 'ready' THEN 'Ready' WHEN 'cancelled' THEN 'Cancelled' ELSE 'Pending' END AS sg, COUNT(*) AS cnt
        FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end GROUP BY sg
      ) s
    ), '[]'::jsonb),
    'channelBreakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', ch, 'value', cnt)) FROM (
        SELECT CASE order_type WHEN 'delivery' THEN 'Delivery' WHEN 'pickup' THEN 'Pickup' WHEN 'in_house' THEN 'Dine-in' ELSE order_type END AS ch, COUNT(*) AS cnt
        FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end AND order_type IS NOT NULL GROUP BY order_type
      ) c
    ), '[]'::jsonb),
    'topItems', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', iname, 'quantity', qty, 'revenue', rev)) FROM (
        SELECT COALESCE(item->>'itemName', item->>'name', 'Unknown') AS iname,
          SUM(COALESCE((item->>'quantity')::int, 1)) AS qty,
          SUM(COALESCE((item->'size'->>'price')::numeric, (item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::int, 1)) AS rev
        FROM orders o, jsonb_array_elements(CASE WHEN jsonb_typeof(o.cart_snapshot) = 'array' THEN o.cart_snapshot ELSE '[]'::jsonb END) item
        WHERE o.restaurant_id = p_restaurant_id AND o.created_at >= v_start AND o.created_at <= v_end AND o.status IN ('completed','delivered')
        GROUP BY iname ORDER BY qty DESC LIMIT 15
      ) ti
    ), '[]'::jsonb),
    'topCustomers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('phone', cp, 'name', cn, 'orders', oc, 'spent', sp)) FROM (
        SELECT customer_phone AS cp, MAX(customer_name) AS cn, COUNT(*) AS oc, SUM(total_amount) AS sp
        FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end AND status IN ('completed','delivered') AND customer_phone IS NOT NULL
        GROUP BY customer_phone ORDER BY sp DESC LIMIT 15
      ) tc
    ), '[]'::jsonb),
    'peakHours', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', h, 'orders', cnt) ORDER BY h) FROM (
        SELECT lpad(EXTRACT(HOUR FROM created_at)::text, 2, '0') || ':00' AS h, COUNT(*) AS cnt
        FROM orders WHERE restaurant_id = p_restaurant_id AND created_at >= v_start AND created_at <= v_end GROUP BY EXTRACT(HOUR FROM created_at)
      ) p
    ), '[]'::jsonb),
    'deliveryZones', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('zone', zn, 'orders', cnt, 'fee', fee)) FROM (
        SELECT dz.region_name AS zn, dz.fee, COUNT(o.id) AS cnt
        FROM orders o JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
        WHERE o.restaurant_id = p_restaurant_id AND o.created_at >= v_start AND o.created_at <= v_end GROUP BY dz.region_name, dz.fee ORDER BY cnt DESC
      ) dz
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_admin_restaurant_detail(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- ══════════════════════════════════════════════════════════════
-- 4. Customer Detail Drill-down
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_admin_customer_detail(p_phone TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_result JSONB;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

  SELECT jsonb_build_object(
    'customer', (
      SELECT jsonb_build_object('phone', p_phone, 'name', MAX(customer_name), 'totalOrders', COUNT(*),
        'totalSpent', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0),
        'cancelledOrders', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'avgOrder', ROUND(AVG(total_amount) FILTER (WHERE status IN ('completed','delivered')), 0),
        'firstOrder', MIN(created_at), 'lastOrder', MAX(created_at),
        'restaurantsUsed', COUNT(DISTINCT restaurant_id),
        'preferredChannel', (SELECT order_type FROM orders WHERE customer_phone = p_phone GROUP BY order_type ORDER BY COUNT(*) DESC LIMIT 1)
      ) FROM orders WHERE customer_phone = p_phone
    ),
    'orderHistory', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', o.id, 'trackingId', o.tracking_id, 'restaurant', r.name, 'restaurantSlug', r.slug,
        'total', o.total_amount, 'status', o.status, 'orderType', o.order_type, 'createdAt', o.created_at,
        'itemCount', jsonb_array_length(CASE WHEN jsonb_typeof(o.cart_snapshot) = 'array' THEN o.cart_snapshot ELSE '[]'::jsonb END)
      ) ORDER BY o.created_at DESC) FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.customer_phone = p_phone LIMIT 50
    ), '[]'::jsonb),
    'restaurantBreakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', rn, 'slug', rs, 'orders', oc, 'spent', sp) ORDER BY sp DESC) FROM (
        SELECT r.name AS rn, r.slug AS rs, COUNT(*) AS oc, COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('completed','delivered')), 0) AS sp
        FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.customer_phone = p_phone GROUP BY r.name, r.slug
      ) rb
    ), '[]'::jsonb),
    'favoriteItems', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', iname, 'quantity', qty)) FROM (
        SELECT COALESCE(item->>'itemName', item->>'name', 'Unknown') AS iname, SUM(COALESCE((item->>'quantity')::int, 1)) AS qty
        FROM orders o, jsonb_array_elements(CASE WHEN jsonb_typeof(o.cart_snapshot) = 'array' THEN o.cart_snapshot ELSE '[]'::jsonb END) item
        WHERE o.customer_phone = p_phone AND o.status IN ('completed','delivered')
        GROUP BY iname ORDER BY qty DESC LIMIT 10
      ) fi
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_admin_customer_detail(TEXT) TO authenticated;
