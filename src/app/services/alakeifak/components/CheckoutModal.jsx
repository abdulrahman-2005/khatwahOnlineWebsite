"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../lib/cartStore";
import { supabase } from "../lib/supabaseClient";
import { generateWhatsAppUrl } from "../lib/whatsappUtils";
import { X, Send, MapPin, User, Phone, ArrowRight } from "lucide-react";

export default function CheckoutModal({ restaurant, deliveryZones, themeColor, isOpen, onBack, onClose }) {
  const { items, deliveryZone, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
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
    if (!deliveryZone) {
      setError("يرجى اختيار منطقة التوصيل من السلة.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      localStorage.setItem("khatwah_customer", JSON.stringify({ name: customerName, phone: customerPhone, address: deliveryAddress }));

      const { data: order, error: orderError } = await supabase.from("orders").insert({
        restaurant_id: restaurant.id,
        total_amount: getTotal(),
        cart_snapshot: items.map((item) => ({ itemName: item.itemName, size: item.size, extras: item.extras, quantity: item.quantity })),
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_zone_id: deliveryZone.id,
      }).select("tracking_id").single();

      if (orderError) throw orderError;

      const whatsappUrl = generateWhatsAppUrl(restaurant.whatsapp_number, {
        trackingId: order.tracking_id, items, deliveryZone, subtotal: getSubtotal(), total: getTotal(), customerName, customerPhone, deliveryAddress, restaurantName: restaurant.name,
      });

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
              البيانات الشخصية
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

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="الاسم بالكامل"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <Phone size={20} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  placeholder="رقم الهاتف (واتساب)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-[24px] border border-gray-200 bg-white py-4 pl-5 pr-14 text-[16px] font-bold text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/20 shadow-sm"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>

              <div className="relative">
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
            </div>
            
            <div className="rounded-[24px] bg-blue-50/50 p-5 mt-4 border border-blue-100 flex gap-3 text-right">
              <span className="text-[13px] font-medium leading-relaxed text-blue-800">
                سيتم تحويلك إلى واتساب لإرسال تفاصيل الطلب مباشرة إلى المطعم. سيقوم المطعم بتجهيز طلبك فور استلام الرسالة.
              </span>
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
                  إرسال الطلب عبر واتساب
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
