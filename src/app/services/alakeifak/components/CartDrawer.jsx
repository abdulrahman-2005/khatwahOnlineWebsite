"use client";

import { useEffect } from "react";
import { useCartStore } from "../lib/cartStore";
import { X, Plus, Minus, Trash2, ShoppingCart, MapPin, BadgeCheck, Truck, ShoppingBag, UtensilsCrossed } from "lucide-react";

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
    setDeliveryZone,
    getItemTotal,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    orderType,
    setOrderType,
  } = useCartStore();

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
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6" dir="rtl" style={{ '--dynamic-color': activeColor }}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />
        <div className="relative w-full rounded-t-[40px] bg-white p-10 text-center shadow-[0_-20px_50px_rgba(0,0,0,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gray-50 border border-gray-100 shadow-[inset_0_4px_15px_rgba(0,0,0,0.02)]">
            <ShoppingCart size={48} className="text-gray-300" strokeWidth={2} />
          </div>
          <p className="mb-2 text-[24px] font-black tracking-tight text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            السلة فارغة تماماً
          </p>
          <p className="mb-10 text-[15px] font-medium text-gray-400">
            يسعدنا تصفحك للمنيو واختيار أشهى الأطباق أولاً!
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-[24px] bg-gray-900 px-6 py-5 text-[16px] font-black text-white shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95"
          >
            العودة للمنيو
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6" dir="rtl" style={{ '--dynamic-color': activeColor }}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-400" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[40px] bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] sm:max-w-md sm:rounded-[40px] animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white/90 px-7 py-5 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-black tracking-tight text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-500 border border-gray-200 transition-transform active:scale-90 hover:bg-gray-100"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 bg-gray-50/50">
          <div className="px-5 py-6 space-y-8">
            
            {/* Cart Items List Container */}
            <div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex flex-col gap-4 rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Image optional thumbnail logic could go here, currently omitted to follow existing structure */}
                      
                      <div className="flex-1">
                        <h4 className="text-[16px] font-black text-gray-900 leading-tight">
                          {item.itemName}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-bold text-gray-500">
                          <span className="text-[var(--dynamic-color)]">{item.size.name}</span>
                          {item.extras.length > 0 && <span className="text-gray-300 px-1">•</span>}
                          {item.extras.length > 0 && `${item.extras.map((e) => e.name).join("، ")}`}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[16px] font-black text-gray-900">
                          {getItemTotal(item).toFixed(2)}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400">ج.م</span>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-100" />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-red-500 transition-colors hover:bg-red-50 active:scale-95"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                        <span className="text-[13px] font-bold">إزالة</span>
                      </button>

                      <div className="flex items-center gap-4 rounded-full bg-gray-50 p-1 border border-gray-100 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-all active:scale-90 hover:bg-gray-100"
                        >
                          <Minus size={18} strokeWidth={2.5} />
                        </button>
                        <span className="w-5 text-center text-[16px] font-black text-gray-900">
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
                ))}
              </div>
            </div>

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
                      onClick={() => setOrderType(mode.id)}
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
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Zone Selection (Bento Style) */}
            {orderType === "delivery" && (
            <div className="rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <MapPin size={18} />
                </div>
                <h3 className="text-[16px] font-black text-gray-900">منطقة التوصيل</h3>
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
                          ? "bg-blue-50 border-blue-500 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.3)]"
                          : "bg-gray-50 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <span className={`text-[14px] font-black ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                        {zone.region_name}
                      </span>
                      <span className={`text-[13px] font-bold ${isSelected ? "text-blue-500" : "text-gray-400"}`}>
                        {Number(zone.fee) === 0 ? "توصيل مجاني" : `+${zone.fee} ج`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Receipt Summary */}
            <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="space-y-3 text-[15px] font-bold text-gray-500">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="text-gray-900">{getSubtotal().toFixed(2)} ج</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل {orderType === "delivery" && deliveryZone ? `(${deliveryZone.region_name})` : ""}</span>
                  <span className={orderType !== "delivery" || deliveryZone ? "text-gray-900" : "text-gray-400"}>
                    {orderType !== "delivery" ? "مجاناً" : deliveryZone ? getDeliveryFee().toFixed(2) : "---"}
                  </span>
                </div>
                <div className="my-2 h-[2px] w-full border-t-2 border-dashed border-gray-100" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[18px] font-black text-gray-900">الإجمالي النهائي</span>
                  <div className="text-right">
                    <span className="text-[24px] font-black text-[var(--dynamic-color)] drop-shadow-sm" style={{ fontFamily: "var(--font-display)" }}>
                      {getTotal().toFixed(2)}
                    </span>
                    <span className="mr-1 text-[14px] text-gray-500">ج.م</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-100 bg-white px-6 pb-8 pt-5">
          <button
            onClick={onCheckout}
            disabled={orderType === "delivery" && !deliveryZone}
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-[24px] py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              (orderType !== "delivery" || deliveryZone)
                ? "bg-[var(--dynamic-color)] text-white shadow-[0_15px_40px_-5px_var(--dynamic-color)]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {(orderType !== "delivery" || deliveryZone) && <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />}
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
