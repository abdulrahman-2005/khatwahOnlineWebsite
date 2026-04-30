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
  const [expandedOrder, setExpandedOrder] = useState(null);
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-20">

      {/* ── Realtime Status Bar ── */}
      <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${realtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
          <span className="text-[13px] font-black text-gray-600">
            {realtimeConnected ? "متصل — الطلبات تصل لحظياً" : "غير متصل — جاري الاتصال..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${soundEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}>
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => { requestNotificationPermission().then(g => setNotifEnabled(g)); }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${notifEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
            title={notifEnabled ? "إشعارات مفعلة" : "تفعيل الإشعارات"}>
            {notifEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
            <h2 className="text-[18px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>نظرة عامة على الأداء</h2>
          </div>
          <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {RANGES.map((r) => (
              <button key={r.id} onClick={() => setDateRange(r.id)}
                className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all ${dateRange === r.id ? "text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                style={dateRange === r.id ? { backgroundColor: themeColor } : undefined}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="إجمالي الإيرادات" value={`${stats.revenue.toFixed(0)}`} unit="ج.م" icon={DollarSign} color={themeColor} trend="صافي الدخل" />
          <StatCard label="عدد الطلبات" value={stats.total} icon={ShoppingBag} color="#3b82f6" trend={`${stats.pending} جديد · ${stats.preparing} قيد التجهيز`} />
          <StatCard label="متوسط الطلب" value={stats.aov.toFixed(0)} unit="ج.م" icon={TrendingUp} color="#8b5cf6" trend="AOV" />
          <StatCard label="نسبة النجاح" value={`${stats.rate.toFixed(0)}%`} icon={Target} color="#10b981" trend="الطلبات المكتملة" />
        </div>
      </section>

      {/* ── Orders Section ── */}
      <section>
        <div className="mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={18} className="text-gray-400" />
            <h2 className="text-[16px] font-black text-gray-900">إدارة الطلبات</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="ابحث بالاسم أو رقم الطلب..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white border border-gray-100 pl-4 pr-10 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--dynamic-color)] transition-all shadow-sm" />
              <ShoppingBag className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            </div>
            {/* Active / History Toggle */}
            <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <button onClick={() => setViewMode("active")}
                className={`px-5 py-2 rounded-xl text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "active" ? "text-white shadow-sm" : "text-gray-400"}`}
                style={viewMode === "active" ? { backgroundColor: themeColor } : undefined}>
                <Clock size={14} />
                نشط ({activeCount})
              </button>
              <button onClick={() => setViewMode("history")}
                className={`px-5 py-2 rounded-xl text-[12px] font-black transition-all flex items-center gap-2 ${viewMode === "history" ? "text-white shadow-sm" : "text-gray-400"}`}
                style={viewMode === "history" ? { backgroundColor: themeColor } : undefined}>
                <CheckCircle2 size={14} />
                السجل
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order}
              isExpanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onStatusUpdate={updateStatus} themeColor={themeColor}
              onPrint={() => setReceiptOrder(order)} />
          ))}
          {filteredOrders.length === 0 && (
            <EmptyState text={viewMode === "active" ? "لا توجد طلبات نشطة حالياً 🎉" : "لا توجد طلبات في السجل."} icon={ClipboardList} />
          )}
        </div>
      </section>

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

// ── OrderCard (enhanced with OMS actions, order type, time elapsed, WhatsApp) ──
function OrderCard({ order, isExpanded, onToggle, onStatusUpdate, themeColor, onPrint }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const TypeIcon = ORDER_TYPE_ICONS[order.order_type] || Truck;
  const cart = order.cart_snapshot || [];
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const dateStr = createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
  const [elapsed, setElapsed] = useState(getRelativeTime(order.created_at));

  useEffect(() => {
    const i = setInterval(() => setElapsed(getRelativeTime(order.created_at)), 30000);
    return () => clearInterval(i);
  }, [order.created_at]);

  const waLink = `https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.tracking_id} ✨`)}`;

  return (
    <div className={`rounded-[28px] bg-white border shadow-sm overflow-hidden transition-all ${
      order.status === "pending" ? "border-amber-200 ring-2 ring-amber-100" : "border-gray-100 hover:border-[var(--dynamic-color)]/30"
    }`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 p-5 text-right transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${statusInfo.color}`}>
            <StatusIcon size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[16px] font-black text-gray-900 truncate">{order.customer_name}</span>
              <span className="text-[11px] font-bold text-gray-400 shrink-0 bg-gray-50 px-2 py-0.5 rounded-full"><Hash size={10} className="inline" />{order.tracking_id}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-bold text-gray-400">
              <span className="flex items-center gap-1"><Clock size={12} /> {elapsed}</span>
              <span className="flex items-center gap-1"><TypeIcon size={12} /> {ORDER_TYPE_LABELS[order.order_type] || "توصيل"}</span>
              {order.table_number && <span className="font-black text-blue-500">طاولة {order.table_number}</span>}
              <span className="font-black text-gray-600">{Number(order.total_amount).toFixed(0)} ج.م</span>
            </div>
          </div>
        </div>
        <div className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black border ${statusInfo.color}`}>{statusInfo.label}</div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50/30 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-black text-gray-400 px-1">معلومات العميل</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                  <Phone size={16} className="text-gray-400" />
                  <a href={`tel:${order.customer_phone}`} className="text-[14px] font-black text-gray-800" dir="ltr">{order.customer_phone}</a>
                </div>
                {order.delivery_address && (
                  <div className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-[14px] font-bold text-gray-700 leading-relaxed">{order.delivery_address}</span>
                  </div>
                )}
                {order.delivery_zones && (
                  <div className="flex items-center gap-3 bg-blue-50/50 rounded-2xl px-4 py-3 border border-blue-100">
                    <Truck size={16} className="text-blue-500" />
                    <span className="text-[14px] font-black text-blue-700">{order.delivery_zones.region_name} (+{order.delivery_zones.fee} ج.م)</span>
                  </div>
                )}
              </div>
            </div>
            {/* Cart */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-black text-gray-400 px-1">تفاصيل الفاتورة</h4>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-[14px]">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-gray-900 truncate"><span className="text-gray-400 ml-1">×{item.quantity}</span> {item.itemName}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                        {item.size?.name} {item.extras?.length > 0 && `· ${item.extras.map(e => e.name).join("، ")}`}
                      </div>
                    </div>
                    <span className="font-bold text-gray-600 shrink-0">{(item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s,e)=>s+Number(e.price),0) || 0))).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-[14px] font-black text-gray-900">الإجمالي النهائي</span>
                  <span className="text-[18px] font-black" style={{ color: themeColor }}>{Number(order.total_amount).toFixed(0)} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Actions Row ── */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Status Actions */}
            {order.status === "pending" && (<>
              <button onClick={() => onStatusUpdate(order.id, "preparing")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white transition-all active:scale-95 shadow-lg"
                style={{ backgroundColor: themeColor, boxShadow: `0 10px 20px -5px ${themeColor}40` }}>
                <ChefHat size={18} /> قبول وبدء التجهيز
              </button>
              <button onClick={() => onStatusUpdate(order.id, "cancelled")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-black text-red-600 bg-white border border-red-100 transition-all active:scale-95 hover:bg-red-50">
                <XCircle size={18} /> رفض
              </button>
            </>)}
            {order.status === "preparing" && (
              <button onClick={() => onStatusUpdate(order.id, "ready")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white bg-emerald-600 transition-all active:scale-95 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                <PackageCheck size={18} /> جاهز للاستلام / التوصيل
              </button>
            )}
            {order.status === "ready" && (
              <button onClick={() => onStatusUpdate(order.id, "completed")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white bg-green-600 transition-all active:scale-95 hover:bg-green-700 shadow-lg shadow-green-600/20">
                <CheckCircle2 size={18} /> تم التسليم ✓
              </button>
            )}
            {/* Legacy status support */}
            {order.status === "confirmed" && (
              <button onClick={() => onStatusUpdate(order.id, "delivered")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white bg-green-600 transition-all active:scale-95 hover:bg-green-700 shadow-lg shadow-green-600/20">
                <Truck size={18} /> تم التوصيل
              </button>
            )}

            {/* Utility Actions — always visible */}
            <div className="flex items-center gap-2 mr-auto">
              <a href={waLink} target="_blank" rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all" title="واتساب">
                <MessageCircle size={18} />
              </a>
              <button onClick={onPrint}
                className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all" title="طباعة">
                <Printer size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
