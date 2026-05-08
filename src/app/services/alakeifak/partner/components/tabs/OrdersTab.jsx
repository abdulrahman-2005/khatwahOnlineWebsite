"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { safeQuery } from "../../../lib/safeQuery";
import { createManagedChannel } from "../../../lib/realtimeManager";
import {
  Truck, ClipboardList, XCircle, ShoppingBag, Target,
  ChefHat, Bell, BellOff, Volume2, VolumeX,
  TrendingDown, AlertTriangle, BarChart3, Search,
  Users, Flame, Activity
} from "lucide-react";
import { LoadingSpinner, EmptyState } from "../ui/PartnerUI";
import { playOrderSound, requestNotificationPermission, showOrderNotification } from "../../../lib/notificationUtils";
import OrderReceipt from "../OrderReceipt";
import DateRangePicker from "../DateRangePicker";
import OrderRow, { ACTIVE_STATUSES, ARCHIVED_STATUSES, LOSS_STATUSES } from "../OrderRow";

// ── Helper Components ──

function StatCard({ label, value, unit, icon: Icon, color, trend, isLoss, accent }) {
  return (
    <div className={`group relative rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${isLoss ? 'bg-red-50/80 border-red-200' : 'bg-white border-gray-200/80'}`}>
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${isLoss ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-[20px] font-black tracking-tight ${isLoss ? 'text-red-600' : 'text-gray-900'}`}>
          {value}
        </span>
        {unit && <span className="text-[11px] font-bold text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}

export default function OrdersTab({ restaurantId, themeColor }) {
  const [orders, setOrders] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Custom date range: { from: Date|null, to: Date|null }
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("active"); // "active" | "history"
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  // Cancellation confirmation: { orderId, currentStatus, originalAmount } | null
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const orderIdsRef = useRef(new Set());

  const soundEnabledRef = useRef(soundEnabled);
  const notifEnabledRef = useRef(notifEnabled);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { notifEnabledRef.current = notifEnabled; }, [notifEnabled]);

  // ── Initial Fetch (error-aware, supports custom datetime range) ──
  const fetchOrdersAndStats = useCallback(async () => {
    // 1. Fetch Active Orders (Prioritize Oldest First for Kitchen)
    const { data: activeOrders } = await safeQuery(() => {
      let query = supabase
        .from("orders")
        .select("*, delivery_zones(region_name, fee)")
        .eq("restaurant_id", restaurantId)
        .in("status", ["pending", "preparing", "ready", "confirmed"])
        .order("created_at", { ascending: true })
        .limit(100);

      // NO DATE FILTER FOR ACTIVE ORDERS. Active is active, always.
      return query;
    });

    // 2. Fetch Recent History Orders (Newest First)
    const { data: historyOrders } = await safeQuery(() => {
      let query = supabase
        .from("orders")
        .select("*, delivery_zones(region_name, fee)")
        .eq("restaurant_id", restaurantId)
        .in("status", ["completed", "delivered", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (dateRange.from) query = query.gte("created_at", dateRange.from.toISOString());
      if (dateRange.to)   query = query.lte("created_at", dateRange.to.toISOString());
      return query;
    });

    const combined = [...(activeOrders || []), ...(historyOrders || [])];
    // Deduplicate
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // For sorting the UI list nicely: active orders oldest first, history newest first
    // We already separated them, so we just set them.
    setOrders(unique);
    orderIdsRef.current = new Set(unique.map(o => o.id));

    // 3. Fetch True Server-Side Analytics
    const { data: statsData } = await safeQuery(() => {
      return supabase.rpc("get_restaurant_analytics", {
        p_restaurant_id: restaurantId,
        // The RPC still supports date filters for analytics/history
        p_start_date: dateRange.from ? dateRange.from.toISOString() : null,
        p_end_date: dateRange.to ? dateRange.to.toISOString() : null
      });
    });

    if (statsData && statsData.length > 0) {
      setServerStats(statsData[0]);
    }

    setLoading(false);
  }, [restaurantId, dateRange]);

  useEffect(() => { setLoading(true); fetchOrdersAndStats(); }, [fetchOrdersAndStats]);

  // ── Supabase Realtime (self-healing managed channel) ──
  useEffect(() => {
    if (!restaurantId) return;

    const { unsubscribe } = createManagedChannel(
      `oms-orders-${restaurantId}`,
      (channel) => {
        channel
          .on("postgres_changes", {
            event: "INSERT", schema: "public", table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`
          }, (payload) => {
            const newOrder = payload.new;
            if (!orderIdsRef.current.has(newOrder.id)) {
              supabase.from("orders").select("*, delivery_zones(region_name, fee)")
                .eq("id", newOrder.id).single().then(({ data }) => {
                  if (data) {
                    setOrders(prev => [data, ...prev]);
                    orderIdsRef.current.add(data.id);
                    if (soundEnabledRef.current) playOrderSound();
                    if (notifEnabledRef.current) showOrderNotification(data);
                    setViewMode("active");
                  }
                });
            }
          })
          .on("postgres_changes", {
            event: "UPDATE", schema: "public", table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`
          }, (payload) => {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
            // Trigger a quick background refetch of stats when status changes
            supabase.rpc("get_restaurant_analytics", {
              p_restaurant_id: restaurantId,
              p_start_date: dateRange.from ? dateRange.from.toISOString() : null,
              p_end_date: dateRange.to ? dateRange.to.toISOString() : null
            }).then(({ data }) => { if (data && data.length > 0) setServerStats(data[0]); });
          });
      },
      {
        onStatusChange: (status) => {
          setRealtimeConnected(status === "SUBSCRIBED");
        },
      }
    );

    return () => { unsubscribe(); };
  }, [restaurantId]);

  // ── Request notifications ──
  useEffect(() => {
    requestNotificationPermission().then(granted => setNotifEnabled(granted));
  }, []);

  // ── Status Update (Strict Data Integrity - No Optimistic UI) ──
  const updateStatus = useCallback(async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      if (error) throw error;
      
      // Update local state ONLY after successful database mutation
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // Re-fetch analytics immediately
      fetchOrdersAndStats();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("فشل تحديث حالة الطلب. يرجى التحقق من اتصالك بالإنترنت.");
    }
  }, [fetchOrdersAndStats]);

  // ── Cancel Order (with financial type logic) ──
  // pending/preparing → total_amount = 0 (equal, no loss)
  // ready/confirmed   → total_amount = -originalAmount (loss)
  const cancelOrder = useCallback(async ({ orderId, currentStatus, originalAmount }) => {
    const isLoss = LOSS_STATUSES.includes(currentStatus);
    const newAmount = isLoss ? -Math.abs(Number(originalAmount)) : 0;
    setCancelConfirm(null);
    
    try {
      const { error } = await supabase.from("orders").update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        total_amount: newAmount,
      }).eq("id", orderId);
      
      if (error) throw error;

      // Update local state ONLY after successful database mutation
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, status: "cancelled", cancelled_at: new Date().toISOString(), total_amount: newAmount }
          : o
      ));
      // Re-fetch analytics immediately
      fetchOrdersAndStats();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("فشل إلغاء الطلب. يرجى التحقق من اتصالك بالإنترنت.");
    }
  }, [fetchOrdersAndStats]);

  // ── Stats (Server-Calculated) ──
  const stats = useMemo(() => {
    if (!serverStats) {
      return { orderRevenue: 0, deliveryFees: 0, totalLossAmount: 0, losses: 0, total: 0, pending: 0, preparing: 0, ready: 0, confirmed: 0, successful_orders: 0, aov: 0, rate: 0 };
    }
    return {
      orderRevenue: Number(serverStats.order_revenue) || 0,
      deliveryFees: Number(serverStats.delivery_fees) || 0,
      totalLossAmount: Number(serverStats.total_loss_amount) || 0,
      losses: Number(serverStats.losses_count) || 0,
      total: Number(serverStats.total_orders) || 0,
      pending: Number(serverStats.pending_orders) || 0,
      preparing: Number(serverStats.preparing_orders) || 0,
      ready: Number(serverStats.ready_orders) || 0,
      confirmed: Number(serverStats.confirmed_orders) || 0,
      successful_orders: Number(serverStats.successful_orders) || 0,
      aov: Number(serverStats.aov) || 0,
      rate: Number(serverStats.success_rate) || 0
    };
  }, [serverStats]);

  // ── Filtered Orders ──
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (viewMode === "active") {
      result = result.filter(o => ACTIVE_STATUSES.includes(o.status));
      // User requested newest first for active view
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result = result.filter(o => ARCHIVED_STATUSES.includes(o.status));
      // For history view, ensure newest are at the top
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer_name?.toLowerCase().includes(q) ||
        o.tracking_id?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
      );
    }
    return result;
  }, [orders, viewMode, searchQuery]);

  // Display true count from server. Note: stats.successful_orders includes confirmed orders.
  // We can just add pending + preparing + ready + confirmed for active count
  const activeCount = stats.pending + stats.preparing + stats.ready + stats.confirmed;

  // ── Watchdog Timer for Delayed Orders ──
  const [nowTime, setNowTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const delayedOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === "pending" && (nowTime - new Date(o.created_at).getTime() > 5 * 60 * 1000)).length;
  }, [orders, nowTime]);

  const toggleOrder = useCallback((id) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Command Center Header ── */}
      <div className="shrink-0 rounded-2xl overflow-hidden mb-6 shadow-md border border-gray-200">
        {/* Top bar - dark */}
        <div className="bg-gray-900 px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* View Toggle */}
            <div className="flex p-1 bg-gray-800 rounded-xl border border-gray-700">
              <button onClick={() => setViewMode("active")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "active" ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                style={viewMode === "active" ? { backgroundColor: themeColor } : undefined}>
                <Flame size={14} />
                المطبخ ({activeCount})
              </button>
              <button onClick={() => setViewMode("history")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "history" ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                style={viewMode === "history" ? { backgroundColor: themeColor } : undefined}>
                <BarChart3 size={14} />
                السجل والتحليلات
              </button>
            </div>
            {/* Realtime dot */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
              <div className={`h-2 w-2 rounded-full ${realtimeConnected ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"}`} />
              <span className="text-[11px] font-bold text-gray-400">
                {realtimeConnected ? "مباشر" : "غير متصل"}
              </span>
            </div>
          </div>

          {/* Search + Controls */}
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-80">
              <input type="text" placeholder="ابحث بالاسم، رقم الطلب، أو الهاتف..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-4 pr-10 py-2.5 text-[13px] font-bold text-white placeholder-gray-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all" />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border transition-all ${soundEnabled ? "bg-emerald-900/40 border-emerald-700 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"}`}
              title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={() => { requestNotificationPermission().then(g => setNotifEnabled(g)); }}
              className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border transition-all ${notifEnabled ? "bg-emerald-900/40 border-emerald-700 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"}`}
              title={notifEnabled ? "إشعارات مفعلة" : "تفعيل الإشعارات"}>
              {notifEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>

        {/* Status Pipeline - only in active mode */}
        {viewMode === "active" && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider shrink-0">الحالات:</span>
            {[
              { label: "جديد", count: stats.pending, color: "bg-amber-500", textColor: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
              { label: "تجهيز", count: stats.preparing, color: "bg-sky-500", textColor: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
              { label: "جاهز", count: stats.ready, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
              { label: "مؤكد", count: stats.confirmed, color: "bg-blue-500", textColor: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.bg} shrink-0`}>
                <div className={`h-2 w-2 rounded-full ${s.color}`} />
                <span className={`text-[12px] font-black ${s.textColor}`}>{s.label}</span>
                <span className={`text-[13px] font-black ${s.textColor}`}>{s.count}</span>
              </div>
            ))}
            {delayedOrdersCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 shrink-0 animate-pulse">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-[12px] font-black text-red-700">{delayedOrdersCount} متأخر!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dynamic Content Area ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* ACTIVE ORDERS LIST */}
        <div className={`${viewMode === "active" ? "block" : "hidden"} flex-1 overflow-y-auto pr-1 pb-20 space-y-4`}>
          <div className="flex flex-col gap-3">
            {filteredOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).map((order) => (
              <OrderRow key={order.id} order={order}
                isExpanded={expandedOrders.has(order.id) || order.status === "pending" || order.status === "preparing"} 
                onToggle={toggleOrder}
                onStatusUpdate={updateStatus} themeColor={themeColor}
                setReceiptOrder={setReceiptOrder}
                setCancelConfirm={setCancelConfirm} />
            ))}
          </div>

          {filteredOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                <ChefHat size={36} className="text-gray-300" />
              </div>
              <h3 className="text-[16px] font-black text-gray-400 mb-1">لا توجد طلبات نشطة</h3>
              <p className="text-[13px] font-bold text-gray-400">ستظهر الطلبات الجديدة هنا تلقائياً</p>
            </div>
          )}
        </div>

        {/* HISTORY & ANALYTICS VIEW */}
        <div className={`${viewMode === "history" ? "block" : "hidden"} flex-1 overflow-y-auto pr-1 pb-20 space-y-6`}>
          
          {/* Analytics Header */}
          <section>
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
                  <Activity size={20} style={{ color: themeColor }} />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-gray-900">لوحة التحليلات</h2>
                  <p className="text-[12px] font-bold text-gray-500">تحليل شامل لأداء المطعم</p>
                </div>
              </div>
              <DateRangePicker value={dateRange} onChange={setDateRange} themeColor={themeColor} />
            </div>

            {/* Revenue Hero Card */}
            <div className="rounded-2xl p-5 mb-4 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">صافي الإيرادات</p>
                  <p className="text-[32px] font-black tracking-tight mt-1">{stats.orderRevenue.toFixed(0)} <span className="text-[16px] opacity-70">ج.م</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <ShoppingBag size={14} />
                    <span className="text-[13px] font-black">{stats.total} طلب</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Users size={14} />
                    <span className="text-[13px] font-black">{stats.successful_orders} مكتمل</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard label="رسوم التوصيل" value={stats.deliveryFees.toFixed(0)} unit="ج.م" icon={Truck} color="#3b82f6" trend="محصّلة" />
              <StatCard label="الخسائر" value={stats.totalLossAmount.toFixed(0)} unit="ج.م" icon={TrendingDown} color="#ef4444" trend={`${stats.losses} ملغي`} isLoss />
              <StatCard label="متوسط الطلب" value={stats.aov.toFixed(0)} unit="ج.م" icon={BarChart3} color="#8b5cf6" trend="AOV" />
              <StatCard label="نسبة النجاح" value={`${stats.rate.toFixed(0)}%`} icon={Target} color="#10b981" trend="الإنجاز" />
              <StatCard label="الملغية" value={stats.losses + (stats.total - stats.successful_orders - stats.losses)} icon={XCircle} color="#f59e0b" trend={`من ${stats.total}`} />
            </div>
          </section>

          {/* Order History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full bg-gray-800" />
                <h2 className="text-[16px] font-black text-gray-900">سجل الطلبات</h2>
              </div>
              <span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                {filteredOrders.filter(o => ARCHIVED_STATUSES.includes(o.status)).length} طلب
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {filteredOrders.filter(o => ARCHIVED_STATUSES.includes(o.status)).map((order) => (
                <OrderRow key={order.id} order={order}
                  isExpanded={expandedOrders.has(order.id)}
                  onToggle={toggleOrder}
                  onStatusUpdate={updateStatus} themeColor={themeColor}
                  setReceiptOrder={setReceiptOrder}
                  setCancelConfirm={setCancelConfirm} />
              ))}
            </div>
            {filteredOrders.filter(o => ARCHIVED_STATUSES.includes(o.status)).length === 0 && (
              <EmptyState text="لا توجد طلبات في السجل تطابق بحثك." icon={ClipboardList} />
            )}
          </section>

        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
            </div>
            <h3 className="text-[20px] font-black text-center text-gray-900 mb-2">تأكيد الإلغاء</h3>
            <p className="text-center text-[14px] font-bold text-gray-500 mb-6 leading-relaxed">
              هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            {LOSS_STATUSES.includes(cancelConfirm.currentStatus) && (
              <>
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3 items-start">
                  <TrendingDown size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-black text-red-900 mb-1">إلغاء الطلب والخسارة...</p>
                    <p className="text-[12px] font-bold text-red-700">هذا الطلب وصل لمرحلة متقدمة. إلغاؤه الآن سيُسجل كخسارة بقيمة <span className="font-black text-red-900 bg-red-200/50 px-1 rounded">{cancelConfirm.originalAmount} ج.م</span> في تقاريرك.</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => cancelOrder(cancelConfirm)}
                className="flex-1 py-3 rounded-2xl text-[14px] font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all"
              >
                تأكيد الإلغاء
              </button>
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-[14px] font-black text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptOrder && (
        <OrderReceipt order={receiptOrder} restaurantName="" onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
}
