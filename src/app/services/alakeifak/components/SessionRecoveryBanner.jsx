"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { WifiOff, RefreshCw, LogIn, X } from "lucide-react";

/**
 * SessionRecoveryBanner — Non-blocking banner that appears when the Supabase
 * session expires and cannot auto-recover. Listens for the custom
 * 'supabase:session-expired' event dispatched by safeQuery.js.
 */
export default function SessionRecoveryBanner() {
  const [visible, setVisible] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleExpired() {
      setDismissed(false);
      setVisible(true);
    }

    function handleRecovered() {
      setVisible(false);
      setRecovering(false);
    }

    window.addEventListener("supabase:session-expired", handleExpired);
    window.addEventListener("supabase:session-recovered", handleRecovered);

    return () => {
      window.removeEventListener("supabase:session-expired", handleExpired);
      window.removeEventListener("supabase:session-recovered", handleRecovered);
    };
  }, []);

  async function handleRetry() {
    setRecovering(true);
    try {
      // Race the refresh against a 5-second timeout to prevent deadlock
      const { error } = await Promise.race([
        supabase.auth.refreshSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      
      if (!error) {
        setVisible(false);
        window.dispatchEvent(new CustomEvent("supabase:session-recovered"));
      } else {
        // If it's an invalid refresh token, we probably need a full re-login
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('timeout')) {
          // Just let the user click login
          setVisible(false);
        }
      }
    } catch (err) { 
      console.warn("Session recovery retry failed:", err);
    }
    setRecovering(false);
  }

  async function handleReLogin() {
    // Re-trigger Google OAuth
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });
  }

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top-2 fade-in duration-300"
      dir="rtl"
    >
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-950/95 border border-amber-800/50 px-4 py-3 shadow-2xl shadow-amber-900/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <WifiOff size={16} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-amber-200 leading-tight">
                انتهت صلاحية الجلسة
              </p>
              <p className="text-[11px] font-bold text-amber-400/70 mt-0.5">
                جاري محاولة إعادة الاتصال تلقائياً...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRetry}
              disabled={recovering}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-2 text-[12px] font-black text-amber-200 hover:bg-amber-500/30 transition-all border border-amber-700/50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={recovering ? "animate-spin" : ""} />
              إعادة الاتصال
            </button>
            <button
              onClick={handleReLogin}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-black text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <LogIn size={14} />
              دخول
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
