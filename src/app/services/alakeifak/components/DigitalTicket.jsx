"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Clock, ChefHat, PackageCheck, CheckCircle2, XCircle, X, Hash, UtensilsCrossed } from "lucide-react";

const STATUS_STEPS = [
  { id: "pending", label: "تم استلام الطلب", icon: Clock, color: "#f59e0b" },
  { id: "preparing", label: "جاري التجهيز", icon: ChefHat, color: "#3b82f6" },
  { id: "ready", label: "طلبك جاهز!", icon: PackageCheck, color: "#10b981" },
  { id: "completed", label: "تم التسليم", icon: CheckCircle2, color: "#22c55e" },
];

/**
 * DigitalTicket — Full-screen order status tracker for in-house customers.
 * Subscribes to Supabase Realtime to mirror status changes from the Partner OMS.
 * Stored in localStorage as `khatwah_active_ticket`.
 */
export default function DigitalTicket({ ticket, onDismiss }) {
  const [status, setStatus] = useState("pending");
  const [elapsedMin, setElapsedMin] = useState(0);

  // Subscribe to realtime status updates
  useEffect(() => {
    if (!ticket?.orderId) return;

    // Initial fetch
    supabase.from("orders").select("status").eq("id", ticket.orderId).single()
      .then(({ data }) => { if (data) setStatus(data.status); });

    const channel = supabase
      .channel(`ticket-${ticket.orderId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders",
        filter: `id=eq.${ticket.orderId}`,
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ticket?.orderId]);

  // Elapsed time counter
  useEffect(() => {
    if (!ticket?.createdAt) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 60000);
      setElapsedMin(diff);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [ticket?.createdAt]);

  // Auto-dismiss after completion
  useEffect(() => {
    if (status === "completed" || status === "delivered") {
      const timer = setTimeout(() => {
        localStorage.removeItem("khatwah_active_ticket");
        onDismiss();
      }, 30000);
      return () => clearTimeout(timer);
    }
    if (status === "cancelled") {
      const timer = setTimeout(() => {
        localStorage.removeItem("khatwah_active_ticket");
        onDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  const handleDismiss = () => {
    localStorage.removeItem("khatwah_active_ticket");
    onDismiss();
  };

  const themeColor = ticket.themeColor || "#ee930c";
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.id === status);
  const isCancelled = status === "cancelled";
  const isComplete = status === "completed" || status === "delivered";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-xl" dir="rtl">
      <div className="relative w-full max-w-sm">

        {/* Dismiss button */}
        <button onClick={handleDismiss}
          className="absolute -top-2 -left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10">
          <X size={18} />
        </button>

        {/* Ticket Card */}
        <div className="rounded-[32px] bg-white overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-6 pb-4 text-center" style={{ background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}05)` }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 shadow-sm mb-4">
              <UtensilsCrossed size={14} style={{ color: themeColor }} />
              <span className="text-[13px] font-black text-gray-900">{ticket.restaurantName}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {isCancelled ? "تم إلغاء الطلب" : isComplete ? "تم التسليم بنجاح! 🎉" : "طلبك قيد التجهيز"}
            </h2>
            <p className="text-sm font-bold text-gray-500">
              {isCancelled ? "يُرجى التواصل مع المطعم للمزيد." : isComplete ? "شكراً لك، بالهنا والشفا!" : "تابع حالة طلبك مباشرة من هنا"}
            </p>
          </div>

          {/* Order Info Strip */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-gray-400" />
              <span className="text-sm font-black text-gray-900">{ticket.trackingId}</span>
            </div>
            {ticket.tableNumber && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 border border-blue-100">
                <span className="text-[12px] font-black text-blue-600">طاولة {ticket.tableNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-500">{elapsedMin} دقيقة</span>
            </div>
          </div>

          {/* Status Progress */}
          {!isCancelled ? (
            <div className="p-6 space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === currentStepIdx;
                const isDone = idx < currentStepIdx || isComplete;
                const isFuture = idx > currentStepIdx && !isComplete;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                        isActive ? "border-[var(--dc)] text-[var(--dc)] bg-[var(--dc)]/10 animate-pulse" :
                        "border-gray-200 text-gray-300 bg-gray-50"
                      }`} style={{ '--dc': step.color }}>
                        <StepIcon size={18} />
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 transition-all duration-500 ${isDone ? "bg-emerald-500" : "bg-gray-200"}`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-2">
                      <span className={`text-[15px] font-black transition-colors ${
                        isDone ? "text-emerald-600" : isActive ? "text-gray-900" : "text-gray-300"
                      }`}>
                        {step.label}
                        {isActive && !isComplete && " ⏳"}
                        {isDone && " ✓"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <XCircle size={32} className="text-red-400" />
              </div>
              <p className="text-[14px] font-bold text-gray-500">تم إلغاء هذا الطلب. سيتم إغلاق هذه الشاشة تلقائياً.</p>
            </div>
          )}

          {/* Total */}
          <div className="px-6 pb-6">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex justify-between items-center">
              <span className="text-[14px] font-black text-gray-500">الإجمالي</span>
              <span className="text-[20px] font-black" style={{ color: themeColor }}>{Number(ticket.total).toFixed(0)} ج.م</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button onClick={handleDismiss}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-[14px] font-black text-gray-500 hover:bg-gray-50 transition-all">
              {isComplete || isCancelled ? "إغلاق" : "إخفاء (الطلب لن يُلغى)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
