-- ============================================================
-- alakeifak: Realtime Publication
-- 004_realtime.sql — Supabase Realtime for live order updates
-- ============================================================
-- Must run OUTSIDE a transaction (publication commands cannot
-- be wrapped in BEGIN/COMMIT).
--
-- Enables real-time push updates for the Partner OMS dashboard
-- so restaurant staff see new orders instantly.
-- ============================================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================================
-- ✅ 004_realtime.sql complete.
-- Next: Run 005_seed_data.sql
-- ============================================================
