-- 019_restaurant_analytics_rpc.sql
-- Description: Creates an RPC to calculate analytics server-side, preventing the frontend from downloading thousands of orders.

DROP FUNCTION IF EXISTS get_restaurant_analytics(uuid, timestamp with time zone, timestamp with time zone);

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
      
      -- Revenue: total amount minus delivery fee for successful orders
      COALESCE(SUM(GREATEST(0, total_amount - delivery_fee)) FILTER (WHERE status IN ('delivered', 'confirmed', 'completed')), 0) AS order_revenue,
      
      -- Delivery fees for successful delivery orders
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
