"use client";

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { safeQuery, safeMutation } from "../../../lib/safeQuery";
import { createManagedChannel } from "../../../lib/realtimeManager";
import {
  Phone, MapPin, Truck, ClipboardList, Check, XCircle, Clock,
  TrendingUp, DollarSign, ShoppingBag, Target, ArrowUpRight, Filter,
  ChefHat, PackageCheck, CheckCircle2, MessageCircle, Printer,
  Bell, BellOff, Volume2, VolumeX, Hash, UtensilsCrossed,
  TrendingDown, AlertTriangle, BarChart3, Eye
} from "lucide-react";
import { LoadingSpinner, EmptyState } from "../ui/PartnerUI";
import { playOrderSound, requestNotificationPermission, showOrderNotification, getRelativeTime } from "../../../lib/notificationUtils";
import OrderReceipt from "../OrderReceipt";
import DateRangePicker from "../DateRangePicker";

// ── Helper Components ──

function StatCard({ label, value, unit, icon: Icon, color, trend, isLoss }) {
  return (
    <div className={`rounded-[28px] bg-white p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden ${isLoss ? 'border-red-100' : ''}`}>
      {isLoss && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-lg ${isLoss ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-[22px] font-black tracking-tight ${isLoss ? 'text-red-600' : 'text-gray-900'}`} style={{ fontFamily: "var(--font-display)" }}>
            {value}
          </span>
          {unit && <span className="text-[12px] font-bold text-gray-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// ── New OMS Status Map ──
const STATUS_MAP = {
  pending:   { label: "جديد", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, actions: ["accept","cancel"] },
  preparing: { label: "قيد التجهيز", color: "bg-blue-50 text-blue-700 border-blue-200", icon: ChefHat, actions: ["ready"] },
  ready:     { label: "جاهز", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: PackageCheck, actions: ["complete"] },
  completed: { label: "مكتمل", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2, actions: [] },
  confirmed: { label: "مؤكد", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Check, actions: ["delivered"] },
  delivered: { label: "تم التوصيل", color: "bg-green-50 text-green-700 border-green-200", icon: Check, actions: [] },
  cancelled: { label: "ملغي", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle, actions: [] },
};

const ORDER_TYPE_ICONS = { delivery: Truck, pickup: ShoppingBag, in_house: UtensilsCrossed };
const ORDER_TYPE_LABELS = { delivery: "توصيل", pickup: "استلام", in_house: "داخلي" };

// Loss-state statuses: cancelling at these stages = food was made = financial loss
const LOSS_STATUSES = ["ready", "confirmed"];

const ACTIVE_STATUSES = ["pending", "preparing", "ready", "confirmed"];
const ARCHIVED_STATUSES = ["completed", "delivered", "cancelled"];

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
      
      {/* ── Universal Control Bar ── */}
      <div className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-3 sm:px-5 sm:py-4 shadow-sm mb-6">
        
        {/* Left: View Toggle & Realtime Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
            <button onClick={() => setViewMode("active")}
              className={`px-4 sm:px-6 py-2 rounded-lg text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "active" ? "text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              style={viewMode === "active" ? { backgroundColor: themeColor } : undefined}>
              <ChefHat size={14} />
              طلبات المطبخ ({activeCount})
            </button>
            <button onClick={() => setViewMode("history")}
              className={`px-4 sm:px-6 py-2 rounded-lg text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "history" ? "text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              style={viewMode === "history" ? { backgroundColor: themeColor } : undefined}>
              <CheckCircle2 size={14} />
              السجل والإحصائيات
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            <div className={`h-2.5 w-2.5 rounded-full ${realtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
            <span className="text-[11px] font-black text-gray-500">
              {realtimeConnected ? "متصل" : "غير متصل"}
            </span>
          </div>
        </div>

        {/* Right: Search & Utils */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <input type="text" placeholder="ابحث برقم الطلب أو الهاتف..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-50 border border-gray-100 pl-4 pr-10 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--dynamic-color)] focus:bg-white transition-all" />
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border transition-all ${soundEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"}`}
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => { requestNotificationPermission().then(g => setNotifEnabled(g)); }}
            className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border transition-all ${notifEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"}`}
            title={notifEnabled ? "إشعارات مفعلة" : "تفعيل الإشعارات"}>
            {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </div>
      </div>

      {/* ── Dynamic Content Area ── */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {delayedOrdersCount > 0 && viewMode === "active" && (
          <div className="shrink-0 mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 sm:px-5 sm:py-4 flex items-center gap-4 shadow-sm animate-in fade-in zoom-in-95">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-[14px] sm:text-[15px] font-black text-red-900 leading-tight">تنبيه: يوجد {delayedOrdersCount} طلب متأخر القبول!</h3>
              <p className="text-[12px] sm:text-[13px] font-bold text-red-700 mt-0.5">لم يتم قبول بعض الطلبات منذ أكثر من 5 دقائق. راجع عمود "طلبات جديدة" فوراً.</p>
            </div>
          </div>
        )}

        {/* ── Tabs Content (CSS Toggled for Instant Switching) ── */}
        
        {/* ACTIVE ORDERS LIST (Responsive List/Table style) */}
        <div className={`${viewMode === "active" ? "block" : "hidden"} flex-1 overflow-y-auto pr-1 pb-20 space-y-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-[16px] font-black text-gray-900">طلبات المطبخ النشطة (من الأحدث للأقدم)</h2>
            </div>
            <div className="flex gap-2">
              <span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">{filteredOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length} طلب نشط</span>
            </div>
          </div>

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
            <EmptyState text="لا توجد طلبات نشطة حالياً." icon={ChefHat} />
          )}
        </div>

        {/* HISTORY & STATS VIEW */}
        <div className={`${viewMode === "history" ? "block" : "hidden"} flex-1 overflow-y-auto pr-1 pb-20 space-y-8`}>
          
          <section className="pb-2">
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                <h2 className="text-[16px] font-black text-gray-900">إحصائيات الأداء</h2>
              </div>
              <DateRangePicker value={dateRange} onChange={setDateRange} themeColor={themeColor} />
            </div>

            {/* 6-card split stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="إيراد الطلبات" value={stats.orderRevenue.toFixed(0)} unit="ج.م" icon={DollarSign} color={themeColor} trend="صافي دخلك" />
              <StatCard label="رسوم التوصيل" value={stats.deliveryFees.toFixed(0)} unit="ج.م" icon={Truck} color="#3b82f6" trend="محصّلة للتوصيل" />
              <StatCard label="الخسائر" value={stats.totalLossAmount.toFixed(0)} unit="ج.م" icon={TrendingDown} color="#ef4444" trend={`${stats.losses} طلب ملغى بخسارة`} isLoss />
              <StatCard label="عدد الطلبات" value={stats.total} icon={ShoppingBag} color="#f59e0b" trend={`${stats.pending} جديد · ${stats.preparing} تجهيز`} />
              <StatCard label="متوسط الطلب" value={stats.aov.toFixed(0)} unit="ج.م" icon={BarChart3} color="#8b5cf6" trend="AOV" />
              <StatCard label="نسبة النجاح" value={`${stats.rate.toFixed(0)}%`} icon={Target} color="#10b981" trend="الطلبات المكتملة" />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1.5 rounded-full bg-gray-800" />
              <h2 className="text-[16px] font-black text-gray-900">سجل الطلبات</h2>
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

      {/* Cancellation Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200">
            {LOSS_STATUSES.includes(cancelConfirm.currentStatus) ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 mb-4">
                  <TrendingDown size={28} className="text-red-600" />
                </div>
                <h3 className="text-[20px] font-black text-gray-900 mb-2">تأكيد إلغاء الطلب</h3>
                <p className="text-[14px] font-bold text-gray-500 mb-1">الطلب في مرحلة <strong className="text-gray-800">{STATUS_MAP[cancelConfirm.currentStatus]?.label}</strong> — الأكل جاهز.</p>
                <div className="my-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <p className="text-[13px] font-black text-red-700">
                    سيُسجَّل هذا كـ <span className="underline">خسارة</span> بقيمة {Math.abs(Number(cancelConfirm.originalAmount)).toFixed(0)} ج.م
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mb-4">
                  <XCircle size={28} className="text-amber-600" />
                </div>
                <h3 className="text-[20px] font-black text-gray-900 mb-2">إلغاء الطلب؟</h3>
                <div className="my-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-[13px] font-black text-amber-700">سيُسجَّل كـ <span className="underline">تعادل</span> — لا خسارة مالية.</p>
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

// ── OrderRow (Strict Table Row Layout) ──
const OrderRow = memo(function OrderRow({ order, isExpanded, onToggle, onStatusUpdate, themeColor, setReceiptOrder, setCancelConfirm }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const TypeIcon = ORDER_TYPE_ICONS[order.order_type] || Truck;
  const cart = order.cart_snapshot || [];
  
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  
  // Calculate total items
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const waLink = `https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.tracking_id} ✨`)}`;

  // Status visual mapping for the entire row
  const baseBg = order.status === 'pending' ? 'bg-amber-50/80' : 
                 order.status === 'preparing' ? 'bg-blue-50/80' : 
                 order.status === 'ready' ? 'bg-emerald-50/80' : 
                 order.status === 'cancelled' ? 'bg-red-50/80' : 'bg-white';

  const borderColor = order.status === 'pending' ? 'border-amber-300' :
                      order.status === 'preparing' ? 'border-blue-300' :
                      order.status === 'ready' ? 'border-emerald-300' :
                      order.status === 'cancelled' ? 'border-red-300' : 'border-gray-300';

  const rightBorderColor = order.status === 'pending' ? 'bg-amber-500' :
                           order.status === 'preparing' ? 'bg-blue-500' :
                           order.status === 'ready' ? 'bg-emerald-500' :
                           order.status === 'cancelled' ? 'bg-red-500' :
                           order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className={`relative rounded-xl border-2 transition-all duration-200 hover:shadow-md overflow-hidden ${baseBg} ${borderColor} ${isExpanded ? "ring-4 ring-gray-200 shadow-lg" : "shadow-sm"}`}>
      {/* ── Status Indicator Line ── */}
      <div className={`absolute top-0 right-0 bottom-0 w-2 ${rightBorderColor}`} />

      {/* ── Compact Row (Table-like) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 pr-5 lg:pr-6 cursor-pointer" onClick={() => onToggle(order.id)}>
        
        <div className="flex flex-1 items-center gap-4 lg:gap-6 min-w-0">
          {/* Order ID & Time */}
          <div className="flex flex-col items-center justify-center shrink-0 w-16 lg:w-20 border-l-2 border-gray-200/80 pl-3 lg:pl-4">
            <span className="text-[15px] font-black text-gray-900 leading-none mb-1">#{order.tracking_id}</span>
            <span className="text-[12px] font-bold text-gray-600 flex items-center gap-1"><Clock size={12}/> {timeStr}</span>
          </div>

          {/* Customer Info */}
          <div className="flex flex-col flex-1 min-w-0 border-l-2 border-gray-200/80 pl-3 lg:border-none lg:pl-0">
            <span className="text-[15px] font-black text-gray-900 truncate">{order.customer_name}</span>
            <span className="text-[13px] font-bold text-gray-600 truncate mt-0.5" dir="ltr">{order.customer_phone}</span>
          </div>

          {/* Type & Status */}
          <div className="hidden sm:flex flex-col items-start w-36 shrink-0 border-l-2 border-gray-200/80 pl-3 lg:border-none lg:pl-0">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-300">
              <TypeIcon size={14} className="opacity-80" /> 
              {order.order_type === "in_house" ? `طاولة ${order.table_number}` : ORDER_TYPE_LABELS[order.order_type]}
            </div>
            <div className={`mt-2 flex items-center gap-1.5 text-[12px] font-black px-2.5 py-1 rounded-md border shadow-sm ${statusInfo.color}`}>
              <StatusIcon size={14} /> {statusInfo.label}
            </div>
          </div>
          
          {/* Summary / Total */}
          <div className="hidden lg:flex flex-col items-end w-28 shrink-0">
            <span className="text-[12px] font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded-md border border-gray-200">{totalItems} أصناف</span>
            <span className={`text-[17px] font-black mt-1 ${Number(order.total_amount) < 0 ? "text-red-700" : "text-gray-900"}`}>
              {Number(order.total_amount).toFixed(0)} <span className="text-[11px] text-gray-600">ج.م</span>
            </span>
          </div>
        </div>

        {/* Actions Strip */}
        <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t-2 border-gray-200/80 lg:border-t-0" onClick={e => e.stopPropagation()}>
          {/* Mobile Only Summary Info */}
          <div className="flex lg:hidden items-center gap-2 text-[13px] font-black bg-white/60 px-3 py-1.5 rounded-lg border border-gray-200">
             <span className="text-gray-600">{totalItems} أصناف</span>
             <span className="text-gray-400">|</span>
             <span className={Number(order.total_amount) < 0 ? "text-red-700" : "text-gray-900"}>{Number(order.total_amount).toFixed(0)} ج.م</span>
          </div>

          <div className="flex items-center gap-2">
            {order.status === "pending" && (
              <>
                <button onClick={() => onStatusUpdate(order.id, "preparing")} className="px-4 py-2 text-white text-[13px] font-black rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95" style={{ backgroundColor: themeColor }}>قبول وتجهيز</button>
                <button onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })} className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 text-[13px] font-black rounded-xl hover:bg-red-200 transition-all shadow-sm active:scale-95">إلغاء</button>
              </>
            )}
            {order.status === "preparing" && (
              <button onClick={() => onStatusUpdate(order.id, "ready")} className="px-5 py-2 bg-blue-600 text-white text-[13px] font-black rounded-xl shadow-md hover:bg-blue-700 transition-all whitespace-nowrap active:scale-95">جاهز للتسليم</button>
            )}
            {(order.status === "ready" || order.status === "confirmed") && (
              <button onClick={() => onStatusUpdate(order.id, order.order_type === "delivery" ? "delivered" : "completed")} className="px-5 py-2 bg-emerald-600 text-white text-[13px] font-black rounded-xl shadow-md hover:bg-emerald-700 transition-all whitespace-nowrap active:scale-95">
                {order.order_type === "delivery" ? "تم التوصيل" : "تم التسليم"}
              </button>
            )}
            {ARCHIVED_STATUSES.includes(order.status) && (
              <div className={`px-4 py-1.5 rounded-xl text-[12px] font-black border shadow-sm ${order.status === "cancelled" ? (Number(order.total_amount) < 0 ? "bg-red-100 text-red-800 border-red-300" : "bg-gray-200 text-gray-700 border-gray-400") : statusInfo.color}`}>
                {order.status === "cancelled" ? (Number(order.total_amount) < 0 ? "خسارة" : "ملغي") : statusInfo.label}
              </div>
            )}
            <button onClick={() => onToggle(order.id)} className="h-10 w-10 flex items-center justify-center bg-white text-gray-700 border-2 border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 transition-all active:scale-95">
               <Eye size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Expanded Content (Cart & Utils) ── */}
      {isExpanded && (
        <div className="border-t-2 border-gray-300 bg-gray-100 flex flex-col lg:flex-row text-right animate-in slide-in-from-top-1 fade-in duration-200 shadow-inner">
          {/* Order Items Section */}
          <div className="flex-1 p-4 lg:p-6 lg:border-l-2 border-gray-300">
            <h4 className="text-[13px] font-black text-gray-600 mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> تفاصيل الطلب
            </h4>
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 bg-white p-3 lg:p-4 rounded-xl border border-gray-300 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                    <span className="text-[16px] font-black">x{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[15px] font-black text-gray-900 leading-tight">{item.itemName}</span>
                      <span className="text-[16px] font-black text-gray-800 shrink-0">{(item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s,e)=>s + Number(e.price) * Number(e.quantity || 1), 0) || 0))).toFixed(0)} <span className="text-[12px] text-gray-500">ج.م</span></span>
                    </div>
                    {(item.size?.name || item.extras?.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.size?.name && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[12px] font-black border border-gray-300 shadow-sm">حجم: {item.size.name}</span>
                        )}
                        {item.extras?.map(e => (
                          <span key={e.name} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-[12px] font-black border border-orange-300 shadow-sm">
                            + {e.name} {Number(e.quantity || 1) > 1 ? `(x${e.quantity})` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals Sub-block */}
            <div className="mt-5 flex justify-between items-center bg-white px-5 py-4 rounded-xl shadow-md border-2 border-gray-300">
              <span className="text-[15px] font-black text-gray-900 flex items-center gap-2">
                <div className="bg-emerald-100 p-1.5 rounded-lg border border-emerald-200"><DollarSign size={18} className="text-emerald-600" /></div>
                المبلغ الإجمالي
              </span>
              <span className="text-[24px] font-black tracking-tight" style={{ color: themeColor }}>{Number(order.total_amount).toFixed(0)} <span className="text-[14px] text-gray-600">ج.م</span></span>
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="w-full lg:w-[340px] shrink-0 p-4 lg:p-6 bg-slate-50">
            <h4 className="text-[13px] font-black text-gray-600 mb-4 flex items-center gap-2">
              <Phone size={16} /> التوصيل والتواصل
            </h4>
            
            <div className="space-y-4 mb-6">
              {order.order_type === "delivery" && order.delivery_zones && (
                <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-4 border-2 border-blue-200 shadow-sm">
                  <div className="bg-white p-2.5 rounded-lg shadow border border-blue-200 shrink-0"><MapPin size={20} className="text-blue-600" /></div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[12px] font-black text-blue-600 mb-1">المنطقة ({order.delivery_zones.fee} ج.م)</span>
                    <span className="text-[15px] font-black text-blue-950 mb-1.5 leading-tight">{order.delivery_zones.region_name}</span>
                    {order.delivery_address && (
                      <span className="text-[13px] font-bold text-blue-900 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-blue-200/70 mt-1">
                        {order.delivery_address}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="space-y-3">
               {ACTIVE_STATUSES.includes(order.status) && order.status !== "pending" && (
                 <button 
                  onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })}
                  className="w-full py-3.5 text-[14px] font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                 >
                  <XCircle size={18} />
                  إلغاء الطلب {LOSS_STATUSES.includes(order.status) ? "(بخسارة)" : ""}
                 </button>
               )}

               <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-200">
                 <a href={waLink} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-2 py-3.5 bg-green-500 text-white text-[14px] font-black rounded-xl shadow-md hover:bg-green-600 transition-colors active:scale-95">
                   <MessageCircle size={18} /> واتساب
                 </a>
                 <button onClick={() => setReceiptOrder(order)} className="flex justify-center items-center gap-2 py-3.5 bg-white text-gray-900 text-[14px] font-black rounded-xl border-2 border-gray-300 shadow-sm hover:bg-gray-100 transition-colors active:scale-95">
                   <Printer size={18} /> طباعة
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ── KitchenTicket (Fully Expanded KDS View for Active Orders) ──
const KitchenTicket = memo(function KitchenTicket({ order, onStatusUpdate, themeColor, setReceiptOrder, setCancelConfirm }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const TypeIcon = ORDER_TYPE_ICONS[order.order_type] || Truck;
  const cart = order.cart_snapshot || [];
  const createdAt = new Date(order.created_at);
  const [elapsed, setElapsed] = useState(getRelativeTime(order.created_at));

  useEffect(() => {
    const i = setInterval(() => setElapsed(getRelativeTime(order.created_at)), 30000);
    return () => clearInterval(i);
  }, [order.created_at]);

  const waLink = `https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.tracking_id} ✨`)}`;

  return (
    <div className={`flex flex-col bg-white rounded-3xl overflow-hidden border shadow-sm transition-all ${
      order.status === "pending" ? "border-amber-300 ring-2 ring-amber-100" : "border-gray-200 hover:border-gray-300"
    }`}>
      {/* Header Bar */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${statusInfo.color.replace('border', 'border-b')}`}>
        <div className="flex flex-col">
          <span className="text-[11px] font-black opacity-60 flex items-center gap-1">
            <Hash size={10} /> {order.tracking_id}
          </span>
          <span className="text-[15px] font-black mt-0.5">{statusInfo.label}</span>
        </div>
        <div className="text-left flex flex-col items-end">
          <span className="text-[12px] font-bold opacity-70 flex items-center gap-1">
            <Clock size={12} /> {elapsed}
          </span>
          <span className="text-[13px] font-black flex items-center gap-1 mt-0.5">
            <TypeIcon size={14} /> 
            {order.order_type === "in_house" ? `طاولة ${order.table_number}` : ORDER_TYPE_LABELS[order.order_type]}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex flex-col flex-1 min-w-0 pr-2">
          <span className="text-[14px] font-black text-gray-900 truncate">{order.customer_name}</span>
          <a href={`tel:${order.customer_phone}`} className="text-[12px] font-bold text-gray-500 truncate" dir="ltr">{order.customer_phone}</a>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={waLink} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
            <MessageCircle size={16} />
          </a>
          <button onClick={() => setReceiptOrder(order)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-4">
        {cart.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="text-[15px] font-black text-gray-900 w-6 text-left shrink-0 opacity-80">x{item.quantity}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-black text-gray-900 break-words leading-tight block mb-1">
                {item.itemName}
              </span>
              {item.size?.name && (
                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-gray-200 mr-1 mb-1">
                  حجم: {item.size.name}
                </span>
              )}
              {item.extras?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.extras.map(e => (
                    <span key={e.name} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-orange-100">
                      + {e.name} {Number(e.quantity || 1) > 1 ? `(x${e.quantity})` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Zone / Address */}
      {order.order_type === "delivery" && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-blue-700 mb-1.5">
              <Truck size={14} />
              <span className="text-[12px] font-black">{order.delivery_zones?.region_name}</span>
            </div>
            {order.delivery_address && (
              <p className="text-[12px] font-bold text-gray-600 leading-relaxed flex items-start gap-1.5">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {order.delivery_address}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
        <div className="flex gap-2">
          {order.status === "pending" && (
            <button onClick={() => onStatusUpdate(order.id, "preparing")} 
              className="flex-1 py-3 bg-[var(--dynamic-color)] text-white text-[13px] font-black rounded-2xl hover:brightness-110 active:scale-95 shadow-md flex justify-center items-center gap-2"
              style={{ backgroundColor: themeColor }}>
              <ChefHat size={16} /> تجهيز
            </button>
          )}
          {order.status === "preparing" && (
            <button onClick={() => onStatusUpdate(order.id, "ready")} 
              className="flex-1 py-3 bg-blue-600 text-white text-[13px] font-black rounded-2xl hover:bg-blue-700 active:scale-95 shadow-md flex justify-center items-center gap-2">
              <PackageCheck size={16} /> جاهز للتسليم
            </button>
          )}
          {order.status === "ready" && (
            <button onClick={() => onStatusUpdate(order.id, "completed")} 
              className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-black rounded-2xl hover:bg-emerald-700 active:scale-95 shadow-md flex justify-center items-center gap-2">
              <CheckCircle2 size={16} /> إنهاء وتسليم
            </button>
          )}
          {order.status === "confirmed" && (
            <button onClick={() => onStatusUpdate(order.id, "delivered")} 
              className="flex-1 py-3 bg-green-600 text-white text-[13px] font-black rounded-2xl hover:bg-green-700 active:scale-95 shadow-md flex justify-center items-center gap-2">
              <Truck size={16} /> تم التوصيل
            </button>
          )}
        </div>

        {/* Universal Cancel Button with logic-based styling */}
        <button 
          onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })}
          className={`w-full py-2.5 rounded-xl text-[12px] font-black transition-all flex items-center justify-center gap-1.5 ${
            LOSS_STATUSES.includes(order.status)
              ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          <XCircle size={14} />
          {LOSS_STATUSES.includes(order.status) ? "إلغاء (خسارة)" : "إلغاء الطلب"}
        </button>
      </div>
    </div>
  );
});

