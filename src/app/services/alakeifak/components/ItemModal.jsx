"use client";

import { useState, useEffect, useRef } from "react";
import { useCartStore } from "../lib/cartStore";
import { X, Plus, Minus, UtensilsCrossed, Check } from "lucide-react";
import { lockScroll, unlockScroll } from "../lib/scrollLockManager";
import { track } from "@vercel/analytics";

export default function ItemModal({ item, extras, themeColor, isOpen, preSelectedSizeId, onClose }) {
  const addItem = useCartStore((s) => s.addItem);

  const sizes = item?.item_sizes || [];
  const [selectedSize, setSelectedSize] = useState(null);
  const [extraQuantities, setExtraQuantities] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (item && sizes.length > 0) {
      if (preSelectedSizeId) {
        const match = sizes.find(s => s.id === preSelectedSizeId);
        if (match) setSelectedSize(match);
        else setSelectedSize(sizes[0]);
      } else {
        setSelectedSize(sizes[0]);
      }
      setQuantity(1);
      setExtraQuantities({});
    }
    if (isOpen) setIsClosing(false);
  }, [item, sizes, preSelectedSizeId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  // Cancel any pending close timeout on unmount
  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    unlockScroll(); // emergency reset in case cleanup was skipped
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
    }, 400);
  };

  const updateExtraQty = (extraId, delta) => {
    setExtraQuantities((prev) => {
      const current = prev[extraId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const newObj = { ...prev };
        delete newObj[extraId];
        return newObj;
      }
      return { ...prev, [extraId]: next };
    });
  };

  const itemTotal =
    (selectedSize?.price || 0) * quantity +
    (extras || []).reduce((sum, extra) => sum + (extraQuantities[extra.id] || 0) * Number(extra.price), 0);

  const handleAddToCart = () => {
    if (!selectedSize) return;

    // Collect extras that have quantity > 0
    const selectedExtrasArray = (extras || [])
      .filter((e) => extraQuantities[e.id] > 0)
      .map((e) => ({
        id: e.id,
        name: e.name,
        price: Number(e.price),
        quantity: extraQuantities[e.id],
      }));

    // Add main item with its attached extras
    addItem({
      itemId: item.id,
      itemName: item.name,
      imageUrl: item.image_url,
      size: { id: selectedSize.id, name: selectedSize.name, price: Number(selectedSize.price) },
      extras: selectedExtrasArray,
      quantity,
    });

    track("alakeifak_add_to_cart", { item_name: item.name, price: itemTotal, quantity });

    handleClose();
  };

  const activeColor = themeColor || "#ee930c";

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6 overscroll-none touch-none"
      dir="rtl"
      style={{ '--dynamic-color': activeColor }}
    >
      {/* Light Blur Backdrop */}
      <div
        className={`absolute inset-0 bg-[#050D1A]/80 backdrop-blur-md transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'opacity-100 ease-out'}`}
        onClick={handleClose}
      />

      {/* Modal / Bottom Sheet (Light Mode Bento) */}
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-[#0A0F1A] border border-white/10  transition-all duration-400
          rounded-t-[40px] sm:rounded-[40px] sm:max-w-lg touch-auto
          ${isClosing ? 'translate-y-full sm:translate-y-12 sm:opacity-0 sm:scale-95' : 'translate-y-0 sm:scale-100 ease-out animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95'}
        `}
      >
        {/* Close Button — fixed position within modal so it's always visible above hero images */}
        <div className="absolute left-4 top-4 z-50">
          <button
            onClick={handleClose}
            aria-label="إغلاق"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#131B2B] text-white border border-white/10 transition-transform active:scale-90 hover:bg-[#1E293B]"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide">
          {/* Edge-to-Edge Hero Image */}
          {item.image_url ? (
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#131B2B]">
              <img
                src={item.image_url}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[2/1] bg-[#131B2B] flex items-center justify-center">
              <UtensilsCrossed size={48} className="text-gray-600" strokeWidth={1.5} />
            </div>
          )}

          <div className="px-6 relative -mt-6 sm:-mt-10 z-10">
            {/* Title & Description */}
            <div className="mb-8 bg-[#0A0F1A] p-4 -mx-4 rounded-[24px]">
              <h2 className="mb-2 text-[28px] font-black tracking-tight text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {item.name}
              </h2>
              {item.description && (
                <p className="text-[15px] leading-relaxed text-gray-400 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                  {item.description}
                </p>
              )}
            </div>

            {/* Sizes Selection (Light Pills) */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[18px] font-black text-white">الحجم والسعر</h3>
                  <span className="rounded-full bg-[#131B2B] px-3 py-1 text-[12px] font-bold text-gray-400 border border-white/5">
                    إجباري
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[24px] p-4 text-center transition-all duration-300 border-2 ${
                          isSelected
                            ? "bg-[#131B2B] border-[var(--dynamic-color)] "
                            : "bg-[#131B2B] border-white/5 hover:border-white/10 hover:bg-[#1E293B]"
                        }`}
                      >
                        <span className={`text-[16px] font-black ${isSelected ? "text-white" : "text-gray-400"}`}>{size.name}</span>
                        <span className={`text-[14px] font-bold ${isSelected ? "text-[var(--dynamic-color)]" : "text-gray-500"}`}>
                          {size.price} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper (Massive Light Mode) */}
            <div className="mb-6 flex items-center justify-between rounded-[32px] bg-[#131B2B] p-3 border border-white/5">
              <span className="text-[17px] font-black text-white pr-3">الكمية المطلوبة</span>
              <div className="flex items-center gap-5 rounded-full bg-[#1E293B] p-1.5 border border-white/5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#131B2B] text-white transition-all active:scale-90 hover:bg-[#2A3B59]"
                >
                  <Minus size={20} strokeWidth={2.5} />
                </button>
                <span className="w-6 text-center text-[20px] font-black text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white transition-all active:scale-90 hover:brightness-110"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            {/* Extras Selection (Bright Rows with Images) */}
            {!item._isVirtualExtra && (
              <div className="mb-8">
                {(() => {
                  const validExtras = extras?.filter(e => e.suggested_subcategories?.includes(item.subcategory_id)) || [];
                  if (validExtras.length === 0) return null;
                  
                  return (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[18px] font-black text-white">إضافات مقترحة</h3>
                        <span className="rounded-full bg-[#131B2B] px-3 py-1 text-[12px] font-bold text-gray-400 border border-white/5">
                          اختياري
                        </span>
                      </div>
                      <div className="space-y-3">
                        {validExtras.map((extra) => {
                    const qty = extraQuantities[extra.id] || 0;
                    const isSelected = qty > 0;
                    return (
                      <div
                        key={extra.id}
                        className={`group flex w-full items-center justify-between rounded-[24px] p-3 transition-all duration-300 border-2 ${
                          isSelected 
                            ? "bg-[#131B2B] border-[var(--dynamic-color)] " 
                            : "bg-[#131B2B] border-white/5 hover:border-white/10 hover:bg-[#1E293B]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Image Support for Extras */}
                          {extra.image_url && (
                            <div className="relative h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[14px] bg-[#1E293B] border border-white/5">
                              <img 
                                src={extra.image_url} 
                                alt={extra.name} 
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <span className={`text-[15px] font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>
                            {extra.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-[15px] font-black ${isSelected ? "text-[var(--dynamic-color)]" : "text-gray-500"}`}>
                            +{extra.price} ج
                          </span>
                          
                          {/* Extra Quantity Stepper */}
                          <div className={`flex items-center gap-2 rounded-full p-1 transition-all ${isSelected ? "bg-[var(--dynamic-color)]/10" : "bg-[#1E293B] border border-white/5"}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateExtraQty(extra.id, -1); }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#131B2B] text-white transition-all active:scale-90 hover:bg-[#2A3B59]"
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className={`w-4 text-center text-[14px] font-black ${isSelected ? "text-[var(--dynamic-color)]" : "text-white"}`}>{qty}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateExtraQty(extra.id, 1); }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white transition-all active:scale-90 hover:brightness-110"
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                        );
                      })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#0A0F1A] via-[#0A0F1A]/95 to-transparent pb-6 pt-10 px-6 sm:pb-8">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`relative flex w-full items-center justify-between overflow-hidden rounded-[24px] px-6 py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              selectedSize 
                ? "bg-[var(--dynamic-color)] text-white " 
                : "bg-[#131B2B] text-gray-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {selectedSize && (
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            )}
            <span className="relative z-10">إضافة للسلة</span>
            <span className="relative z-10 flex items-center gap-1.5">
              {itemTotal.toFixed(2)} <span className="text-[14px]">ج.م</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
