"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "../lib/cartStore";
import { X, Plus, Minus, Trash2, ShoppingCart, MapPin, BadgeCheck, Truck, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { lockScroll, unlockScroll } from "../lib/scrollLockManager";

const ORDER_MODES = [
  { id: "delivery", label: "توصيل", icon: Truck, desc: "توصيل لباب البيت" },
  { id: "pickup", label: "استلام", icon: ShoppingBag, desc: "استلام من المحل" },
  { id: "in_house", label: "داخلي", icon: UtensilsCrossed, desc: "اطلب من داخل المحل" },
];

export default function CartDrawer({ isOpen, deliveryZones, themeColor, onClose, onCheckout }) {
  const {
    items,
    deliveryZone,
    removeItem,
    updateQuantity,
    updateExtraQuantity,
    setDeliveryZone,
    getItemTotal,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    orderType,
    setOrderType,
    showDeliveryPricing,
  } = useCartStore();

  const activeColor = themeColor || "#ee930c";

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  // Emergency cleanup on unmount
  useEffect(() => () => unlockScroll(), []);

  if (!isOpen) return null;

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6" dir="rtl" style={{ '--dynamic-color': activeColor }}>
        <div className="absolute inset-0 bg-[#050D1A]/80 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />
        <div className="relative w-full rounded-t-[40px] bg-[#0A0F1A] p-10 text-center shadow-[0_-20px_50px_rgba(62,39,35,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#131B2B] border border-white/10 shadow-[inset_0_4px_15px_rgba(62,39,35,0.02)]">
            <ShoppingCart size={48} className="text-[#D7CCC8]" strokeWidth={2} />
          </div>
          <p className="mb-2 text-[24px] font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            السلة فارغة تماماً
          </p>
          <p className="mb-10 text-[15px] font-bold text-gray-400">
            يسعدنا تصفحك للمنيو واختيار أشهى الأطباق أولاً!
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-[24px] bg-[#2A3B59] px-6 py-5 text-[16px] font-black text-white shadow-lg shadow-[#3E2723]/20 hover:bg-[#2C1810] transition-all active:scale-95"
          >
            العودة للمنيو
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6" dir="rtl" style={{ '--dynamic-color': activeColor }}>
      <div className="absolute inset-0 bg-[#050D1A]/80 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[40px] bg-[#0A0F1A] shadow-[0_-20px_50px_rgba(62,39,35,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0F1A]/90 px-7 py-5 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              سلة الطلبات
            </h2>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dynamic-color)] shadow-[0_5px_15px_-5px_var(--dynamic-color)]">
              <span className="text-[13px] font-black text-white">
                {items.reduce((c, i) => c + i.quantity, 0)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#131B2B] text-gray-400 border border-white/10 transition-transform active:scale-90 hover:bg-[#2A3B59]"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 bg-[#131B2B]">
          <div className="px-5 py-6 space-y-8">
            
            {/* Cart Items List Container */}
            <div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex flex-col gap-4 rounded-[28px] bg-[#1E293B] p-5 border border-white/5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                    
                    {/* Main Item Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-[16px] font-black text-white leading-tight">
                          {item.itemName}
                        </h4>
                        <div className="mt-2 flex items-center gap-2 text-[13px] font-bold">
                          <span className="text-[var(--dynamic-color)] bg-[var(--dynamic-color)]/10 px-2 py-0.5 rounded-md">{item.size.name}</span>
                          <span className="text-gray-400">{item.size.price} ج × {item.quantity}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[16px] font-black text-white">
                          {(item.size.price * item.quantity).toFixed(0)}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400">ج.م</span>
                      </div>
                    </div>

                    {/* Extras Sub-Rows */}
                    {item.extras && item.extras.length > 0 && (
                      <div className="space-y-2 border-t border-dashed border-white/5 pt-3">
                        <div className="text-[12px] font-black text-gray-400 mb-2">الإضافات:</div>
                        {item.extras.map(extra => (
                          <div key={extra.id} className="flex items-center justify-between bg-[#0F172A] p-2.5 rounded-[16px] border border-white/5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[13px] font-bold text-gray-300">{extra.name}</span>
                              <span className="text-[11px] font-bold text-gray-400">{extra.price} ج × {extra.quantity}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-[14px] font-black text-gray-300">
                                {(extra.price * extra.quantity).toFixed(0)} ج
                              </span>

                              <div className="flex items-center gap-2 rounded-full bg-[#1E293B] p-1 border border-white/5 shadow-sm">
                                <button
                                  onClick={() => updateExtraQuantity(item.cartItemId, extra.id, -1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-gray-500 hover:bg-[#131B2B] transition-colors"
                                >
                                  <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="w-3 text-center text-[12px] font-black text-white">
                                  {extra.quantity}
                                </span>
                                <button
                                  onClick={() => updateExtraQuantity(item.cartItemId, extra.id, 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white hover:brightness-110 transition-all"
                                >
                                  <Plus size={12} strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-[1px] w-full bg-[#131B2B] mt-1" />
                    
                    {/* Total Row & Actions */}
                    <div className="flex flex-col gap-4">
                      {item.extras && item.extras.length > 0 && (
                        <div className="flex items-center justify-between bg-[var(--dynamic-color)]/5 rounded-[16px] p-3 border border-[var(--dynamic-color)]/10">
                          <span className="text-[13px] font-bold text-gray-400">إجمالي الصنف شامل الإضافات:</span>
                          <span className="text-[16px] font-black text-[var(--dynamic-color)]">{getItemTotal(item).toFixed(0)} ج.م</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-red-500 transition-colors hover:bg-red-50 active:scale-95"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                          <span className="text-[13px] font-bold">إزالة</span>
                        </button>

                        <div className="flex items-center gap-4 rounded-full bg-[#0F172A] p-1 border border-white/5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E293B] text-gray-400 shadow-sm transition-all active:scale-90 hover:bg-[#131B2B]"
                          >
                            <Minus size={18} strokeWidth={2.5} />
                          </button>
                          <span className="w-5 text-center text-[16px] font-black text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white shadow-[0_5px_15px_-5px_var(--dynamic-color)] transition-all active:scale-90 hover:opacity-90"
                          >
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* ── Order Mode Selector ── */}
            <div>
              <label className="text-[13px] font-black text-gray-400 mb-3 block px-1">نوع الطلب</label>
              <div className="grid grid-cols-3 gap-3">
                {ORDER_MODES.map((mode) => {
                  const isActive = orderType === mode.id;
                  const ModeIcon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setOrderType(mode.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-[20px] p-4 text-center transition-all duration-300 border-2 ${
                        isActive
                          ? "border-[var(--dynamic-color)] bg-[var(--dynamic-color)]/5 shadow-md"
                          : "border-white/10 bg-[#1E293B] hover:border-white/20"
                      }`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] transition-all ${
                        isActive ? "bg-[var(--dynamic-color)] text-white shadow-lg" : "bg-[#131B2B] text-gray-500"
                      }`}
                        style={isActive ? { backgroundColor: activeColor, boxShadow: `0 8px 16px -4px ${activeColor}40` } : undefined}>
                        <ModeIcon size={20} />
                      </div>
                      <span className={`text-[13px] font-black ${isActive ? "text-white" : "text-gray-400"}`}>
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Zone Selection (Bento Style) */}
            {orderType === "delivery" && (
            <div className="rounded-[28px] bg-[#1E293B] p-5 border border-white/10 shadow-md animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-900/20 text-orange-500">
                  <MapPin size={18} />
                </div>
                <h3 className="text-[16px] font-black text-white">منطقة التوصيل</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {deliveryZones.map((zone) => {
                  const isSelected = deliveryZone?.id === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setDeliveryZone(zone)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-[20px] p-4 text-center transition-all duration-300 border-2 ${
                        isSelected
                          ? "bg-orange-900/20 border-orange-500/50 shadow-md"
                          : "bg-[#131B2B] border-transparent hover:bg-[#2A3B59]"
                      }`}
                    >
                      <span className={`text-[14px] font-black ${isSelected ? "text-orange-400" : "text-gray-400"}`}>
                        {zone.region_name}
                      </span>
                      <span className={`text-[13px] font-bold ${isSelected ? "text-orange-500" : "text-gray-500"}`}>
                        {!showDeliveryPricing ? "توصيل" : Number(zone.fee) === 0 ? "توصيل مجاني" : `+${zone.fee} ج`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Receipt Summary */}
            <div className="rounded-[28px] bg-[#1E293B] p-6 border border-white/10 shadow-md">
              <div className="space-y-3 text-[15px] font-bold text-gray-400">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="text-white">{getSubtotal().toFixed(2)} ج</span>
                </div>
                {showDeliveryPricing && (
                  <div className="flex justify-between">
                    <span>رسوم التوصيل {orderType === "delivery" && deliveryZone ? `(${deliveryZone.region_name})` : ""}</span>
                    <span className={orderType !== "delivery" || deliveryZone ? "text-white" : "text-gray-500"}>
                      {orderType !== "delivery" ? "مجاناً" : deliveryZone ? getDeliveryFee().toFixed(2) : "---"}
                    </span>
                  </div>
                )}
                <div className="my-2 h-[2px] w-full border-t-2 border-dashed border-white/10" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[18px] font-black text-white">الإجمالي النهائي</span>
                  <div className="text-right">
                    <span className="text-[24px] font-black text-[var(--dynamic-color)] drop-shadow-sm" style={{ fontFamily: "var(--font-display)" }}>
                      {getTotal().toFixed(2)}
                    </span>
                    <span className="mr-1 text-[14px] text-gray-400">ج.م</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-white/10 bg-[#0A0F1A] px-6 pb-8 pt-5">
          <button
            onClick={onCheckout}
            disabled={orderType === "delivery" && !deliveryZone}
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-[24px] py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              (orderType !== "delivery" || deliveryZone)
                ? "bg-[var(--dynamic-color)] text-white shadow-[0_15px_40px_-5px_var(--dynamic-color)]"
                : "bg-[#2A3B59] text-gray-500 cursor-not-allowed"
            }`}
          >
            {(orderType !== "delivery" || deliveryZone) && <div className="absolute inset-0 bg-[#1E293B]/20 opacity-0 hover:opacity-100 transition-opacity" />}
            <span className="relative z-10 flex items-center gap-2">
              <BadgeCheck size={22} />
              {orderType === "in_house" ? "إتمام الطلب" : "متابعة الطلب"}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
