"use client";

import { useState, useEffect, useRef } from "react";
import { useCartStore } from "../lib/cartStore";
import { supabase } from "../lib/supabaseClient";
import { generateWhatsAppUrl, formatEgyptianPhone, isValidEgyptianPhone, openWhatsAppUrl } from "../lib/whatsappUtils";
import { X, Send, MapPin, User, Phone, ArrowRight, Truck, ShoppingBag, UtensilsCrossed, Hash } from "lucide-react";
import { lockScroll, unlockScroll } from "../lib/scrollLockManager";
import { safeMutation } from "../lib/safeQuery";
import { track } from "@vercel/analytics";



export default function CheckoutModal({ restaurant, deliveryZones, themeColor, isOpen, onBack, onClose }) {
  const { items, deliveryZone, orderType, getSubtotal, getDeliveryFee, getTotal, clearCart, setOrderType, showDeliveryPricing } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [estimatedOrderCount, setEstimatedOrderCount] = useState(null);
  const submitLock = useRef(false);

  const activeColor = themeColor || "#ee930c";

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      
      // Pre-fetch order count to have it ready synchronously for WhatsApp
      if (restaurant?.id) {
        supabase.rpc('get_public_order_count', { p_restaurant_id: restaurant.id })
          .then(({ data }) => {
            if (data !== null) setEstimatedOrderCount(data + 1); // +1 because this is the next order
          })
          .catch(console.error);
      }
      
      return () => unlockScroll();
    }
  }, [isOpen, restaurant?.id]);

  // Emergency cleanup on unmount
  useEffect(() => () => unlockScroll(), []);

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
    let finalPhone = customerPhone;
    if (orderType !== "in_house") {
      if (!customerName.trim() || !customerPhone.trim()) {
        setError("الاسم ورقم الهاتف مطلوبين لتأكيد الطلب.");
        return;
      }
      finalPhone = formatEgyptianPhone(customerPhone);
      if (!isValidEgyptianPhone(finalPhone)) {
        setError("يرجى إدخال رقم هاتف مصري صحيح.");
        return;
      }
    } else {
      if (customerPhone.trim()) {
        finalPhone = formatEgyptianPhone(customerPhone);
        if (!isValidEgyptianPhone(finalPhone)) {
          setError("يرجى إدخال رقم هاتف مصري صحيح.");
          return;
        }
      }
    }

    if (orderType === "delivery" && !deliveryZone) {
      setError("يرجى اختيار منطقة التوصيل من السلة.");
      return;
    }

    if (submitLock.current) return;

    // Deduplication: prevent identical cart resubmissions within 60 seconds (accidental refresh)
    const orderHash = btoa(encodeURIComponent(JSON.stringify(items) + getTotal()));
    try {
      const lastOrder = JSON.parse(sessionStorage.getItem("khatwah_last_order") || "null");
      if (lastOrder && lastOrder.hash === orderHash && (Date.now() - lastOrder.time < 60000)) {
        setError("لقد قمت بإرسال هذا الطلب للتو. يرجى الانتظار دقيقة قبل إرسال طلب مطابق.");
        return;
      }
    } catch { /* ignore parse errors */ }

    submitLock.current = true;
    setSubmitting(true);
    setError("");

    try {
      localStorage.setItem("khatwah_customer", JSON.stringify({ name: customerName, phone: customerPhone, address: deliveryAddress }));

      const orderPayload = {
        restaurant_id: restaurant.id,
        total_amount: getTotal(),
        cart_snapshot: items.map((item) => ({ itemName: item.itemName, size: item.size, extras: item.extras, quantity: item.quantity })),
        customer_name: customerName,
        customer_phone: finalPhone,
        order_type: orderType,
      };

      if (orderType !== "in_house") {
        setCustomerPhone(finalPhone);
      } else if (customerPhone.trim()) {
        setCustomerPhone(finalPhone);
      }

      // Delivery-specific fields
      if (orderType === "delivery") {
        orderPayload.delivery_address = deliveryAddress;
        orderPayload.delivery_zone_id = deliveryZone?.id || null;
      }

      // In-house specific
      if (orderType === "in_house" && tableNumber.trim()) {
        orderPayload.table_number = tableNumber.trim();
      }

      // 1. OPEN WHATSAPP SYNCHRONOUSLY BEFORE ANY AWAIT TO BYPASS IOS WEBKIT BLOCKERS
      if (orderType !== "in_house") {
        const whatsappUrl = generateWhatsAppUrl(restaurant.whatsapp_number, {
          trackingId: null, // Not used in WA message text
          orderCount: estimatedOrderCount, // Pre-fetched synchronously to avoid await blockers
          items, 
          deliveryZone, 
          subtotal: getSubtotal(), 
          total: getTotal(),
          customerName, 
          customerPhone: finalPhone, 
          deliveryAddress, 
          restaurantName: restaurant.name,
          orderType, 
          tableNumber, 
          showDeliveryPricing,
        });
        openWhatsAppUrl(whatsappUrl);
      }

      const { data: order, error: orderError } = await safeMutation(() =>
        supabase.rpc('place_order_secure', { payload: orderPayload })
      );

      if (orderError) {
        console.error("Order submission error:", orderError);
        throw orderError;
      }

      // Store the ticket in localStorage for DigitalTicket ONLY for in_house
      if (orderType === "in_house") {
        localStorage.setItem("khatwah_active_ticket", JSON.stringify({
          orderId: order.id,
          trackingId: order.tracking_id,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          items: orderPayload.cart_snapshot,
          total: getTotal(),
          themeColor: activeColor,
          createdAt: new Date().toISOString(),
        }));
      }

      clearCart();
      
      window.dispatchEvent(new Event("khatwah_ticket_created"));
      
      // Store successful submission hash
      sessionStorage.setItem("khatwah_last_order", JSON.stringify({ hash: orderHash, time: Date.now() }));
      
      // Track Analytics
      track("alakeifak_order_created", { restaurant_id: restaurant.id, total: getTotal(), order_type: orderType });

      onClose();
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-6 overscroll-none touch-none" dir="rtl" style={{ '--dynamic-color': activeColor }}>
      <div className="absolute inset-0 bg-[#050D1A]/80 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[40px] border border-white/10 bg-[#0A0F1A] shadow-[0_-20px_50px_rgba(62,39,35,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400 touch-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 sm:px-7 py-4 sm:py-5 relative z-10 bg-[#0A0F1A]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#131B2B] text-gray-400 border border-white/10 transition-transform active:scale-90 hover:bg-[#2A3B59]"
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <h2 className="text-[20px] sm:text-[22px] font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              إتمام الطلب
            </h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#131B2B] text-gray-400 border border-white/10 transition-transform active:scale-90 hover:bg-[#2A3B59]">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 bg-[#131B2B]">
          <div className="space-y-6 p-6">
            
            {error && (
              <div className="rounded-[20px] bg-red-50 border border-red-100 p-4 text-center text-[14px] font-bold text-red-600">
                {error}
              </div>
            )}



            {/* ── Customer Info ── */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <User size={20} className="text-gray-500" />
                </div>
                <input
                  type="text" placeholder={orderType === "in_house" ? "الاسم (اختياري)" : "الاسم بالكامل"} value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-[24px] border border-white/20 bg-[#1E293B] py-4 pl-5 pr-14 text-[16px] font-bold text-white placeholder:text-gray-500 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <Phone size={20} className="text-gray-500" />
                </div>
                <input
                  type="tel" placeholder={orderType === "in_house" ? "رقم الهاتف (اختياري)" : "رقم الهاتف (واتساب)"} value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onBlur={() => setCustomerPhone(formatEgyptianPhone(customerPhone))}
                  className="w-full rounded-[24px] border border-white/20 bg-[#1E293B] py-4 pl-5 pr-14 text-[16px] font-bold text-white placeholder:text-gray-500 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  dir="ltr" style={{ textAlign: "right" }}
                />
              </div>

              {/* In-House: Table Number */}
              {orderType === "in_house" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                    <Hash size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="رقم الطاولة (اختياري)"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full rounded-[24px] border border-white/20 bg-[#1E293B] py-4 pl-5 pr-14 text-[16px] font-bold text-white placeholder:text-gray-500 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  />
                </div>
              )}

              {/* Delivery-only: Address */}
              {orderType === "delivery" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute top-4 right-0 flex items-center pr-5 pointer-events-none">
                    <MapPin size={20} className="text-gray-500" />
                  </div>
                  <textarea
                    placeholder={`العنوان بالتفصيل (${deliveryZone?.region_name || 'المنطقة'})`}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="min-h-[100px] w-full resize-none rounded-[24px] border border-white/20 bg-[#1E293B] py-4 pl-5 pr-14 text-[16px] font-bold text-white placeholder:text-gray-500 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
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
            <div className="rounded-[24px] bg-[#1E293B] border border-white/10 p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="font-bold text-gray-400">المجموع الفرعي</span>
                <span className="font-black text-white">{getSubtotal().toFixed(0)} ج.م</span>
              </div>
              {orderType === "delivery" && deliveryZone && showDeliveryPricing && (
                <div className="flex justify-between text-[14px]">
                  <span className="font-bold text-gray-400">التوصيل ({deliveryZone.region_name})</span>
                  <span className="font-black text-white">{getDeliveryFee().toFixed(0)} ج.م</span>
                </div>
              )}
              <div className="border-t border-dashed border-white/10 pt-3 flex justify-between">
                <span className="text-[16px] font-black text-white">الإجمالي</span>
                <span className="text-[20px] font-black" style={{ color: activeColor }}>{getTotal().toFixed(0)} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-[#0A0F1A] px-6 pb-8 pt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              submitting ? "bg-[#2A3B59] text-gray-500 cursor-not-allowed" : "bg-[var(--dynamic-color)] text-white shadow-[0_15px_40px_-5px_var(--dynamic-color)]"
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                جاري التجهيز...
              </span>
            ) : (
              <>
                <div className="absolute inset-0 bg-[#1E293B]/20 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  <Send size={20} />
                  {orderType === "in_house" ? "إرسال الطلب للمطبخ" : "إرسال الطلب عبر واتساب"}
                </span>
                <span className="relative z-10 mr-2 rounded-full bg-[#1E293B]/20 px-3 py-1 text-[13px] backdrop-blur-md">
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
