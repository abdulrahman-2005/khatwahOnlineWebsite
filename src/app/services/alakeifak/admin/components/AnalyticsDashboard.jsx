"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Activity, Brain, Store, Users, RefreshCw } from "lucide-react";
import { FilterButton } from "./AnalyticsHelpers";
import OverviewTab from "./analytics/OverviewTab";
import IntelligenceTab from "./analytics/IntelligenceTab";
import RestaurantsTab from "./analytics/RestaurantsTab";
import CustomersTab from "./analytics/CustomersTab";
import RestaurantDetailModal from "./RestaurantDetailModal";
import CustomerDetailModal from "./CustomerDetailModal";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity, color: "text-orange-400" },
  { id: "intelligence", label: "Intelligence", icon: Brain, color: "text-violet-400" },
  { id: "restaurants", label: "Restaurants", icon: Store, color: "text-emerald-400" },
  { id: "customers", label: "Customers", icon: Users, color: "text-cyan-400" },
];

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [ad, setAd] = useState(null);
  const [rpcError, setRpcError] = useState(null);
  const [restaurantModal, setRestaurantModal] = useState(null);
  const [customerModal, setCustomerModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setRpcError(null);
    const params = {
      p_date_range: dateRange,
      p_custom_start: (dateRange === "custom" && customStart) ? customStart : null,
      p_custom_end: (dateRange === "custom" && customEnd) ? customEnd : null,
    };
    const { data, error } = await supabase.rpc("get_admin_analytics", params);
    if (!error && data) { setAd(data); setRpcError(null); }
    else { console.error("RPC failed:", error); setRpcError(error?.message || "Unknown error"); }
    setLoading(false);
  }, [dateRange, customStart, customEnd]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4 animate-in fade-in">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
        <Activity size={20} className="text-orange-500 animate-pulse" />
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Crunching Numbers</p>
    </div>
  );

  if (!ad) return (
    <div className="py-20 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center"><Activity size={20} className="text-red-400" /></div>
      <p className="text-sm text-zinc-400 font-bold">Analytics Engine Unavailable</p>
      {rpcError && <div className="mx-auto max-w-lg rounded-xl border border-red-500/20 bg-red-500/5 p-4"><p className="text-xs font-mono text-red-300 break-all">{rpcError}</p></div>}
      <p className="text-xs text-zinc-600">Run <code className="text-orange-400">021_admin_analytics_rpc.sql</code> in Supabase SQL Editor</p>
      <button onClick={fetchData} className="px-5 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* ── HEADER BAR ── */}
      <div className="rounded-2xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-zinc-900/80 border border-zinc-800/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Title + Tabs */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Analytics Command Center</h2>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5 tracking-wide">Server-side intelligence across all historical data</p>
            </div>
            <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60 gap-0.5 w-fit">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    tab === t.id ? "bg-zinc-800 text-white shadow-lg border border-zinc-700" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent"
                  }`}>
                  <t.icon size={14} className={tab === t.id ? t.color : ""} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Right: Date Filters */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60">
              {["today","7d","30d","90d","all"].map(r => (
                <FilterButton key={r} active={dateRange===r} onClick={() => setDateRange(r)} label={r==="all"?"All":r==="today"?"Today":r} />
              ))}
              <FilterButton active={dateRange==="custom"} onClick={() => setDateRange("custom")} label="Custom" />
            </div>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-zinc-600" />
                <span className="text-zinc-600 text-xs font-bold">→</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-zinc-600" />
                <button onClick={fetchData} className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase hover:bg-orange-500/30 transition-colors">Go</button>
              </div>
            )}
            <button onClick={fetchData} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors"><RefreshCw size={10} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {tab === "overview" && <OverviewTab data={ad} onViewRestaurant={r => setRestaurantModal(r)} onViewCustomer={p => setCustomerModal(p)} />}
      {tab === "intelligence" && <IntelligenceTab data={ad} />}
      {tab === "restaurants" && <RestaurantsTab data={ad} dateRange={dateRange} onViewRestaurant={r => setRestaurantModal(r)} />}
      {tab === "customers" && <CustomersTab data={ad} onViewCustomer={p => setCustomerModal(p)} />}

      {/* ── MODALS ── */}
      {restaurantModal && <RestaurantDetailModal restaurantId={restaurantModal.id} restaurantName={restaurantModal.name} dateRange={dateRange} onClose={() => setRestaurantModal(null)} />}
      {customerModal && <CustomerDetailModal phone={customerModal} onClose={() => setCustomerModal(null)} />}
    </div>
  );
}
