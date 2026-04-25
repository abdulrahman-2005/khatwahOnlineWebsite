"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { 
  Phone, MapPin, Truck, ClipboardList, Check, XCircle, Clock, 
  TrendingUp, Calendar, DollarSign, ShoppingBag, Target, ArrowUpRight, Filter
} from "lucide-react";
import { LoadingSpinner, EmptyState } from "../ui/PartnerUI";

const STATUS_MAP = {
  pending:   { label: "قيد الانتظار", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "تم التأكيد", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Check },
  delivered: { label: "تم التوصيل", color: "bg-green-50 text-green-700 border-green-200", icon: Check },
  cancelled: { label: "ملغي", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const RANGES = [
  { id: "today", label: "اليوم" },
  { id: "week", label: "آخر 7 أيام" },
  { id: "month", label: "آخر 30 يوم" },
  { id: "all", label: "كل الأوقات" },
];

export default function OrdersTab({ restaurantId, themeColor }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    let query = supabase
      .from("orders")
      .select("*, delivery_zones(region_name, fee)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    // Apply date filter
    const now = new Date();
    if (dateRange === "today") {
      const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
      query = query.gte("created_at", startOfDay);
    } else if (dateRange === "week") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      query = query.gte("created_at", sevenDaysAgo);
    } else if (dateRange === "month") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
      query = query.gte("created_at", thirtyDaysAgo);
    }

    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }, [restaurantId, dateRange]);

  useEffect(() => { 
    setLoading(true);
    fetchOrders(); 
  }, [fetchOrders]);

  // Poll for new orders every 30s
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Status updates
  const updateStatus = async (orderId, newStatus) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    fetchOrders();
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const successfulOrders = orders.filter(o => o.status === "delivered" || o.status === "confirmed");
    const totalRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    const pendingCount = orders.filter(o => o.status === "pending").length;
    const aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    const successRate = totalOrders > 0 ? (successfulOrders.length / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      pendingCount,
      aov,
      successRate
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customer_name.toLowerCase().includes(q) || 
        o.tracking_id.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      
      {/* 📊 Insights Dashboard Section */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
            <h2 className="text-[18px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>نظرة عامة على الأداء</h2>
          </div>
          
          {/* Range Selector */}
          <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  dateRange === range.id 
                    ? "bg-[var(--dynamic-color)] text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={dateRange === range.id ? { backgroundColor: themeColor } : undefined}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="إجمالي الإيرادات" 
            value={`${stats.totalRevenue.toFixed(0)}`} 
            unit="ج.م"
            icon={DollarSign} 
            color={themeColor}
            trend="صافي الدخل"
          />
          <StatCard 
            label="عدد الطلبات" 
            value={stats.totalOrders} 
            icon={ShoppingBag} 
            color="#3b82f6"
            trend={`${stats.pendingCount} قيد الانتظار`}
          />
          <StatCard 
            label="متوسط الطلب" 
            value={stats.aov.toFixed(0)} 
            unit="ج.م"
            icon={TrendingUp} 
            color="#8b5cf6"
            trend="AOV Insight"
          />
          <StatCard 
            label="نسبة النجاح" 
            value={`${stats.successRate.toFixed(0)}%`} 
            icon={Target} 
            color="#10b981"
            trend="الطلبات المكتملة"
          />
        </div>
      </section>

      {/* 📋 Orders List Section */}
      <section>
        <div className="mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={18} className="text-gray-400" />
            <h2 className="text-[16px] font-black text-gray-900">سجل الطلبات</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو رقم الطلب..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white border border-gray-100 pl-4 pr-10 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--dynamic-color)] transition-all shadow-sm"
              />
              <ShoppingBag className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 w-full sm:w-auto">
              {["all", "pending", "confirmed", "delivered", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-[12px] font-black border transition-all ${
                    statusFilter === f 
                      ? "border-transparent text-white shadow-md" 
                      : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
                  style={statusFilter === f ? { backgroundColor: themeColor } : undefined}
                >
                  {f === "all" ? "الكل" : STATUS_MAP[f].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderRow 
              key={order.id} 
              order={order} 
              isExpanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onStatusUpdate={updateStatus}
              themeColor={themeColor}
            />
          ))}
          {filteredOrders.length === 0 && (
            <EmptyState 
              text={statusFilter === "all" ? "لا توجد طلبات في هذه الفترة." : "لا توجد طلبات بهذا الفلتر."} 
              icon={ClipboardList} 
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, color, trend }) {
  return (
    <div className="group rounded-[28px] bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <ArrowUpRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
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
    </div>
  );
}

function OrderRow({ order, isExpanded, onToggle, onStatusUpdate, themeColor }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const cart = order.cart_snapshot || [];
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const dateStr = createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });

  return (
    <div className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-[var(--dynamic-color)]/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-right transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${statusInfo.color}`}>
            <StatusIcon size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[16px] font-black text-gray-900 truncate">{order.customer_name}</span>
              <span className="text-[11px] font-bold text-gray-400 shrink-0 bg-gray-50 px-2 py-0.5 rounded-full">#{order.tracking_id}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-bold text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr} · {timeStr}</span>
              <span className="font-black text-gray-600">{Number(order.total_amount).toFixed(0)} ج.م</span>
            </div>
          </div>
        </div>
        <div className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black border ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50/30 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-4">
              <h4 className="text-[13px] font-black text-gray-400 px-1">تفاصيل الفاتورة</h4>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-[14px]">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-gray-900 truncate">
                        <span className="text-gray-400 ml-1">×{item.quantity}</span> {item.itemName}
                      </div>
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

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => onStatusUpdate(order.id, "confirmed")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white transition-all active:scale-95 shadow-lg shadow-[var(--dynamic-color)]/20"
                  style={{ backgroundColor: themeColor }}
                >
                  <Check size={18} /> تأكيد وقبول الطلب
                </button>
                <button
                  onClick={() => onStatusUpdate(order.id, "cancelled")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-black text-red-600 bg-white border border-red-100 transition-all active:scale-95 hover:bg-red-50"
                >
                  <XCircle size={18} /> رفض الطلب
                </button>
              </>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => onStatusUpdate(order.id, "delivered")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white bg-green-600 transition-all active:scale-95 hover:bg-green-700 shadow-lg shadow-green-600/20"
              >
                <Truck size={18} /> تم التوصيل للعميل
              </button>
            )}
            {(order.status === "delivered" || order.status === "cancelled") && (
              <div className="flex items-center gap-2 text-gray-400 text-[13px] font-bold italic px-2">
                <Check size={14} /> حالة نهائية مكتملة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
