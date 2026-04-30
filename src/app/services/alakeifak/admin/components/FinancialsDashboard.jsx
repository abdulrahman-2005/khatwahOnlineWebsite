"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  FileText,
  Activity,
  ArrowRightLeft
} from "lucide-react";

export default function FinancialsDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'payments', 'refunds'

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    // Fetch payments and join with restaurants
    const { data, error } = await supabase
      .from("restaurant_payments")
      .select(`
        *,
        restaurants(name, slug)
      `)
      .order("payment_date", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Type filter
      if (filterType === "payments" && p.amount <= 0) return false;
      if (filterType === "refunds" && p.amount >= 0) return false;
      
      // Search filter (restaurant name, slug, or notes)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.restaurants?.name?.toLowerCase().includes(query);
        const slugMatch = p.restaurants?.slug?.toLowerCase().includes(query);
        const noteMatch = p.notes?.toLowerCase().includes(query);
        if (!nameMatch && !slugMatch && !noteMatch) return false;
      }
      
      return true;
    });
  }, [payments, searchQuery, filterType]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalRefunds = 0;
    let paymentCount = 0;
    let refundCount = 0;

    payments.forEach((p) => {
      if (p.amount > 0) {
        totalRevenue += parseFloat(p.amount);
        paymentCount++;
      } else if (p.amount < 0) {
        totalRefunds += Math.abs(parseFloat(p.amount));
        refundCount++;
      }
    });

    const netRevenue = totalRevenue - totalRefunds;

    return { totalRevenue, totalRefunds, netRevenue, paymentCount, refundCount };
  }, [payments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard
          label="Net Revenue"
          value={`EGP ${stats.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Activity}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        />
        <StatCard
          label="Gross Payments"
          value={`EGP ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`${stats.paymentCount} transactions`}
          icon={TrendingUp}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        />
        <StatCard
          label="Total Refunds"
          value={`EGP ${stats.totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`${stats.refundCount} transactions`}
          icon={TrendingDown}
          color="text-red-400"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/20"
        />
        <StatCard
          label="Total Ledger Entries"
          value={payments.length}
          icon={FileText}
          color="text-zinc-400"
          bgColor="bg-zinc-800/50"
          borderColor="border-zinc-800"
        />
      </div>

      {/* ── MAIN TABLE ── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <DollarSign size={16} className="text-emerald-400" />
            <h2 className="text-sm font-black text-white tracking-tight">
              Accounting Ledger
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-800/50 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${filterType === "all" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("payments")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${filterType === "payments" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Payments
              </button>
              <button
                onClick={() => setFilterType("refunds")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${filterType === "refunds" ? "bg-red-500/20 text-red-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Refunds
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700 disabled:opacity-50"
              title="Refresh Ledger"
            >
              {loading ? <span className="animate-spin">↻</span> : "↻"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
              <span className="text-xs font-bold text-zinc-600">Loading financials...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 hidden md:table-cell">Days Added</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredPayments.map((p) => {
                  const isRefund = p.amount < 0;
                  const absAmount = Math.abs(p.amount);
                  
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-zinc-800/30">
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-zinc-400">
                          {new Date(p.payment_date).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{p.restaurants?.name || "Unknown"}</span>
                          <span className="text-[10px] font-mono text-zinc-600">/{p.restaurants?.slug || "unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isRefund ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                          {isRefund ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                          {isRefund ? "Refund" : "Payment"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-black font-mono ${isRefund ? "text-red-400" : "text-emerald-400"}`}>
                          {isRefund ? "-" : "+"}EGP {absAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-bold text-zinc-500">
                          {p.duration_days > 0 ? `+${p.duration_days} days` : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell max-w-[200px] truncate">
                        <span className="text-xs text-zinc-500" title={p.notes}>
                          {p.notes || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ArrowRightLeft size={32} className="text-zinc-700 mb-3" />
                <p className="text-sm font-bold text-zinc-600">No ledger entries found.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Footer Count */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/30">
          <span className="text-[11px] font-mono text-zinc-600">
            {filteredPayments.length} transactions shown
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, color, bgColor = "bg-zinc-800/50", borderColor = "border-zinc-800" }) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 transition-all hover:border-zinc-700`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-3xl font-black ${color === "text-zinc-400" ? "text-white" : color}`}>
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-[10px] font-bold text-zinc-600 uppercase">
          {subtext}
        </div>
      )}
    </div>
  );
}
