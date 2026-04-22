"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../lib/cartStore";
import Image from "next/image";
import { X, Plus, Minus, UtensilsCrossed, Check } from "lucide-react";

export default function ItemModal({ item, extras, themeColor, isOpen, preSelectedSizeId, onClose }) {
  const addItem = useCartStore((s) => s.addItem);

  const sizes = item?.item_sizes || [];
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (item && sizes.length > 0) {
      if (preSelectedSizeId) {
        const match = sizes.find(s => s.id === preSelectedSizeId);
        if (match) setSelectedSize(match);
        else setSelectedSize(sizes[0]);
      } else {
        setSelectedSize(sizes[0]);
      }
    }
    // reset animation state if reopened
    if (isOpen) setIsClosing(false);
  }, [item, sizes, preSelectedSizeId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // match duration
  };

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const itemTotal =
    ((selectedSize?.price || 0) +
      selectedExtras.reduce((s, e) => s + Number(e.price), 0)) *
    quantity;

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem({
      itemId: item.id,
      itemName: item.name,
      imageUrl: item.image_url,
      size: { id: selectedSize.id, name: selectedSize.name, price: Number(selectedSize.price) },
      extras: selectedExtras.map((e) => ({ id: e.id, name: e.name, price: Number(e.price) })),
      quantity,
    });

    handleClose();
  };

  const activeColor = themeColor || "#ee930c";

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6"
      dir="rtl"
      style={{ '--dynamic-color': activeColor }}
    >
      {/* Light Blur Backdrop */}
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'opacity-100 ease-out'}`}
        onClick={handleClose}
      />

      {/* Modal / Bottom Sheet (Light Mode Bento) */}
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] transition-all duration-400
          rounded-t-[40px] sm:rounded-[40px] sm:max-w-lg
          ${isClosing ? 'translate-y-full sm:translate-y-12 sm:opacity-0 sm:scale-95' : 'translate-y-0 sm:scale-100 ease-out animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:zoom-in-95'}
        `}
      >
        {/* Floating Close Button */}
        <div className="absolute left-4 top-4 z-20">
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-gray-900 backdrop-blur-md shadow-sm border border-gray-100 transition-transform active:scale-90 hover:bg-white"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide">
          {/* Edge-to-Edge Hero Image */}
          {item.image_url ? (
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-100">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 512px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            </div>
          ) : (
            <div className="relative w-full aspect-[2/1] bg-gray-50 flex items-center justify-center">
              <UtensilsCrossed size={48} className="text-gray-300" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
            </div>
          )}

          <div className="px-6 relative -mt-6 sm:-mt-10 z-10">
            {/* Title & Description */}
            <div className="mb-8 bg-white/80 backdrop-blur-xl p-4 -mx-4 rounded-[24px]">
              <h2 className="mb-2 text-[28px] font-black tracking-tight text-gray-900 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {item.name}
              </h2>
              {item.description && (
                <p className="text-[15px] leading-relaxed text-gray-500 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                  {item.description}
                </p>
              )}
            </div>

            {/* Sizes Selection (Light Pills) */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[18px] font-black text-gray-900">الحجم والسعر</h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[12px] font-bold text-gray-500">
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
                            ? "bg-white border-[var(--dynamic-color)] shadow-[0_10px_20px_-10px_var(--dynamic-color)]"
                            : "bg-gray-50 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <span className={`text-[16px] font-black ${isSelected ? "text-gray-900" : "text-gray-600"}`}>{size.name}</span>
                        <span className={`text-[14px] font-bold ${isSelected ? "text-[var(--dynamic-color)]" : "text-gray-400"}`}>
                          {size.price} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extras Selection (Bright Rows with Images) */}
            {!item._isVirtualExtra && (
              <div className="mb-8">
                {(() => {
                  const validExtras = extras?.filter(e => e.suggested_subcategories?.includes(item.subcategory_id)) || [];
                  if (validExtras.length === 0) return null;
                  
                  return (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[18px] font-black text-gray-900">إضافات مقترحة</h3>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[12px] font-bold text-gray-500">
                          اختياري
                        </span>
                      </div>
                      <div className="space-y-3">
                        {validExtras.map((extra) => {
                    const isSelected = selectedExtras.find((e) => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`group flex w-full items-center justify-between rounded-[24px] p-3 transition-all duration-300 border-2 ${
                          isSelected 
                            ? "bg-white border-[var(--dynamic-color)] shadow-[0_10px_20px_-10px_var(--dynamic-color)]" 
                            : "bg-gray-50 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                              isSelected ? "bg-[var(--dynamic-color)]" : "bg-white border-2 border-gray-200"
                            }`}
                          >
                            {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>
                          
                          {/* Image Support for Extras */}
                          {extra.image_url && (
                            <div className="relative h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[14px] bg-white shadow-sm border border-gray-100">
                              <Image 
                                src={extra.image_url} 
                                alt={extra.name} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                          )}

                          <span className={`text-[15px] font-bold ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                            {extra.name}
                          </span>
                        </div>
                        <span className={`text-[15px] font-black pl-2 ${isSelected ? "text-[var(--dynamic-color)]" : "text-gray-400"}`}>
                          +{extra.price} ج
                        </span>
                      </button>
                        );
                      })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Quantity Stepper (Massive Light Mode) */}
            <div className="mb-6 flex items-center justify-between rounded-[32px] bg-gray-50 p-3 border border-gray-100 shadow-sm">
              <span className="text-[17px] font-black text-gray-900 pr-3">الكمية المطلوبة</span>
              <div className="flex items-center gap-5 rounded-full bg-white p-1.5 shadow-sm border border-gray-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-all active:scale-90 hover:bg-gray-100"
                >
                  <Minus size={20} strokeWidth={2.5} />
                </button>
                <span className="w-6 text-center text-[20px] font-black text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white shadow-md shadow-[var(--dynamic-color)]/30 transition-all active:scale-90 hover:brightness-110"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white/95 to-transparent pb-6 pt-10 px-6 sm:pb-8">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`relative flex w-full items-center justify-between overflow-hidden rounded-[24px] px-6 py-5 text-[18px] font-black transition-all duration-300 active:scale-[0.98] ${
              selectedSize 
                ? "bg-[var(--dynamic-color)] text-white shadow-[0_15px_40px_-5px_var(--dynamic-color)]" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
