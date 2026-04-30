"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Phone, MapPin, Truck, ClipboardList, Check, XCircle, Clock,
  TrendingUp, DollarSign, ShoppingBag, Target, ArrowUpRight, Filter,
  ChefHat, PackageCheck, CheckCircle2, MessageCircle, Printer,
  Bell, BellOff, Volume2, VolumeX, Hash, UtensilsCrossed
} from "lucide-react";
import { LoadingSpinner, EmptyState } from "../ui/PartnerUI";
import { playOrderSound, requestNotificationPermission, showOrderNotification, getRelativeTime } from "../../../lib/notificationUtils";
import OrderReceipt from "../OrderReceipt";

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

const RANGES = [
  { id: "today", label: "اليوم" },
  { id: "week", label: "آخر 7 أيام" },
  { id: "month", label: "آخر 30 يوم" },
  { id: "all", label: "كل الأوقات" },
];

const ACTIVE_STATUSES = ["pending", "preparing", "ready", "confirmed"];
const ARCHIVED_STATUSES = ["completed", "delivered", "cancelled"];

export default function OrdersTab({ restaurantId, themeColor }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("active"); // "active" | "history"
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const orderIdsRef = useRef(new Set());

  const soundEnabledRef = useRef(soundEnabled);
  const notifEnabledRef = useRef(notifEnabled);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { notifEnabledRef.current = notifEnabled; }, [notifEnabled]);

  // ── Initial Fetch ──
  const fetchOrders = useCallback(async () => {
    try {
      let query = supabase
        .from("orders")
        .select("*, delivery_zones(region_name, fee)")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      const now = new Date();
      if (dateRange === "today") {
        query = query.gte("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());
      } else if (dateRange === "week") {
        query = query.gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
      } else if (dateRange === "month") {
        query = query.gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const fetched = data || [];
      setOrders(fetched);
      orderIdsRef.current = new Set(fetched.map(o => o.id));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, dateRange]);

  useEffect(() => { setLoading(true); fetchOrders(); }, [fetchOrders]);

  // ── Supabase Realtime ──
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`oms-orders-${restaurantId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "orders",
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        const newOrder = payload.new;
        if (!orderIdsRef.current.has(newOrder.id)) {
          // Fetch with joined delivery zone data
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
      })
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  // ── Request notifications ──
  useEffect(() => {
    requestNotificationPermission().then(granted => setNotifEnabled(granted));
  }, []);

  // ── Status Update ──
  const updateStatus = async (orderId, newStatus) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const total = orders.length;
    const successful = orders.filter(o => ["delivered","confirmed","completed"].includes(o.status));
    const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount), 0);
    const pending = orders.filter(o => o.status === "pending").length;
    const preparing = orders.filter(o => o.status === "preparing").length;
    const aov = total > 0 ? revenue / total : 0;
    const rate = total > 0 ? (successful.length / total) * 100 : 0;
    return { revenue, total, pending, preparing, aov, rate };
  }, [orders]);

  // ── Filtered Orders ──
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (viewMode === "active") result = result.filter(o => ACTIVE_STATUSES.includes(o.status));
    else result = result.filter(o => ARCHIVED_STATUSES.includes(o.status));
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

  const activeCount = useMemo(() => orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length, [orders]);

  if (loading) return <LoadingSpinner />;

  const toggleOrder = (id) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        
        {viewMode === "active" ? (
          /* KITCHEN DISPLAY SYSTEM (Kanban) */
          <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory hide-scrollbar">
            
            {/* Column 1: Pending */}
            <div className="flex flex-col w-[90vw] sm:w-[360px] shrink-0 snap-center bg-amber-50/30 rounded-[32px] p-2 sm:p-3 border border-amber-100 max-h-full">
              <div className="shrink-0 flex items-center justify-between px-4 py-3 mb-2 bg-white rounded-2xl shadow-sm border border-amber-100/50">
                <div className="flex items-center gap-2.5 text-amber-600">
                  <Clock size={18} strokeWidth={2.5} />
                  <span className="font-black text-[15px]">طلبات جديدة</span>
                </div>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[12px] font-black">
                  {filteredOrders.filter(o => o.status === "pending").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 hide-scrollbar">
                {filteredOrders.filter(o => o.status === "pending").map((order) => (
                  <KitchenTicket key={order.id} order={order}
                    onStatusUpdate={updateStatus} themeColor={themeColor}
                    onPrint={() => setReceiptOrder(order)} />
                ))}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div className="flex flex-col w-[90vw] sm:w-[360px] shrink-0 snap-center bg-blue-50/30 rounded-[32px] p-2 sm:p-3 border border-blue-100 max-h-full">
              <div className="shrink-0 flex items-center justify-between px-4 py-3 mb-2 bg-white rounded-2xl shadow-sm border border-blue-100/50">
                <div className="flex items-center gap-2.5 text-blue-600">
                  <ChefHat size={18} strokeWidth={2.5} />
                  <span className="font-black text-[15px]">قيد التجهيز</span>
                </div>
                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[12px] font-black">
                  {filteredOrders.filter(o => o.status === "preparing").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 hide-scrollbar">
                {filteredOrders.filter(o => o.status === "preparing").map((order) => (
                  <KitchenTicket key={order.id} order={order}
                    onStatusUpdate={updateStatus} themeColor={themeColor}
                    onPrint={() => setReceiptOrder(order)} />
                ))}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div className="flex flex-col w-[90vw] sm:w-[360px] shrink-0 snap-center bg-emerald-50/30 rounded-[32px] p-2 sm:p-3 border border-emerald-100 max-h-full">
              <div className="shrink-0 flex items-center justify-between px-4 py-3 mb-2 bg-white rounded-2xl shadow-sm border border-emerald-100/50">
                <div className="flex items-center gap-2.5 text-emerald-600">
                  <PackageCheck size={18} strokeWidth={2.5} />
                  <span className="font-black text-[15px]">جاهزة للاستلام</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[12px] font-black">
                  {filteredOrders.filter(o => o.status === "ready" || o.status === "confirmed").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 hide-scrollbar">
                {filteredOrders.filter(o => o.status === "ready" || o.status === "confirmed").map((order) => (
                  <KitchenTicket key={order.id} order={order}
                    onStatusUpdate={updateStatus} themeColor={themeColor}
                    onPrint={() => setReceiptOrder(order)} />
                ))}
              </div>
            </div>

            
          </div>
        ) : (
          /* HISTORY & STATS VIEW */
          <div className="flex-1 overflow-y-auto pr-1 pb-20 space-y-8">
            
            <section>
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                  <h2 className="text-[16px] font-black text-gray-900">إحصائيات الأداء</h2>
                </div>
                <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                  {RANGES.map((r) => (
                    <button key={r.id} onClick={() => setDateRange(r.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${dateRange === r.id ? "text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                      style={dateRange === r.id ? { backgroundColor: themeColor } : undefined}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي الإيرادات" value={`${stats.revenue.toFixed(0)}`} unit="ج.م" icon={DollarSign} color={themeColor} trend="صافي الدخل" />
                <StatCard label="عدد الطلبات" value={stats.total} icon={ShoppingBag} color="#3b82f6" trend={`${stats.pending} جديد · ${stats.preparing} تجهيز`} />
                <StatCard label="متوسط الطلب" value={stats.aov.toFixed(0)} unit="ج.م" icon={TrendingUp} color="#8b5cf6" trend="AOV" />
                <StatCard label="نسبة النجاح" value={`${stats.rate.toFixed(0)}%`} icon={Target} color="#10b981" trend="الطلبات المكتملة" />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1.5 rounded-full bg-gray-800" />
                <h2 className="text-[16px] font-black text-gray-900">سجل الطلبات</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order}
                    isExpanded={expandedOrders.has(order.id)}
                    onToggle={() => toggleOrder(order.id)}
                    onStatusUpdate={updateStatus} themeColor={themeColor}
                    onPrint={() => setReceiptOrder(order)} />
                ))}
              </div>
              {filteredOrders.length === 0 && (
                <EmptyState text="لا توجد طلبات في السجل تطابق بحثك." icon={ClipboardList} />
              )}
            </section>
          </div>
        )}

      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <OrderReceipt order={receiptOrder} restaurantName="" onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
}

// ── StatCard (unchanged from original) ──
function StatCard({ label, value, unit, icon: Icon, color, trend }) {
  return (
    <div className="group rounded-[28px] bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ backgroundColor: `${color}15` }}><Icon size={20} style={{ color }} /></div>
        <ArrowUpRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-[12px] font-bold text-gray-400 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[24px] sm:text-[28px] font-black text-gray-900 leading-none">{value}</span>
        {unit && <span className="text-[12px] font-bold text-gray-400">{unit}</span>}
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-bold text-gray-400 truncate">{trend}</span>
      </div>
    </div>
  );
}

// ── OrderCard (History List View) ──
function OrderCard({ order, isExpanded, onToggle, onStatusUpdate, themeColor, onPrint }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const TypeIcon = ORDER_TYPE_ICONS[order.order_type] || Truck;
  const cart = order.cart_snapshot || [];
  
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const dateStr = createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });

  const waLink = `https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.tracking_id} ✨`)}`;

  return (
    <div className={`rounded-3xl bg-white border shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? "border-gray-300 shadow-md" : "border-gray-100 hover:border-gray-200"}`}>
      {/* ── Collapsed Header (Always Visible) ── */}
      <button onClick={onToggle} className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 text-right bg-white hover:bg-gray-50/50 transition-colors">
        
        {/* Left Side: Status & Type */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${statusInfo.color}`}>
            <StatusIcon size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[16px] font-black text-gray-900 truncate">{order.customer_name}</span>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0 border border-gray-200">
                <Hash size={10} className="inline mr-0.5" />{order.tracking_id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[12px] font-bold text-gray-500">
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100"><Clock size={12} /> {timeStr} · {dateStr}</span>
              <span className="flex items-center gap-1"><TypeIcon size={12} className="opacity-70" /> {order.order_type === "in_house" ? `طاولة ${order.table_number}` : ORDER_TYPE_LABELS[order.order_type]}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Price & Status Label */}
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] font-bold text-gray-400 mb-0.5">الإجمالي</span>
            <span className="text-[16px] font-black text-gray-900">{Number(order.total_amount).toFixed(0)} <span className="text-[12px] text-gray-500">ج.م</span></span>
          </div>
          <div className={`shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-black border ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>
      </button>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row animate-in slide-in-from-top-2 fade-in duration-300">
          
          {/* Order Items Section */}
          <div className="flex-1 p-5 sm:p-6 border-b lg:border-b-0 lg:border-l border-gray-200">
            <h4 className="text-[14px] font-black text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-gray-400" /> تفاصيل الطلب
            </h4>
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <span className="text-[14px] font-black text-gray-900 w-6 text-left shrink-0 bg-white border border-gray-200 rounded-md py-0.5 shadow-sm h-max">x{item.quantity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <span className="text-[14px] font-black text-gray-900 break-words leading-tight">{item.itemName}</span>
                      <span className="text-[14px] font-bold text-gray-600 shrink-0">{(item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s,e)=>s+Number(e.price),0) || 0))).toFixed(0)} ج</span>
                    </div>
                    
                    {(item.size?.name || item.extras?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.size?.name && (
                          <span className="bg-white text-gray-600 px-2 py-0.5 rounded-md text-[11px] font-black border border-gray-200 shadow-sm">
                            حجم: {item.size.name}
                          </span>
                        )}
                        {item.extras?.map(e => (
                          <span key={e.name} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md text-[11px] font-black border border-orange-100 shadow-sm">
                            + {e.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals Sub-block */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
              <span className="text-[14px] font-black text-gray-900">المبلغ الإجمالي</span>
              <span className="text-[20px] font-black" style={{ color: themeColor }}>{Number(order.total_amount).toFixed(0)} ج.م</span>
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="w-full lg:w-[340px] shrink-0 p-5 sm:p-6 bg-white">
            <h4 className="text-[14px] font-black text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={16} className="text-gray-400" /> العميل والتوصيل
            </h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <div className="bg-white p-2 rounded-xl shadow-sm"><Phone size={14} className="text-gray-500" /></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 mb-0.5">رقم الهاتف</span>
                  <a href={`tel:${order.customer_phone}`} className="text-[14px] font-black text-gray-900 hover:text-blue-600 transition-colors" dir="ltr">{order.customer_phone}</a>
                </div>
              </div>

              {order.order_type === "delivery" && order.delivery_zones && (
                <div className="flex items-start gap-3 bg-blue-50/50 rounded-2xl px-4 py-3 border border-blue-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-50 mt-0.5"><MapPin size={14} className="text-blue-500" /></div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-blue-400 mb-0.5">المنطقة ({order.delivery_zones.fee} ج.م)</span>
                    <span className="text-[13px] font-black text-blue-900 mb-1">{order.delivery_zones.region_name}</span>
                    {order.delivery_address && (
                      <span className="text-[12px] font-bold text-blue-700/80 leading-relaxed bg-white/60 p-2 rounded-lg border border-blue-100/50">
                        {order.delivery_address}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2">
               {/* State actions for history view (if they need to revert or update old orders) */}
               {order.status === "pending" && (
                 <div className="flex gap-2">
                   <button onClick={() => onStatusUpdate(order.id, "preparing")} className="flex-1 py-3 bg-[var(--dynamic-color)] text-white text-[13px] font-black rounded-xl hover:brightness-110 shadow-sm" style={{ backgroundColor: themeColor }}>قبول وتجهيز</button>
                   <button onClick={() => onStatusUpdate(order.id, "cancelled")} className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 text-[13px] font-black rounded-xl hover:bg-red-100">إلغاء</button>
                 </div>
               )}
               {(order.status === "preparing" || order.status === "ready" || order.status === "confirmed") && (
                 <button onClick={() => onStatusUpdate(order.id, "completed")} className="w-full py-3 bg-gray-100 text-gray-700 text-[13px] font-black rounded-xl hover:bg-gray-200 border border-gray-200">
                   نقل إلى المكتملة
                 </button>
               )}

               {/* Utils */}
               <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                 <a href={waLink} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-green-50 text-green-700 text-[13px] font-black rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                   <MessageCircle size={14} /> واتساب
                 </a>
                 <button onClick={onPrint} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-white text-gray-700 text-[13px] font-black rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                   <Printer size={14} /> طباعة الفاتورة
                 </button>
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ── KitchenTicket (Fully Expanded KDS View for Active Orders) ──
function KitchenTicket({ order, onStatusUpdate, themeColor, onPrint }) {
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
          <button onClick={onPrint} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
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
                      + {e.name}
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
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
        {order.status === "pending" && (
          <>
            <button onClick={() => onStatusUpdate(order.id, "preparing")} 
              className="flex-1 py-3 bg-[var(--dynamic-color)] text-white text-[13px] font-black rounded-2xl hover:brightness-110 active:scale-95 shadow-md flex justify-center items-center gap-2"
              style={{ backgroundColor: themeColor }}>
              <ChefHat size={16} /> تجهيز
            </button>
            <button onClick={() => onStatusUpdate(order.id, "cancelled")} 
              className="px-4 py-3 bg-white border border-red-200 text-red-600 text-[13px] font-black rounded-2xl hover:bg-red-50 active:scale-95 flex justify-center items-center gap-1.5">
              <XCircle size={16} /> رفض
            </button>
          </>
        )}
        {order.status === "preparing" && (
          <button onClick={() => onStatusUpdate(order.id, "ready")} 
            className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-black rounded-2xl hover:bg-emerald-700 active:scale-95 shadow-md flex justify-center items-center gap-2">
            <PackageCheck size={16} /> جاهز للتسليم
          </button>
        )}
        {order.status === "ready" && (
          <button onClick={() => onStatusUpdate(order.id, "completed")} 
            className="flex-1 py-3 bg-green-600 text-white text-[13px] font-black rounded-2xl hover:bg-green-700 active:scale-95 shadow-md flex justify-center items-center gap-2">
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
    </div>
  );
}
