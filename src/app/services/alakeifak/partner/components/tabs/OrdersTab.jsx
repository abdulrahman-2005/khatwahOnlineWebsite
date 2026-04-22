"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Phone, MapPin, Truck, ClipboardList, Check, XCircle, Clock } from "lucide-react";
import { LoadingSpinner, EmptyState } from "../ui/PartnerUI";

const STATUS_MAP = {
  pending:   { label: "قيد الانتظار", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "تم التأكيد", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Check },
  delivered: { label: "تم التوصيل", color: "bg-green-50 text-green-700 border-green-200", icon: Check },
  cancelled: { label: "ملغي", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

export default function OrdersTab({ restaurantId, themeColor }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, delivered, cancelled
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, delivery_zones(region_name, fee)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Poll for new orders every 30s
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    fetchOrders();
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const todayTotal = orders
    .filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString() && o.status !== "cancelled";
    })
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[24px] bg-white border border-gray-100 p-5 shadow-sm">
          <div className="text-[13px] font-bold text-gray-400 mb-1">طلبات اليوم</div>
          <div className="text-[28px] font-black text-gray-900">{orders.filter(o => { const d = new Date(o.created_at); const n = new Date(); return d.toDateString() === n.toDateString(); }).length}</div>
        </div>
        <div className="rounded-[24px] bg-white border border-gray-100 p-5 shadow-sm">
          <div className="text-[13px] font-bold text-gray-400 mb-1">إيرادات اليوم</div>
          <div className="text-[28px] font-black" style={{ color: themeColor }}>{todayTotal.toFixed(0)} <span className="text-[14px] text-gray-400">ج.م</span></div>
        </div>
        <div className="rounded-[24px] bg-white border border-amber-100 p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[13px] font-bold text-amber-500 mb-1">بانتظار التأكيد</div>
          <div className="text-[28px] font-black text-amber-600">{pendingCount}</div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {[
          { id: "all", label: "الكل" },
          { id: "pending", label: "قيد الانتظار" },
          { id: "confirmed", label: "مؤكد" },
          { id: "delivered", label: "تم التوصيل" },
          { id: "cancelled", label: "ملغي" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-[13px] font-black transition-all border ${
              filter === f.id
                ? "text-white border-transparent shadow-md"
                : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
            }`}
            style={filter === f.id ? { backgroundColor: themeColor } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => {
          const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
          const StatusIcon = statusInfo.icon;
          const isExpanded = expandedOrder === order.id;
          const cart = order.cart_snapshot || [];
          const createdAt = new Date(order.created_at);
          const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
          const dateStr = createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });

          return (
            <div key={order.id} className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden transition-all">
              {/* Order Header Row */}
              <button
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${statusInfo.color}`}>
                    <StatusIcon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[16px] font-black text-gray-900 truncate">{order.customer_name}</span>
                      <span className="text-[12px] font-bold text-gray-400 shrink-0">#{order.tracking_id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-400">
                      <span>{dateStr} · {timeStr}</span>
                      <span>·</span>
                      <span className="font-black text-gray-600">{Number(order.total_amount).toFixed(0)} ج.م</span>
                    </div>
                  </div>
                </div>
                <div className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black border ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/30 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Customer Info */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-[16px] px-4 py-2.5 border border-gray-100 shadow-sm">
                      <Phone size={15} className="text-gray-400" />
                      <a href={`tel:${order.customer_phone}`} className="text-[14px] font-bold text-gray-700 hover:underline" dir="ltr">{order.customer_phone}</a>
                    </div>
                    {order.delivery_address && (
                      <div className="flex items-center gap-2 bg-white rounded-[16px] px-4 py-2.5 border border-gray-100 shadow-sm">
                        <MapPin size={15} className="text-gray-400" />
                        <span className="text-[14px] font-bold text-gray-700">{order.delivery_address}</span>
                      </div>
                    )}
                    {order.delivery_zones && (
                      <div className="flex items-center gap-2 bg-blue-50 rounded-[16px] px-4 py-2.5 border border-blue-100">
                        <Truck size={15} className="text-blue-500" />
                        <span className="text-[14px] font-bold text-blue-700">{order.delivery_zones.region_name} ({order.delivery_zones.fee} ج.م)</span>
                      </div>
                    )}
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2">
                    <h4 className="text-[14px] font-black text-gray-500 mb-2">تفاصيل الطلب</h4>
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 bg-white rounded-[16px] px-4 py-3 border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <span className="text-[15px] font-black text-gray-900">{item.itemName}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[12px] font-bold text-gray-400">
                            <span>{item.size?.name}</span>
                            {item.extras?.length > 0 && <span>+ {item.extras.map(e => e.name).join("، ")}</span>}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="text-[13px] font-bold text-gray-400">×{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "confirmed")}
                          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-black text-white transition-all active:scale-95"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Check size={16} /> تأكيد الطلب
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "cancelled")}
                          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-black text-red-600 bg-red-50 border border-red-200 transition-all active:scale-95 hover:bg-red-100"
                        >
                          <XCircle size={16} /> إلغاء
                        </button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(order.id, "delivered")}
                        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-black text-white bg-green-600 transition-all active:scale-95 hover:bg-green-700"
                      >
                        <Check size={16} /> تم التوصيل
                      </button>
                    )}
                    {(order.status === "delivered" || order.status === "cancelled") && (
                      <span className="text-[13px] font-bold text-gray-400 px-2">لا يمكن تعديل هذا الطلب.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <EmptyState text={filter === "all" ? "لا توجد طلبات بعد." : "لا توجد طلبات بهذا الفلتر."} icon={ClipboardList} />}
    </div>
  );
}
