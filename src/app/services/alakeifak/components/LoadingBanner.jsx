"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * LoadingBanner - Shows a banner after a delay if loading takes too long
 * Provides user feedback and retry option for stuck requests
 */
export default function LoadingBanner({ 
  isLoading, 
  delayMs = 5000, 
  onRetry,
  message = "This is taking longer than expected..."
}) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowBanner(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        setShowBanner(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-6 py-4 shadow-2xl max-w-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <AlertCircle size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-100 mb-1">{message}</p>
            <p className="text-xs text-amber-300/70">
              The server might be slow. You can wait or try refreshing.
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 transition-colors border border-amber-500/30"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
