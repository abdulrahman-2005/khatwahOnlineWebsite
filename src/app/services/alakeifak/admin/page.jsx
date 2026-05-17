"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { safeQuery, safeMutation, createDebouncedFetcher } from "../lib/safeQuery";
import { createManagedChannel } from "../lib/realtimeManager";
import SessionRecoveryBanner from "../components/SessionRecoveryBanner";
import LoadingBanner from "../components/LoadingBanner";
import { ToastProvider, useToast } from "./components/Toast";
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
  RefreshCw,
} from "lucide-react";

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

// Skeleton loader for stats grid
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3.5 w-3.5 rounded bg-zinc-700" />
            <div className="h-2.5 w-16 rounded bg-zinc-700" />
          </div>
          <div className="h-7 w-12 rounded bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for the table
function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/30 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded bg-zinc-800" />
            <div className="h-2.5 w-20 rounded bg-zinc-800/60" />
          </div>
          <div className="h-3.5 w-8 rounded bg-zinc-800 hidden sm:block" />
          <div className="h-3.5 w-16 rounded bg-zinc-800 hidden md:block" />
          <div className="h-6 w-16 rounded-md bg-zinc-800 hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

function AdminPageInner() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("crm");
  
  const [restaurants, setRestaurants] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [platformStats, setPlatformStats] = useState({ losses: 0, cancelledCount: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchCountRef = useRef(0);
  const abortControllerRef = useRef(null);
  const fetchInProgressRef = useRef(false);

  // Modal states
  const [paymentModalRestaurant, setPaymentModalRestaurant] = useState(null);
  const [membersModalRestaurant, setMembersModalRestaurant] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Track which tabs have been mounted (lazy-mount, then persist via CSS)
  const [mountedTabs, setMountedTabs] = useState(new Set(["crm"]));

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMountedTabs(prev => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }

  const fetchData = useCallback(async (isRefresh = false) => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log('[Admin CRM] Fetch already in progress, skipping...');
      return;
    }
    
    console.log('[Admin CRM] Starting fetch, isRefresh:', isRefresh);
    fetchInProgressRef.current = true;
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    const fetchId = ++fetchCountRef.current;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Try the new single-call CRM RPC first
      console.log('[Admin CRM] Calling get_admin_crm_data RPC...');
      const crmResult = await safeQuery(() => supabase.rpc('get_admin_crm_data'), { signal });

      console.log('[Admin CRM] RPC result:', crmResult.error ? 'ERROR' : 'SUCCESS', crmResult.error?.message);

      if (fetchId !== fetchCountRef.current) {
        console.log('[Admin CRM] Stale request, aborting');
        fetchInProgressRef.current = false;
        return; // Stale request
      }

      if (!crmResult.error && crmResult.data) {
        const data = crmResult.data;
        
        // Restaurants come pre-enriched with orderCount and memberCount
        const enrichedRestaurants = (data.restaurants || []).map(r => ({
          ...r,
          orders: [{ count: r.orderCount || 0 }],
          restaurant_members: [{ count: r.memberCount || 0 }],
        }));

        setRestaurants(enrichedRestaurants);
        setAllTags(data.allTags || []);
        setPlatformStats({
          losses: data.platformStats?.losses || 0,
          cancelledCount: data.platformStats?.cancelledCount || 0,
          totalOrders: data.platformStats?.totalOrders || 0,
        });
      } else {
        // Fallback: use old multi-query approach
        console.warn("CRM RPC unavailable, falling back. Run 022_admin_crm_rpc.sql. Error:", crmResult.error?.message);

        const statsResult = await supabase.rpc('get_admin_platform_stats');

        if (fetchId !== fetchCountRef.current) {
          fetchInProgressRef.current = false;
          return;
        }

        if (!statsResult.error && statsResult.data) {
          const [restaurantsResult, membersResult] = await Promise.all([
            safeQuery(() => supabase.from("restaurants").select("*, orders(count)").order("created_at", { ascending: false }), { signal }),
            safeQuery(() => supabase.from("restaurant_members").select("restaurant_id"), { signal })
          ]);

          if (fetchId !== fetchCountRef.current) {
            fetchInProgressRef.current = false;
            return;
          }

          if (!restaurantsResult.error && restaurantsResult.data) {
            const memberCounts = {};
            (membersResult.data || []).forEach(m => {
              memberCounts[m.restaurant_id] = (memberCounts[m.restaurant_id] || 0) + 1;
            });

            const enrichedData = restaurantsResult.data.map(r => ({
              ...r,
              orders: [{ count: r.orders?.[0]?.count || 0 }],
              restaurant_members: [{ count: memberCounts[r.id] || 0 }]
            }));
            
            setRestaurants(enrichedData);
            
            // Extract unique tags
            const tagSet = new Set();
            enrichedData.forEach(r => {
              if (Array.isArray(r.tags)) r.tags.forEach(t => tagSet.add(t));
            });
            setAllTags([...tagSet]);
          }

          setPlatformStats({
            losses: statsResult.data.losses || 0,
            cancelledCount: statsResult.data.cancelledCount || 0,
            totalOrders: statsResult.data.totalOrders || 0
          });
        } else {
          // Last resort: client-side aggregation
          const [restaurantsResult, ordersResult, membersResult] = await Promise.all([
            safeQuery(() => supabase.from("restaurants").select("*").order("created_at", { ascending: false }), { signal }),
            safeQuery(() => supabase.from("orders").select("restaurant_id, status, total_amount"), { signal }),
            safeQuery(() => supabase.from("restaurant_members").select("restaurant_id"), { signal })
          ]);

          if (fetchId !== fetchCountRef.current) {
            fetchInProgressRef.current = false;
            return;
          }

          if (!restaurantsResult.error && restaurantsResult.data) {
            const orderCounts = {};
            const memberCounts = {};
            
            (ordersResult.data || []).forEach(o => {
              orderCounts[o.restaurant_id] = (orderCounts[o.restaurant_id] || 0) + 1;
            });
            
            (membersResult.data || []).forEach(m => {
              memberCounts[m.restaurant_id] = (memberCounts[m.restaurant_id] || 0) + 1;
            });
            
            const enrichedData = restaurantsResult.data.map(r => ({
              ...r,
              orders: [{ count: orderCounts[r.id] || 0 }],
              restaurant_members: [{ count: memberCounts[r.id] || 0 }]
            }));
            
            setRestaurants(enrichedData);

            let totalLosses = 0;
            let cancelledCount = 0;
            (ordersResult.data || []).forEach(o => {
              if (o.status === 'cancelled') {
                cancelledCount++;
                if (o.total_amount < 0) totalLosses += Math.abs(o.total_amount);
              }
          });
          setPlatformStats({
            losses: totalLosses,
            cancelledCount,
            totalOrders: ordersResult.data?.length || 0
          });
        }
      }
    }
    } catch (err) {
      if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
        console.error('[Admin CRM] Fetch error:', err);
      } else {
        console.log('[Admin CRM] Fetch aborted');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  // Debounced version for realtime events
  const debouncedFetch = useMemo(() => createDebouncedFetcher(() => fetchData(true), 800), [fetchData]);

  useEffect(() => {
    fetchData();

    // Visibility change handler - pause fetches when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible, refresh data
        console.log('[Admin CRM] Tab visible, refreshing...');
        fetchData(true);
      }
    };
    
    // Handle page show event (fires on back/forward navigation and hard refresh)
    const handlePageShow = (event) => {
      // event.persisted is true if page was loaded from cache (bfcache)
      if (event.persisted) {
        console.log('[Admin CRM] Page restored from cache, forcing refresh...');
        // Force a complete refresh
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        fetchInProgressRef.current = false;
        fetchData(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    const { unsubscribe } = createManagedChannel(
      "admin_restaurants_changes",
      (channel) => {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: "restaurants" },
          () => {
            // Only fetch if document is visible
            if (document.visibilityState === 'visible') {
              debouncedFetch();
            }
          }
        );
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      unsubscribe();
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, debouncedFetch]);

  // Optimistic update with rollback + toast feedback
  const updateField = useCallback(async (restaurantId, field, newValue) => {
    const previousRestaurants = restaurants;
    const restaurant = restaurants.find(r => r.id === restaurantId);
    const fieldLabel = field === 'is_active' ? 'Active status' : field === 'is_verified' ? 'Verification' : field;
    
    await safeMutation(
      () => supabase
        .from("restaurants")
        .update({ [field]: newValue })
        .eq("id", restaurantId)
        .select()
        .single(),
      {
        optimisticUpdate: () => {
          setRestaurants((prev) =>
            prev.map((r) => (r.id === restaurantId ? { ...r, [field]: newValue } : r))
          );
        },
        rollback: () => {
          setRestaurants(previousRestaurants);
          toast.error(`Failed to update ${fieldLabel}. Changes reverted.`);
        },
        onSuccess: () => {
          toast.success(`${restaurant?.name || 'Restaurant'}: ${fieldLabel} updated.`);
        },
      }
    );
  }, [restaurants, toast]);

  // Tag update handler — called from RestaurantsTable after successful tag save
  const handleTagsUpdated = useCallback((restaurantId, newTags) => {
    setRestaurants(prev =>
      prev.map(r => r.id === restaurantId ? { ...r, tags: newTags } : r)
    );
    // Update allTags
    const tagSet = new Set();
    restaurants.forEach(r => {
      const tags = r.id === restaurantId ? newTags : (r.tags || []);
      tags.forEach(t => tagSet.add(t));
    });
    setAllTags([...tagSet]);
    toast.success("Tags saved successfully.");
  }, [restaurants, toast]);

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
    const totalOrdersCount = restaurants.reduce(
      (sum, r) => sum + (r.orders?.[0]?.count || 0),
      0
    );
    const withTags = restaurants.filter(r => Array.isArray(r.tags) && r.tags.length > 0).length;
    const withoutTags = total - withTags;

    return { 
      total, active, inactive, expiringSoon, expired, 
      totalOrders: totalOrdersCount,
      losses: platformStats.losses,
      cancelRate: platformStats.totalOrders > 0 ? (platformStats.cancelledCount / platformStats.totalOrders) * 100 : 0,
      withTags,
      withoutTags,
    };
  }, [restaurants, platformStats]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Session Recovery Banner */}
      <SessionRecoveryBanner />
      
      {/* Loading Banner - shows after 5s if still loading */}
      <LoadingBanner 
        isLoading={loading || refreshing} 
        onRetry={() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          fetchInProgressRef.current = false;
          fetchData(true);
        }}
      />
      
      {/* ── TABS & SETTINGS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange("crm")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "crm" 
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <Activity size={16} className={activeTab === "crm" ? "text-orange-400" : ""} />
            CRM
          </button>
          <button
            onClick={() => handleTabChange("financials")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "financials" 
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <DollarSign size={16} className={activeTab === "financials" ? "text-emerald-400" : ""} />
            Financials
          </button>
          <button
            onClick={() => handleTabChange("analytics")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "analytics" 
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            <PieChart size={16} className={activeTab === "analytics" ? "text-purple-400" : ""} />
            Analytics
          </button>
        </div>
        
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800 w-full sm:w-auto shrink-0"
        >
          <Settings size={16} />
          Super Admins
        </button>
      </div>

      {/* CRM Tab */}
      <div style={{ display: activeTab === "crm" ? "block" : "none" }}>
        <>
          {/* ── STATS GRID (CRM) ── */}
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                value={stats.totalOrders.toLocaleString()}
                icon={TrendingUp}
                color="text-orange-400"
                bgColor="bg-orange-500/5"
                borderColor="border-orange-500/10"
              />
              <StatCard
                label="Total Losses"
                value={`EGP ${stats.losses.toLocaleString()}`}
                icon={AlertTriangle}
                color="text-red-500"
                bgColor="bg-red-500/5"
                borderColor="border-red-500/10"
              />
              <StatCard
                label="Cancel Rate"
                value={`${stats.cancelRate.toFixed(1)}%`}
                icon={Activity}
                color="text-amber-500"
                bgColor="bg-amber-500/5"
                borderColor="border-amber-500/10"
              />
            </div>
          )}

          {/* ── MAIN TABLE ── */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Store size={16} className="text-zinc-400" />
                <h2 className="text-sm font-black text-white tracking-tight">
                  Directory
                </h2>
                {!loading && (
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-md">
                    {stats.withTags} tagged · {stats.withoutTags} untagged
                  </span>
                )}
              </div>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700 disabled:opacity-50"
              >
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : (
              <RestaurantsTable
                restaurants={restaurants}
                allTags={allTags}
                onUpdateField={updateField}
                onTagsUpdated={handleTagsUpdated}
                onRecordPayment={(r) => setPaymentModalRestaurant(r)}
                onManageMembers={(r) => setMembersModalRestaurant(r)}
              />
            )}
          </div>
        </>
      </div>

      {/* Financials & Analytics — mount on first visit, persist via CSS */}
      {mountedTabs.has("financials") && (
        <div style={{ display: activeTab === "financials" ? "block" : "none" }}>
          <FinancialsDashboard />
        </div>
      )}
      {mountedTabs.has("analytics") && (
        <div style={{ display: activeTab === "analytics" ? "block" : "none" }}>
          <AnalyticsDashboard />
        </div>
      )}

      {/* ── MODALS ── */}
      {paymentModalRestaurant && (
        <PaymentModal
          restaurant={paymentModalRestaurant}
          onClose={() => setPaymentModalRestaurant(null)}
          onSuccess={() => {
            setPaymentModalRestaurant(null);
            fetchData(true);
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

// Wrap with ToastProvider
export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminPageInner />
    </ToastProvider>
  );
}
