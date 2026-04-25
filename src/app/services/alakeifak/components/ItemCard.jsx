"use client";

import Image from "next/image";
import { UtensilsCrossed, Plus } from "lucide-react";

/**
 * ItemCard — Bento-style card with two variants:
 *   variant="full"   → full-width hero card (first item in subcategory)
 *   variant="compact" → half-width grid card (all other items)
 * 
 * Size pills are overlaid at the bottom of the image area.
 * Tapping a pill opens the modal with that size pre-selected.
 * Tapping the + button opens the modal with no pre-selection.
 */
export default function ItemCard({ item, themeColor, disabled, onClick, variant = "compact" }) {
  const isUnavailable = !item.is_available;
  const activeColor = themeColor || "#ee930c";
  const sortedSizes = [...(item.item_sizes || [])].sort((a, b) => Number(a.price) - Number(b.price));
  const isFull = variant === "full";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden bg-white text-right transition-all duration-500
        ${isFull ? "rounded-[28px]" : "rounded-[22px]"}
        ${(disabled || isUnavailable)
          ? "cursor-not-allowed opacity-50 grayscale-[40%]"
          : "hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] cursor-pointer active:scale-[0.98]"
        }
      `}
      style={{ '--dynamic-color': activeColor }}
      onClick={() => !disabled && !isUnavailable && onClick(item, null)}
    >
      {/* Image Area */}
      <div className={`relative w-full shrink-0 overflow-hidden bg-gray-100 ${isFull ? "aspect-[16/9]" : "aspect-square"}`}>
        {item.image_url ? (
          <>
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes={isFull ? "(max-width: 768px) 100vw, 800px" : "(max-width: 640px) 50vw, 300px"}
            />
            {/* Dark gradient for overlaid pills readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <UtensilsCrossed size={isFull ? 48 : 32} className="text-gray-200" strokeWidth={1.2} />
          </div>
        )}

        {/* Unavailable Badge */}
        {isUnavailable && (
          <div className="absolute top-3 left-3 rounded-full bg-red-500/90 backdrop-blur-md px-3 py-1 shadow-lg z-10">
            <span className="text-[11px] font-black text-white">نفذت</span>
          </div>
        )}

        {/* Size Pills + Add Button — overlaid at image bottom */}
        {sortedSizes.length > 0 && !disabled && !isUnavailable && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sortedSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(item, size.id);
                  }}
                  className={`
                    rounded-full backdrop-blur-md border border-white/30
                    transition-all duration-200 active:scale-90
                    ${isFull
                      ? "px-3.5 py-1.5 text-[13px]"
                      : "px-2.5 py-1 text-[11px]"
                    }
                    bg-white/20 text-white font-black
                    hover:bg-white hover:text-gray-900
                  `}
                >
                  {isFull ? `${size.name} · ${Number(size.price).toFixed(0)}` : `${Number(size.price).toFixed(0)}`}
                </button>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(item, sortedSizes[0]?.id || null);
              }}
              className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--dynamic-color)] text-white shadow-lg shadow-[var(--dynamic-color)]/40 transition-all active:scale-90 hover:brightness-110 ${
                isFull ? "h-11 w-11" : "h-9 w-9"
              }`}
            >
              <Plus size={isFull ? 22 : 18} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isFull ? "p-4 sm:p-5" : "p-3"}`}>
        <h3
          className={`font-black leading-tight tracking-tight text-gray-900 ${
            isFull ? "text-[20px] sm:text-[22px] mb-1.5" : "text-[15px] mb-1 line-clamp-2"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {item.name}
        </h3>

        {isFull && item.description && (
          <p className="line-clamp-2 text-[13px] sm:text-[14px] font-medium leading-relaxed text-gray-500 mb-2">
            {item.description}
          </p>
        )}

        {/* Price Tag — compact only shows lowest price */}
        <div className="flex items-center justify-between mt-auto">
          {sortedSizes.length > 0 && (
            <span className="text-[14px] font-black text-[var(--dynamic-color)]" dir="ltr">
              {sortedSizes.length > 1 && <span className="text-gray-400 text-[11px] font-bold ml-1">من</span>}
              {Number(sortedSizes[0].price).toFixed(0)} <span className="text-[11px] font-bold text-gray-400">ج.م</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
