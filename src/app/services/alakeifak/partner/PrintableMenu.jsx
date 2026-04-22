import React from 'react';
import { QrCode } from 'lucide-react';

export default function PrintableMenu({ restaurant, categories, subcategories, items, themeColor }) {
  if (!restaurant || !categories || categories.length === 0) return null;

  const qrUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://khatwah.com") + `/services/alakeifak/${restaurant.slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrUrl}`;
  
  // Safe parsing of theme color for text backgrounds (soft tint)
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex && hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };
  const rgbTheme = hexToRgb(themeColor || "#2563eb");

  return (
    <div className="hidden print:block bg-white text-gray-900 w-full font-sans" dir="rtl">
      
      {/* ─── STYLE DEFINITIONS SPECIFIC TO PRINT ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          margin: 0;
          size: A4 portrait;
        }
        @media print {
          /* The print layout will strictly be shown via NextJS parent overrides */
          .print-container {
            display: block !important;
            width: 100%;
            background: white !important;
          }

          .no-break { page-break-inside: avoid; break-inside: avoid; }
          .page-break-after { page-break-after: always; break-after: page; }
          
          .dotted-leader {
            border-bottom: 2px dotted #e5e7eb;
            flex-grow: 1;
            margin: 0 12px;
            position: relative;
            top: -6px;
          }
        }
      `}} />

      {/* ─── PRINTABLE CONTENT ─── */}
      {/* We wrap it in a div that we will manually pull up via fixed or absolute just in case, but native flow is best */}
      <div className="print-container min-h-screen pb-16">
        
        {/* Cover / Header Section */}
        <div className="relative mb-12">
          {/* Banner */}
          <div className="w-full h-[240px] bg-gray-100 overflow-hidden relative">
            {restaurant.banner_url ? (
              <img src={restaurant.banner_url} className="w-full h-full object-cover" alt="Banner" />
            ) : (
              <div className="w-full h-full bg-slate-900" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #1e293b 100%)` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70"></div>
          </div>
          
          {/* Overlay Info */}
          <div className="absolute inset-0 flex items-center justify-between px-12 pt-8">
            <div className="flex items-center gap-6 text-white pt-10">
              <div className="w-32 h-32 rounded-[32px] border-4 border-white overflow-hidden bg-white shadow-2xl">
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col drop-shadow-md">
                <h1 className="text-[52px] font-black leading-tight tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
                  {restaurant.name}
                </h1>
                <p className="text-[20px] font-bold text-gray-200 mt-1 opacity-90 drop-shadow-md">
                  قائمة الطعام والمشروبات (المنيو)
                </p>
              </div>
            </div>
            
            {/* QR Code Embedded on Paper */}
            <div className="bg-white p-3 rounded-[24px] shadow-2xl flex flex-col items-center gap-2 transform rotate-2 translate-y-4">
              <img src={qrSrc} alt="QR" className="w-[120px] h-[120px]" />
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                <QrCode size={12} style={{ color: themeColor }} />
                <span>اطلب أونلاين الآن</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Body - Masonry / Grid */}
        <div className="px-12 mx-auto columns-1 lg:columns-2 gap-12 max-w-7xl">
          {categories.map((cat, catIdx) => {
            const catSubs = subcategories.filter(s => s.category_id === cat.id);
            if (catSubs.length === 0) return null; // Hide empty categories from print

            return (
              <div key={cat.id} className="no-break mb-12 transform-gpu">
                
                {/* Category Header (Premium Typography with Accent Line) */}
                <div className="flex items-baseline mb-6 border-b-4 pb-2" style={{ borderColor: themeColor }}>
                  <span className="text-[32px] ml-3">{cat.icon || "🍽️"}</span>
                  <h2 className="text-[32px] font-black text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {cat.name}
                  </h2>
                </div>

                {/* Subcategories (Tiered) */}
                <div className="space-y-8 pl-4">
                  {catSubs.map((sub) => {
                    const subItems = items.filter(i => i.subcategory_id === sub.id && i.is_available);
                    if (subItems.length === 0) return null;

                    return (
                      <div key={sub.id} className="no-break">
                        {/* Subcat title */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="h-[2px] flex-1 bg-gray-100" />
                          <h3 className="text-[20px] font-black text-gray-800" style={{ color: themeColor }}>
                            {sub.name}
                          </h3>
                          <div className="h-[2px] w-8 bg-gray-100" />
                        </div>

                        {/* Items listed structured */}
                        <div className="space-y-5">
                          {subItems.map((item) => (
                            <div key={item.id} className="no-break flex flex-col pl-2">
                              <div className="flex items-end justify-between font-bold w-full">
                                <div className="flex gap-4 items-center">
                                  {/* Strategic Images for visual break - Only IF they have a picture */}
                                  {item.image_url && (
                                    <div className="w-16 h-16 shrink-0 rounded-[14px] bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                                      <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <h4 className="text-[17px] font-black text-gray-900 leading-tight">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="text-[13px] font-medium text-gray-500 mt-0.5 line-clamp-2 leading-relaxed max-w-[280px]">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Only show dotted leader if no picture (cleaner) or just force it for the first price */}
                                <div className="dotted-leader hidden sm:block" />
                                
                                <div className="flex flex-col items-end gap-1 font-black shrink-0">
                                  {item.item_sizes && item.item_sizes.length > 0 ? (
                                    item.item_sizes.map((s, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-gray-900 bg-gray-50/50 px-2 rounded-md">
                                        <span className="text-[12px] text-gray-500">{s.name}</span>
                                        <span className="text-[16px]">{s.price} ج</span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[16px] text-gray-900">حسب الاختيار</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Paper Footer */}
        <div className="mt-16 text-center text-gray-400 font-bold text-[12px] flex items-center justify-center gap-2 border-t border-gray-100 pt-6 mx-12">
          <span>الأسعار بالجنيه المصري (ج.م)</span>
          <span>•</span>
          <span>مسح الرمز (QR Code) الموجود بالأعلى للإطلاع على صور الأصناف</span>
          <span>•</span>
          <span>Powered by alakeifak Platform</span>
        </div>
        
      </div>
    </div>
  );
}
