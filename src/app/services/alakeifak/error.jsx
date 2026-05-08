"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";
import { track } from "@vercel/analytics";

export default function AlakeifakError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Alakeifak App Error Boundary Caught:", error);
    
    // Log using Vercel Analytics for observability
    track("alakeifak_runtime_error", { 
      message: error.message,
      stack: error.stack?.substring(0, 200) // truncate for limits
    });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50 text-center" dir="rtl">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm border border-red-100">
        <AlertTriangle size={48} strokeWidth={1.5} />
      </div>
      
      <h2 className="mb-3 text-[28px] font-black tracking-tight text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
        عذراً، حدث خطأ غير متوقع
      </h2>
      
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-gray-500 font-medium">
        واجهنا مشكلة تقنية أثناء محاولة تحميل هذه الصفحة. فريقنا على علم بالمشكلة.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 text-[15px] font-black text-white transition-all hover:bg-gray-800 active:scale-95 shadow-lg"
        >
          <RefreshCw size={18} />
          <span>المحاولة مرة أخرى</span>
        </button>
        
        <Link
          href="/services/alakeifak"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[15px] font-black text-gray-700 transition-all hover:bg-gray-50 active:scale-95 border border-gray-200 shadow-sm"
        >
          العودة للرئيسية
        </Link>
      </div>
      
      <div className="mt-12 text-sm text-gray-400 font-bold flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
        <MessageCircle size={14} />
        يرجى التواصل مع الدعم إذا استمرت المشكلة
      </div>
    </div>
  );
}
