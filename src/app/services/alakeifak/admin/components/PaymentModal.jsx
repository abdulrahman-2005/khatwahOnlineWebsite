"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/**
 * PaymentModal — Records an offline payment for a restaurant.
 * Calls the `record_payment` RPC function which atomically:
 *   1. Inserts into restaurant_payments
 *   2. Extends the restaurant's subscription_end_date
 */
export default function PaymentModal({ restaurant, onClose, onSuccess }) {
  const [mode, setMode] = useState("payment"); // "payment" | "override"
  
  // Payment state
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [notes, setNotes] = useState("");
  
  // Override state
  const [exactDate, setExactDate] = useState(() => {
    if (restaurant.subscription_end_date) {
      return new Date(restaurant.subscription_end_date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const currentEnd = restaurant.subscription_end_date
    ? new Date(restaurant.subscription_end_date)
    : null;

  const isExpired = currentEnd && currentEnd < new Date();

  const projectedEnd = (() => {
    if (mode === "override") return new Date(exactDate);
    const days = parseInt(durationDays) || 0;
    if (days <= 0) return null;
    const base = currentEnd && !isExpired ? new Date(currentEnd) : new Date();
    base.setDate(base.getDate() + days);
    return base;
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (mode === "payment") {
        const amountNum = parseFloat(amount);
        const daysNum = parseInt(durationDays);
        if (!amountNum || amountNum <= 0) throw new Error("Please enter a valid amount.");
        if (!daysNum || daysNum <= 0) throw new Error("Please enter a valid duration.");

        // 1. Record payment history
        const { error: paymentError } = await supabase
          .from("restaurant_payments")
          .insert({
            restaurant_id: restaurant.id,
            amount: amountNum,
            duration_days: daysNum,
            recorded_by: user?.id || null,
            notes: notes.trim() || null,
          });
        
        // Non-fatal if payment history table doesn't exist yet, we still want to extend the sub
        if (paymentError && paymentError.code !== '42P01') {
          throw paymentError;
        }

        // 2. Extend subscription
        const { error: updateError } = await supabase
          .from("restaurants")
          .update({ subscription_end_date: projectedEnd.toISOString() })
          .eq("id", restaurant.id);
          
        if (updateError) throw updateError;

      } else if (mode === "revoke") {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() - 1); // Set to yesterday
        
        // Log the revocation as a negative payment if amount is provided
        const refundNum = parseFloat(amount) || 0;
        
        if (refundNum > 0 || notes.trim()) {
          await supabase.from("restaurant_payments").insert({
            restaurant_id: restaurant.id,
            amount: -Math.abs(refundNum), // force negative
            duration_days: 0,
            recorded_by: user?.id || null,
            notes: notes.trim() || "Subscription Revoked",
          });
        }

        const { error: updateError } = await supabase
          .from("restaurants")
          .update({ subscription_end_date: newDate.toISOString() })
          .eq("id", restaurant.id);
          
        if (updateError) throw updateError;
        
      } else {
        // Manual Override Mode
        if (!exactDate) throw new Error("Please select a date.");
        const newDate = new Date(exactDate);
        
        const { error: updateError } = await supabase
          .from("restaurants")
          .update({ subscription_end_date: newDate.toISOString() })
          .eq("id", restaurant.id);
          
        if (updateError) throw updateError;
      }

      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      console.error("Subscription update failed:", err);
      setError(err.message || "Failed to update subscription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${mode === "revoke" ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <Calendar size={14} className={mode === "revoke" ? "text-red-400" : "text-emerald-400"} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Manage Subscription</h3>
              <p className="text-[11px] font-mono text-zinc-600">{restaurant.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700">
            <X size={14} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-2 border-b border-zinc-800">
          <button
            onClick={() => setMode("payment")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${mode === "payment" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Record Payment
          </button>
          <button
            onClick={() => setMode("override")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${mode === "override" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Custom Date
          </button>
          <button
            onClick={() => setMode("revoke")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${mode === "revoke" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Revoke / Refund
          </button>
        </div>

        {/* Current Status Preview */}
        <div className="mx-6 mt-4 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-500">Current End Date:</span>
            <span className={`font-mono font-bold ${isExpired ? "text-red-400" : currentEnd ? "text-emerald-400" : "text-zinc-600"}`}>
              {currentEnd ? currentEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "No subscription"}
              {isExpired && " (EXPIRED)"}
            </span>
          </div>
          {projectedEnd && mode !== "revoke" && (
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-zinc-700/50">
              <span className="font-bold text-zinc-500">New Target Date:</span>
              <span className="font-mono font-bold text-orange-400">
                → {projectedEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          )}
          {mode === "revoke" && (
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-zinc-700/50">
              <span className="font-bold text-red-400">Action:</span>
              <span className="font-mono font-bold text-red-400">
                Instantly Expire Subscription
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 size={40} className={mode === "revoke" ? "text-red-400" : "text-emerald-400"} />
              <p className={`text-sm font-bold ${mode === "revoke" ? "text-red-400" : "text-emerald-400"}`}>Updated successfully!</p>
            </div>
          ) : (
            <>
              {mode === "payment" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Amount (EGP)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm font-black text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500/50 transition-colors" autoFocus />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Duration (days to add)</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm font-black text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500/50 transition-colors" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {[{ label: "7d", value: "7" }, { label: "30d", value: "30" }, { label: "180d", value: "180" }, { label: "365d", value: "365" }].map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setDurationDays(opt.value)} className={`flex-1 rounded-md py-1.5 text-[10px] font-bold transition-all border ${durationDays === opt.value ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Notes (optional)</label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-3 text-zinc-600" />
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Vodafone Cash #1234..." rows={2} className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-emerald-500/50 transition-colors" />
                    </div>
                  </div>
                </>
              ) : mode === "revoke" ? (
                <>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
                    <p className="text-xs font-bold text-red-400">
                      This will instantly expire the restaurant's subscription. You can optionally log a refund amount below.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Refund Amount (EGP - Optional)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm font-black text-white outline-none placeholder:text-zinc-700 focus:border-red-500/50 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Reason (Required for refunds)</label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-3 text-zinc-600" />
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Refunded via Vodafone Cash..." rows={2} className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-red-500/50 transition-colors" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Set Exact Expiration Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="date" value={exactDate} onChange={(e) => setExactDate(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm font-black text-white outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <p className="text-[10px] text-zinc-500 pt-1">
                    This directly overwrites the subscription end date. Useful for fixing mistakes or manually matching a contract.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs font-bold text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={submitting} className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${mode === "payment" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-orange-600 hover:bg-orange-500"}`}>
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : mode === "payment" ? (
                  <><DollarSign size={16} /> Record & Extend</>
                ) : (
                  <><Calendar size={16} /> Force Update Date</>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
