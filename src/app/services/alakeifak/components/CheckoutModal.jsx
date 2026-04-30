"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../lib/cartStore";
import { supabase } from "../lib/supabaseClient";
import { generateWhatsAppUrl } from "../lib/whatsappUtils";
import { X, Send, MapPin, User, Phone, ArrowRight, Truck, ShoppingBag, UtensilsCrossed, Hash } from "lucide-react";

const ORDER_MODES = [
  { id: "delivery", label: "توصيل", icon: Truck, desc: "توصيل لباب البيت" },
  { id: "pickup", label: "استلام", icon: ShoppingBag, desc: "استلام من المحل" },
  { id: "in_house", label: "داخلي", icon: UtensilsCrossed, desc: "اطلب من داخل المحل" },
];

export default function CheckoutModal({ restaurant, deliveryZones, themeColor, isOpen, onBack, onClose }) {
  const { items, deliveryZone, orderType, getSubtotal, getDeliveryFee, getTotal, clearCart, setOrderType } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeColor = themeColor || "#ee930c";

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("khatwah_customer");
      if (saved) {
        const data = JSON.parse(saved);
        setCustomerName(data.name || "");
        setCustomerPhone(data.phone || "");
        setDeliveryAddress(data.address || "");
      }
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("الاسم ورقم الهاتف مطلوبين لتأكيد الطلب.");
      return;
    }
    if (orderType === "delivery" && !deliveryZone) {
      setError("يرجى اختيار منطقة التوصيل من السلة.");
      return;
    }
    if (orderType === "in_house" && !tableNumber.trim()) {
      setError("يرجى إدخال رقم الطاولة.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      localStorage.setItem("khatwah_customer", JSON.stringify({ name: customerName, phone: customerPhone, address: deliveryAddress }));

      const orderPayload = {
        restaurant_id: restaurant.id,
        total_amount: getTotal(),
        cart_snapshot: items.map((item) => ({ itemName: item.itemName, size: item.size, extras: item.extras, quantity: item.quantity })),
        customer_name: customerName,
        customer_phone: customerPhone,
        order_type: orderType,
      };

      // Delivery-specific fields
      if (orderType === "delivery") {
        orderPayload.delivery_address = deliveryAddress;
        orderPayload.delivery_zone_id = deliveryZone?.id || null;
      }

      // In-house specific
      if (orderType === "in_house" && tableNumber.trim()) {
        orderPayload.table_number = tableNumber.trim();
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("tracking_id, id")
        .single();

      if (orderError) throw orderError;

      const whatsappUrl = generateWhatsAppUrl(restaurant.whatsapp_number, {
        trackingId: order.tracking_id, items, deliveryZone, subtotal: getSubtotal(), total: getTotal(),
        customerName, customerPhone, deliveryAddress, restaurantName: restaurant.name,
        orderType, tableNumber,
      });

      // For in-house orders, store the ticket in localStorage for DigitalTicket
      if (orderType === "in_house") {
        localStorage.setItem("khatwah_active_ticket", JSON.stringify({
          orderId: order.id,
          trackingId: order.tracking_id,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          tableNumber,
          total: getTotal(),
          themeColor: activeColor,
          createdAt: new Date().toISOString(),
        }));
      }

      clearCart();
      window.open(whatsappUrl, "_blank");
      onClose();
    } catch (err) {
      setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-6 overscroll-none touch-none" dir="rtl" style={{ '--dynamic-color': activeColor }}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[40px] border border-gray-100 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400 touch-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 sm:px-7 py-4 sm:py-5 relative z-10 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 border border-gray-100 transition-transform active:scale-90"
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <h2 className="text-[20px] sm:text-[22px] font-black tracking-tight text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
              إتمام الطلب
            </h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gray-50 text-gray-500 border border-gray-200 transition-transform active:scale-90 hover:bg-gray-100">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 bg-gray-50/50">
          <div className="space-y-6 p-6">
            
            {error && (
              <div className="rounded-[20px] bg-red-50 border border-red-100 p-4 text-center text-[14px] font-bold text-red-600">
                {error}
              </div>
            )}

            {/* ── Order Mode Selector ── */}
            <div>
              <label className="text-[13px] font-black text-gray-500 mb-3 block px-1">نوع الطلب</label>
              <div className="grid grid-cols-3 gap-3">
                {ORDER_MODES.map((mode) => {
                  const isActive = orderType === mode.id;
                  const ModeIcon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => { setOrderType(mode.id); setError(""); }}
                      className={`relative flex flex-col items-center gap-2 rounded-[20px] p-4 text-center transition-all duration-300 border-2 ${
                        isActive
                          ? "border-[var(--dynamic-color)] bg-[var(--dynamic-color)]/5 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] transition-all ${
                        isActive ? "bg-[var(--dynamic-color)] text-white shadow-lg" : "bg-gray-100 text-gray-400"
                      }`}
                        style={isActive ? { backgroundColor: activeColor, boxShadow: `0 8px 16px -4px ${activeColor}40` } : undefined}>
                        <ModeIcon size={20} />
                      </div>
                      <span className={`text-[13px] font-black ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {mode.label}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 leading-tight">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Customer Info ── */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text" placeholder="الاسم بالكامل" value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <Phone size={20} className="text-gray-400" />
                </div>
                <input
                  type="tel" placeholder="رقم الهاتف (واتساب)" value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  dir="ltr" style={{ textAlign: "right" }}
                />
              </div>

              {/* Delivery-only: Address */}
              {orderType === "delivery" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute top-4 right-0 flex items-center pr-5 pointer-events-none">
                    <MapPin size={20} className="text-gray-400" />
                  </div>
                  <textarea
                    placeholder={`العنوان بالتفصيل (${deliveryZone?.region_name || 'المنطقة'})`}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="min-h-[100px] w-full resize-none rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  />
                </div>
              )}

              {/* In-house only: Table Number */}
              {orderType === "in_house" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                    <Hash size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text" placeholder="رقم الطاولة" value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  />
                </div>
              )}
            </div>
            
            {/* Info banner — contextual */}
            <div className="rounded-[24px] bg-blue-50/50 p-5 mt-4 border border-blue-100 flex gap-3 text-right">
              <span className="text-[13px] font-medium leading-relaxed text-blue-800">
                {orderType === "delivery" && "سيتم تحويلك إلى واتساب لإرسال تفاصيل الطلب مباشرة إلى المطعم. سيقوم المطعم بتجهيز طلبك فور استلام الرسالة."}
                {orderType === "pickup" && "اطلب الآن واستلم طلبك جاهزاً من المحل. سيتم إعلامك عبر واتساب عند جاهزية الطلب."}
                {orderType === "in_house" && "سيتم إرسال طلبك مباشرة للمطبخ. يمكنك متابعة حالة طلبك مباشرة من هاتفك."}
              </span>
            </div>

            {/* Price Summary */}
            <div className="rounded-[24px] bg-white border border-gray-100 p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="font-bold text-gray-500">المجموع الفرعي</span>
                <span className="font-black text-gray-900">{getSubtotal().toFixed(0)} ج.م</span>
              </div>
              {orderType === "delivery" && deliveryZone && (
                <div className="flex justify-between text-[14px]">
                  <span className="font-bold text-gray-500">التوصيل ({deliveryZone.region_name})</span>
                  <span className="font-black text-gray-900">{getDeliveryFee().toFixed(0)} ج.م</span>
                </div>
              )}
              {orderType !== "delivery" && (
                <div className="flex justify-between text-[14px]">
                  <span className="font-bold text-gray-500">التوصيل</span>
                  <span className="font-black text-emerald-600">مجاناً ✓</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                <span className="text-[16px] font-black text-gray-900">الإجمالي</span>
                <span className="text-[20px] font-black" style={{ color: activeColor }}>{getTotal().toFixed(0)} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-6 pb-8 pt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              submitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[var(--dynamic-color)] text-white shadow-[0_15px_40px_-5px_var(--dynamic-color)]"
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                جاري التجهيز...
              </span>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  <Send size={20} />
                  {orderType === "in_house" ? "إرسال الطلب للمطبخ" : "إرسال الطلب عبر واتساب"}
                </span>
                <span className="relative z-10 mr-2 rounded-full bg-white/20 px-3 py-1 text-[13px] backdrop-blur-md">
                  {getTotal().toFixed(0)} ج
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
