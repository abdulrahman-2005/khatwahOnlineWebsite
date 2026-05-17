-- ============================================================
-- alakeifak: Admin CRM Performance RPC
-- 022_admin_crm_rpc.sql
-- ============================================================
-- Single server-side RPC that returns ALL data needed for the
-- admin CRM tab in one call, eliminating waterfall loading.
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_crm_data()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

  SELECT jsonb_build_object(
    'restaurants', COALESCE((
      SELECT jsonb_agg(row_data ORDER BY created_at DESC) FROM (
        SELECT jsonb_build_object(
          'id', r.id,
          'name', r.name,
          'slug', r.slug,
          'logo_url', r.logo_url,
          'is_active', r.is_active,
          'is_verified', r.is_verified,
          'is_open', r.is_open,
          'tags', r.tags,
          'subscription_end_date', r.subscription_end_date,
          'created_at', r.created_at,
          'whatsapp_number', r.whatsapp_number,
          'orderCount', COALESCE(oc.cnt, 0),
          'memberCount', COALESCE(mc.cnt, 0)
        ) AS row_data,
        r.created_at
        FROM restaurants r
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS cnt FROM orders WHERE restaurant_id = r.id
        ) oc ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS cnt FROM restaurant_members WHERE restaurant_id = r.id
        ) mc ON true
      ) sub
    ), '[]'::jsonb),
    'platformStats', (
      SELECT jsonb_build_object(
        'totalOrders', COUNT(*),
        'cancelledCount', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'losses', COALESCE(SUM(ABS(total_amount)) FILTER (WHERE status = 'cancelled' AND total_amount < 0), 0)
      ) FROM orders
    ),
    'allTags', COALESCE((
      SELECT jsonb_agg(DISTINCT tag_val) 
      FROM restaurants, unnest(tags) AS tag_val
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_admin_crm_data() TO authenticated;
