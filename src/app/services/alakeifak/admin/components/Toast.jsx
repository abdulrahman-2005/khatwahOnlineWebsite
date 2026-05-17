"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/**
 * Toast notification system for the admin panel.
 * Replaces all alert() calls with non-blocking, auto-dismissing toasts.
 * 
 * Usage:
 *   const toast = useToast();
 *   toast.success("Saved successfully");
 *   toast.error("Failed to save");
 *   toast.info("Loading data...");
 */

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TOAST_STYLES = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast("success", msg, duration),
    error: (msg, duration) => addToast("error", msg, duration ?? 6000),
    info: (msg, duration) => addToast("info", msg, duration),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-200 ${TOAST_STYLES[t.type]}`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="text-xs font-bold flex-1 min-w-0">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider (shouldn't happen but safe)
    return {
      success: (msg) => console.log("[Toast]", msg),
      error: (msg) => console.error("[Toast]", msg),
      info: (msg) => console.info("[Toast]", msg),
      dismiss: () => {},
    };
  }
  return ctx;
}
