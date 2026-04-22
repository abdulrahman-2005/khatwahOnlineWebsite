"use client";

import { useRef, useEffect } from "react";

export default function CategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
  themeColor,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const activeEl = scrollRef.current?.querySelector(`[data-cat-active="true"]`);
    if (activeEl) {
      const container = scrollRef.current;
      const scrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-3 py-2 touch-pan-x"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        dir="rtl"
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const activeColor = themeColor || "#ee930c";
          return (
            <button
              key={cat.id}
              data-cat-active={isActive}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[14px] font-black transition-all duration-300 border select-none ${
                isActive
                  ? "text-white shadow-[0_8px_20px_-5px_var(--dynamic-color)]"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm"
              }`}
              style={{
                backgroundColor: isActive ? activeColor : undefined,
                borderColor: isActive ? activeColor : undefined,
                '--dynamic-color': activeColor,
              }}
            >
              {cat.icon && <span className="text-[16px] leading-none">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
