"use client";

import { memo } from "react";
import {
  MapPin, Truck, XCircle, Clock, DollarSign, ShoppingBag,
  ChefHat, PackageCheck, CheckCircle2, MessageCircle, Printer,
  Hash, UtensilsCrossed, Eye
} from "lucide-react";

const STATUS_MAP = {
  pending:   { label: "جديد", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  preparing: { label: "قيد التجهيز", color: "bg-blue-50 text-blue-700 border-blue-200", icon: ChefHat },
  ready:     { label: "جاهز", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: PackageCheck },
  completed: { label: "مكتمل", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  confirmed: { label: "مؤكد", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  delivered: { label: "تم التوصيل", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const ORDER_TYPE_ICONS = { delivery: Truck, pickup: ShoppingBag, in_house: UtensilsCrossed };
const ORDER_TYPE_LABELS = { delivery: "توصيل", pickup: "استلام", in_house: "داخلي" };

const ACTIVE_STATUSES = ["pending", "preparing", "ready", "confirmed"];
const ARCHIVED_STATUSES = ["completed", "delivered", "cancelled"];
const LOSS_STATUSES = ["ready", "confirmed"];

const OrderRow = memo(function OrderRow({ order, isExpanded, onToggle, onStatusUpdate, themeColor, setReceiptOrder, setCancelConfirm }) {
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const TypeIcon = ORDER_TYPE_ICONS[order.order_type] || Truck;
  const cart = order.cart_snapshot || [];
  
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const waLink = `https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.tracking_id} ✨`)}`;

  const statusTheme = {
    pending:   { bg: 'bg-amber-50', border: 'border-amber-300', accent: 'bg-amber-500', headerBg: 'bg-amber-100/70' },
    preparing: { bg: 'bg-sky-50', border: 'border-sky-300', accent: 'bg-sky-500', headerBg: 'bg-sky-100/70' },
    ready:     { bg: 'bg-emerald-50', border: 'border-emerald-300', accent: 'bg-emerald-500', headerBg: 'bg-emerald-100/70' },
    confirmed: { bg: 'bg-blue-50', border: 'border-blue-300', accent: 'bg-blue-500', headerBg: 'bg-blue-100/70' },
    completed: { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'bg-green-500', headerBg: 'bg-slate-100/60' },
    delivered: { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'bg-green-500', headerBg: 'bg-slate-100/60' },
    cancelled: { bg: 'bg-red-50/60', border: 'border-red-200', accent: 'bg-red-500', headerBg: 'bg-red-100/50' },
  }[order.status] || { bg: 'bg-white', border: 'border-gray-200', accent: 'bg-gray-400', headerBg: 'bg-gray-50' };

  const isPending = order.status === 'pending';

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${statusTheme.bg} ${statusTheme.border} ${isPending ? 'ring-2 ring-amber-200 shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
      {/* Accent stripe */}
      <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${statusTheme.accent}`} />

      {/* ── Header Row ── */}
      <div className={`flex items-center gap-3 px-4 pr-5 py-3 ${statusTheme.headerBg} cursor-pointer`} onClick={() => onToggle(order.id)}>
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-black border shadow-sm ${statusInfo.color}`}>
          <StatusIcon size={16} />
          <span>{statusInfo.label}</span>
        </div>
        {/* Order ID */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200/80 shadow-sm">
          <Hash size={12} className="text-gray-400" />
          <span className="text-[14px] font-black text-gray-900">{order.tracking_id}</span>
        </div>
        {/* Time */}
        <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1">
          <Clock size={12} /> {timeStr}
        </span>
        <div className="flex-1" />
        {/* Customer Name + Phone grouped */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200/80">
          <span className="text-[14px] font-black text-gray-900">{order.customer_name}</span>
          <span className="text-[12px] font-bold text-gray-500" dir="ltr">{order.customer_phone}</span>
        </div>
        {/* Order Type + Items + Total */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-gray-200/80">
            <TypeIcon size={14} className="opacity-70" />
            {order.order_type === "in_house" ? `طاولة ${order.table_number}` : ORDER_TYPE_LABELS[order.order_type]}
          </div>
          <span className="text-[12px] font-bold text-gray-500 bg-white/60 px-2 py-1 rounded-lg">{totalItems} أصناف</span>
          <span className={`text-[16px] font-black px-2 ${Number(order.total_amount) < 0 ? "text-red-700" : "text-gray-900"}`}>
            {Number(order.total_amount).toFixed(0)} <span className="text-[11px] text-gray-500">ج.م</span>
          </span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggle(order.id); }} className="h-9 w-9 flex items-center justify-center bg-white/80 text-gray-600 border border-gray-200/80 rounded-xl hover:bg-white transition-all">
          <Eye size={16} />
        </button>
      </div>

      {/* ── Mobile-only info row ── */}
      <div className="flex sm:hidden items-center justify-between gap-2 px-4 pr-5 py-2 border-t border-gray-200/50 bg-white/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-black text-gray-900 truncate">{order.customer_name}</span>
          <span className="text-[12px] font-bold text-gray-500 shrink-0" dir="ltr">{order.customer_phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
            <TypeIcon size={12} />
            {ORDER_TYPE_LABELS[order.order_type]}
          </div>
          <span className="text-[12px] font-bold text-gray-500">{totalItems} أصناف</span>
          <span className={`text-[14px] font-black ${Number(order.total_amount) < 0 ? "text-red-700" : "text-gray-900"}`}>
            {Number(order.total_amount).toFixed(0)} ج.م
          </span>
        </div>
      </div>

      {/* ── Action Buttons Bar ── */}
      <div className="flex items-center justify-between gap-2 px-4 pr-5 py-2.5 border-t border-gray-200/60 bg-white/50" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <>
              <button onClick={() => onStatusUpdate(order.id, "preparing")} className="px-6 py-2.5 text-white text-[14px] font-black rounded-xl shadow-md transition-all active:scale-95 hover:brightness-110" style={{ backgroundColor: themeColor }}>
                <span className="flex items-center gap-2"><ChefHat size={16} /> قبول وتجهيز</span>
              </button>
              <button onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })} className="px-4 py-2.5 bg-red-100 text-red-700 border border-red-300 text-[13px] font-black rounded-xl hover:bg-red-200 transition-all active:scale-95">إلغاء</button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button onClick={() => onStatusUpdate(order.id, "ready")} className="px-6 py-2.5 bg-sky-600 text-white text-[14px] font-black rounded-xl shadow-md hover:bg-sky-700 transition-all active:scale-95">
                <span className="flex items-center gap-2"><PackageCheck size={16} /> جاهز للتسليم</span>
              </button>
              <button onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })} className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 text-[12px] font-black rounded-xl hover:bg-red-100 transition-all active:scale-95">
                <span className="flex items-center gap-1.5"><XCircle size={14} /> إلغاء</span>
              </button>
            </>
          )}
          {(order.status === "ready" || order.status === "confirmed") && (
            <>
              <button onClick={() => onStatusUpdate(order.id, order.order_type === "delivery" ? "delivered" : "completed")} className="px-6 py-2.5 bg-emerald-600 text-white text-[14px] font-black rounded-xl shadow-md hover:bg-emerald-700 transition-all active:scale-95">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {order.order_type === "delivery" ? "تم التوصيل" : "تم التسليم"}</span>
              </button>
              <button onClick={() => setCancelConfirm({ orderId: order.id, currentStatus: order.status, originalAmount: order.total_amount })} className="px-4 py-2.5 bg-red-100 text-red-700 border border-red-300 text-[12px] font-black rounded-xl hover:bg-red-200 transition-all active:scale-95">
                <span className="flex items-center gap-1.5"><XCircle size={14} /> إلغاء (خسارة)</span>
              </button>
            </>
          )}
          {ARCHIVED_STATUSES.includes(order.status) && (
            <div className={`px-4 py-2 rounded-xl text-[13px] font-black border shadow-sm ${order.status === "cancelled" ? (Number(order.total_amount) < 0 ? "bg-red-100 text-red-800 border-red-300" : "bg-gray-200 text-gray-700 border-gray-400") : statusInfo.color}`}>
              {order.status === "cancelled" ? (Number(order.total_amount) < 0 ? "خسارة" : "ملغي") : statusInfo.label}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href={waLink} target="_blank" rel="noreferrer" className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500 text-white shadow-sm hover:bg-green-600 transition-all active:scale-95" title="واتساب">
            <MessageCircle size={18} />
          </a>
          <button onClick={() => setReceiptOrder(order)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 transition-all active:scale-95" title="طباعة">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="border-t-2 border-gray-300/70 bg-white animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="flex flex-col lg:flex-row">
            {/* Order Items */}
            <div className="flex-1 p-4 lg:p-5">
              <h4 className="text-[12px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag size={14} /> تفاصيل الطلب
              </h4>
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                      <span className="text-[14px] font-black">x{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-[14px] font-black text-gray-900 leading-tight">{item.itemName}</span>
                        <span className="text-[14px] font-black text-gray-800 shrink-0">
                          {(item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s,e)=>s + Number(e.price) * Number(e.quantity || 1), 0) || 0))).toFixed(0)} <span className="text-[11px] text-gray-500">ج.م</span>
                        </span>
                      </div>
                      {(item.size?.name || item.extras?.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.size?.name && (
                            <span className="bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-black">حجم: {item.size.name}</span>
                          )}
                          {item.extras?.map(e => (
                            <span key={e.name} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-[11px] font-black border border-orange-200">
                              + {e.name} {Number(e.quantity || 1) > 1 ? `(x${e.quantity})` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="mt-4 flex justify-between items-center bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-md">
                <span className="text-[14px] font-black flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" /> المبلغ الإجمالي
                </span>
                <span className="text-[22px] font-black tracking-tight">
                  {Number(order.total_amount).toFixed(0)} <span className="text-[13px] text-gray-400">ج.م</span>
                </span>
              </div>
            </div>
            {/* Delivery Info */}
            {order.order_type === "delivery" && order.delivery_zones && (
              <div className="w-full lg:w-[300px] shrink-0 p-4 lg:p-5 lg:border-r-2 border-t-2 lg:border-t-0 border-gray-200 bg-slate-50/80">
                <h4 className="text-[12px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck size={14} /> معلومات التوصيل
                </h4>
                <div className="bg-sky-50 rounded-xl px-4 py-3.5 border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-sky-200"><MapPin size={16} className="text-sky-600" /></div>
                    <div>
                      <span className="text-[11px] font-bold text-sky-600 block">المنطقة ({order.delivery_zones.fee} ج.م)</span>
                      <span className="text-[14px] font-black text-sky-950">{order.delivery_zones.region_name}</span>
                    </div>
                  </div>
                  {order.delivery_address && (
                    <div className="mt-2 text-[13px] font-bold text-sky-900 bg-white/70 p-2.5 rounded-lg border border-sky-200/60 leading-relaxed">
                      {order.delivery_address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default OrderRow;
export { STATUS_MAP, ORDER_TYPE_ICONS, ORDER_TYPE_LABELS, ACTIVE_STATUSES, ARCHIVED_STATUSES, LOSS_STATUSES };
