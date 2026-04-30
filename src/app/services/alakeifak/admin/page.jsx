"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import RestaurantsTable from "./components/RestaurantsTable";
import PaymentModal from "./components/PaymentModal";
import MembersModal from "./components/MembersModal";
import FinancialsDashboard from "./components/FinancialsDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SuperAdminSettingsModal from "./components/SuperAdminSettingsModal";
import {
  Store,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldOff,
  Settings,
  PieChart,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("crm"); // "crm" | "financials"
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [paymentModalRestaurant, setPaymentModalRestaurant] = useState(null);
  const [membersModalRestaurant, setMembersModalRestaurant] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();

    // Subscribe to realtime changes to keep the CRM dashboard in sync
    const channel = supabase
      .channel("admin_restaurants_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurants" },
        () => {
          fetchRestaurants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchRestaurants() {
    setLoading(true);
    // Use service_role behavior via the client-side anon key — 
    // the super admin RLS policies will allow reading all restaurants
    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        orders(count),
        restaurant_members(count)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRestaurants(data);
    }
    setLoading(false);
  }

  // Optimistic update for boolean fields
  async function updateField(restaurantId, field, newValue) {
    // Optimistic UI update
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, [field]: newValue } : r))
    );

    // Database update
    const { data, error } = await supabase
      .from("restaurants")
      .update({ [field]: newValue })
      .eq("id", restaurantId)
      .select()
      .single();

    // Revert on error
    if (error) {
      console.error(`Failed to update ${field}:`, error);
      alert(`Failed to update ${field}. Changes reverted.`);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, [field]: !newValue } : r))
      );
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = restaurants.length;
    const active = restaurants.filter((r) => r.is_active !== false).length;
    const inactive = total - active;
    const expiringSoon = restaurants.filter((r) => {
      if (!r.subscription_end_date) return false;
      const end = new Date(r.subscription_end_date);
      const now = new Date();
      const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 7;
    }).length;
    const expired = restaurants.filter((r) => {
      if (!r.subscription_end_date) return false;
      return new Date(r.subscription_end_date) < new Date();
    }).length;
    const totalOrders = restaurants.reduce(
      (sum, r) => sum + (r.orders?.[0]?.count || 0),
      0
    );

    return { total, active, inactive, expiringSoon, expired, totalOrders };
  }, [restaurants]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── TABS & SETTINGS ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "crm" 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <Activity size={16} className={activeTab === "crm" ? "text-orange-400" : ""} />
            CRM
          </button>
          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "financials" 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <DollarSign size={16} className={activeTab === "financials" ? "text-emerald-400" : ""} />
            Financials
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "analytics" 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <PieChart size={16} className={activeTab === "analytics" ? "text-purple-400" : ""} />
            Analytics
          </button>
        </div>
        
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700"
        >
          <Settings size={14} />
          Super Admins
        </button>
      </div>

      {activeTab === "crm" ? (
        <>
          {/* ── STATS GRID (CRM) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Total Restaurants"
              value={stats.total}
              icon={Store}
              color="text-zinc-400"
              bgColor="bg-zinc-800/50"
            />
            <StatCard
              label="Active"
              value={stats.active}
              icon={ShieldCheck}
              color="text-blue-400"
              bgColor="bg-blue-500/5"
              borderColor="border-blue-500/10"
            />
            <StatCard
              label="Deactivated"
              value={stats.inactive}
              icon={ShieldOff}
              color="text-red-400"
              bgColor="bg-red-500/5"
              borderColor="border-red-500/10"
            />
            <StatCard
              label="Expiring (7d)"
              value={stats.expiringSoon}
              icon={AlertTriangle}
              color="text-amber-400"
              bgColor="bg-amber-500/5"
              borderColor="border-amber-500/10"
            />
            <StatCard
              label="Expired"
              value={stats.expired}
              icon={AlertTriangle}
              color="text-red-500"
              bgColor="bg-red-500/5"
              borderColor="border-red-500/10"
            />
            <StatCard
              label="Total Orders"
              value={stats.totalOrders}
              icon={TrendingUp}
              color="text-orange-400"
              bgColor="bg-orange-500/5"
              borderColor="border-orange-500/10"
            />
          </div>

          {/* ── MAIN TABLE ── */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Store size={16} className="text-zinc-400" />
                <h2 className="text-sm font-black text-white tracking-tight">
                  Directory
                </h2>
              </div>
              <button
                onClick={fetchRestaurants}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700 disabled:opacity-50"
              >
                {loading ? <span className="animate-spin">↻</span> : "↻"}
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
                  <span className="text-xs font-bold text-zinc-600">Loading directory...</span>
                </div>
              </div>
            ) : (
              <RestaurantsTable
                restaurants={restaurants}
                onUpdateField={updateField}
                onRecordPayment={(r) => setPaymentModalRestaurant(r)}
                onManageMembers={(r) => setMembersModalRestaurant(r)}
              />
            )}
          </div>
        </>
      ) : activeTab === "financials" ? (
        <FinancialsDashboard />
      ) : (
        <AnalyticsDashboard />
      )}

      {/* ── MODALS ── */}
      {paymentModalRestaurant && (
        <PaymentModal
          restaurant={paymentModalRestaurant}
          onClose={() => setPaymentModalRestaurant(null)}
          onSuccess={() => {
            setPaymentModalRestaurant(null);
            fetchRestaurants();
          }}
        />
      )}

      {membersModalRestaurant && (
        <MembersModal
          restaurant={membersModalRestaurant}
          onClose={() => setMembersModalRestaurant(null)}
        />
      )}

      {settingsModalOpen && (
        <SuperAdminSettingsModal
          onClose={() => setSettingsModalOpen(false)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor = "bg-zinc-800/50",
  borderColor = "border-zinc-800",
}) {
  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-4 transition-all hover:border-zinc-700`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-2xl font-black ${color === "text-zinc-400" ? "text-white" : color}`}>
        {value}
      </div>
    </div>
  );
}
