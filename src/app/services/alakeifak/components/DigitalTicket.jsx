"use client";

import { useEffect } from "react";
import { UtensilsCrossed, X } from "lucide-react";

/**
 * DigitalTicket — Full-screen ticket for in-house customers.
 * Displays only the ordered items and details.
 * Stored in localStorage as `khatwah_active_ticket`.
 */
export default function DigitalTicket({ ticket, onHide, onDismiss }) {
  // Prevent background scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      const currentScrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(currentScrollY || '0') * -1);
    };
  }, []);

  const handleHide = () => {
    onHide();
  };

  const themeColor = ticket.themeColor || "#ee930c";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-xl" dir="rtl">
      <div className="relative w-full max-w-sm">

        {/* Dismiss button */}
        <button onClick={handleHide}
          className="absolute -top-2 -left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10">
          <X size={18} />
        </button>

        {/* Ticket Card */}
        <div className="rounded-[32px] bg-white overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          
          {/* Header */}
          <div className="p-6 pb-4 text-center" style={{ background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}05)` }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 shadow-sm mb-4">
              <UtensilsCrossed size={14} style={{ color: themeColor }} />
              <span className="text-[13px] font-black text-gray-900">{ticket.restaurantName}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              تم إرسال طلبك للمطبخ!
            </h2>
            <p className="text-sm font-bold text-gray-500">
              بالهنا والشفا
            </p>
          </div>

          <div className="overflow-y-auto scrollbar-hide flex-1">

          {/* Items Summary */}
          {ticket.items && ticket.items.length > 0 && (
            <div className="px-6 py-4">
              <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-4 space-y-3">
                <h4 className="text-[14px] font-black text-gray-400">ملخص الطلب</h4>
                <div className="space-y-3">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2 text-[14px]">
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 leading-tight">
                          <span className="text-[var(--dc)] ml-1" style={{ '--dc': themeColor }}>×{item.quantity}</span> 
                          {item.itemName}
                        </span>
                        {item.extras && item.extras.length > 0 && (
                          <div className="text-[12px] font-bold text-gray-500 mt-0.5 leading-tight">
                            + {item.extras.map(e => e.name).join("، ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

            {/* Total */}
            <div className="px-6 pb-6 pt-2">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex justify-between items-center">
                <span className="text-[14px] font-black text-gray-500">الإجمالي</span>
                <span className="text-[20px] font-black" style={{ color: themeColor }}>{Number(ticket.total).toFixed(0)} ج.م</span>
              </div>
            </div>
          </div>

          {/* Footer (Sticky) */}
          <div className="px-6 pb-6 pt-4 bg-white border-t border-gray-100">
            <button onClick={handleHide}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-[14px] font-black text-gray-500 hover:bg-gray-50 transition-all">
              إغلاق الشاشة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
