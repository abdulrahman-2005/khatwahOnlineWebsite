"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { safeQuery } from "../../lib/safeQuery";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LabelList
} from "recharts";
import { 
  TrendingUp, BarChart3, Users, DollarSign, Loader2, PieChart as PieChartIcon, 
  Activity, Filter, ArrowRightLeft, Clock, ShoppingBag, Crown, Navigation 
} from "lucide-react";
import { Store as StoreIcon } from "lucide-react";

const STATUS_COLORS = {
  Completed: "#10b981", // Emerald
  Preparing: "#f59e0b", // Amber
  Ready: "#3b82f6",     // Blue
  Pending: "#8b5cf6",    // Purple
  Cancelled: "#ef4444", // Red
};

const CHANNEL_COLORS = {
  Delivery: "#f43f5e",   // Rose
  Pickup: "#14b8a6",     // Teal
  "Dine-in": "#8b5cf6",  // Purple
};

export default function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d"); // today, 7d, 30d, all

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [restResult, ordResult] = await Promise.all([
      safeQuery(() => supabase.from("restaurants").select("id, name, slug")),
      safeQuery(() => supabase.from("orders").select("id, restaurant_id, status, total_amount, customer_phone, created_at, order_type, cart_snapshot")),
    ]);

    if (restResult.data) setRestaurants(restResult.data);
    if (ordResult.data) setOrders(ordResult.data);
    setLoading(false);
  }

  // Filter orders based on selected date range
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (dateRange === "all") return orders;

    const now = new Date();
    const past = new Date();
    if (dateRange === "today") past.setHours(0, 0, 0, 0);
    else if (dateRange === "7d") past.setDate(now.getDate() - 7);
    else if (dateRange === "30d") past.setDate(now.getDate() - 30);

    return orders.filter((o) => new Date(o.created_at) >= past);
  }, [orders, dateRange]);

  const {
    revenueByRestaurant,
    statusBreakdown,
    ordersTimeline,
    globalMetrics,
    channelBreakdown,
    peakHours,
    topItems,
    topCustomers
  } = useMemo(() => {
    if (!filteredOrders.length || !restaurants.length) {
      return { 
        revenueByRestaurant: [], statusBreakdown: [], ordersTimeline: [], 
        channelBreakdown: [], peakHours: [], topItems: [], topCustomers: [],
        globalMetrics: { revenue: 0, orders: 0, clients: 0, aov: 0, approvalRate: 0 } 
      };
    }

    const restMap = {};
    restaurants.forEach(r => {
      restMap[r.id] = { name: r.name, revenue: 0, orders: 0, clients: new Set() };
    });

    const statusCounts = { Completed: 0, Preparing: 0, Ready: 0, Pending: 0, Cancelled: 0 };
    const timelineMap = {};
    const globalClients = new Set();
    
    // Advanced Insights Aggregators
    const orderTypes = { delivery: 0, pickup: 0, in_house: 0 };
    const hourlyCounts = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, '0')}:00`, orders: 0 }));
    const itemsMap = {};
    const customersMap = {};

    let totalRevenue = 0;
    let completedOrders = 0;

    filteredOrders.forEach(o => {
      const rest = restMap[o.restaurant_id];
      const amount = parseFloat(o.total_amount || 0);
      const isSuccess = o.status === 'completed' || o.status === 'delivered';
      
      if (rest) {
        rest.orders += 1;
        if (isSuccess) rest.revenue += amount;
        if (o.customer_phone) rest.clients.add(o.customer_phone);
      }

      if (o.customer_phone) globalClients.add(o.customer_phone);

      // Status aggregation
      if (isSuccess) {
        statusCounts.Completed++;
        totalRevenue += amount;
        completedOrders++;
      } else if (o.status === 'cancelled') statusCounts.Cancelled++;
      else if (o.status === 'preparing') statusCounts.Preparing++;
      else if (o.status === 'ready') statusCounts.Ready++;
      else statusCounts.Pending++;

      // Timeline aggregation
      const dateObj = new Date(o.created_at);
      let timeKey = dateRange === "today" 
        ? dateObj.getHours().toString().padStart(2, '0') + ':00' 
        : dateObj.toISOString().split('T')[0];
      let timeLabel = dateRange === "today" 
        ? timeKey 
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!timelineMap[timeKey]) timelineMap[timeKey] = { key: timeKey, label: timeLabel, orders: 0, revenue: 0 };
      timelineMap[timeKey].orders += 1;
      if (isSuccess) timelineMap[timeKey].revenue += amount;

      // --- SMART INSIGHTS ---

      // 1. Channel Breakdown
      if (o.order_type) orderTypes[o.order_type] = (orderTypes[o.order_type] || 0) + 1;

      // 2. Peak Hours
      hourlyCounts[dateObj.getHours()].orders += 1;

      // 3. Top Items (Cart parsing)
      if (isSuccess && o.cart_snapshot && Array.isArray(o.cart_snapshot)) {
        o.cart_snapshot.forEach(item => {
          // Normalize item name to handle slight variations if any
          const itemName = item.name || "Unknown Item";
          if (!itemsMap[itemName]) itemsMap[itemName] = { name: itemName, quantity: 0, revenue: 0 };
          const qty = parseInt(item.quantity || 1);
          itemsMap[itemName].quantity += qty;
          itemsMap[itemName].revenue += (parseFloat(item.price || 0) * qty);
        });
      }

      // 4. Top Customers (Whales)
      if (isSuccess && o.customer_phone) {
        if (!customersMap[o.customer_phone]) {
          customersMap[o.customer_phone] = { phone: o.customer_phone, orders: 0, spent: 0 };
        }
        customersMap[o.customer_phone].orders += 1;
        customersMap[o.customer_phone].spent += amount;
      }
    });

    // Formatting Data for Charts
    const revenueData = Object.values(restMap)
      .filter(r => r.orders > 0)
      .map(r => ({ ...r, clients: r.clients.size, aov: r.orders > 0 ? (r.revenue / r.orders).toFixed(0) : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const statusData = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const timelineData = Object.values(timelineMap)
      .sort((a, b) => a.key.localeCompare(b.key));

    const channelData = [
      { name: "Delivery", value: orderTypes.delivery || 0 },
      { name: "Pickup", value: orderTypes.pickup || 0 },
      { name: "Dine-in", value: orderTypes.in_house || 0 },
    ].filter(t => t.value > 0);

    const topItemsData = Object.values(itemsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const topCustomersData = Object.values(customersMap)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    const globalMetrics = {
      revenue: totalRevenue,
      orders: filteredOrders.length,
      clients: globalClients.size,
      aov: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      approvalRate: filteredOrders.length > 0 ? (completedOrders / filteredOrders.length) * 100 : 0
    };

    return { 
      revenueByRestaurant: revenueData, statusBreakdown: statusData, ordersTimeline: timelineData, 
      globalMetrics, channelBreakdown: channelData, peakHours: hourlyCounts, topItems: topItemsData, topCustomers: topCustomersData 
    };
  }, [filteredOrders, restaurants, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4 animate-in fade-in">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
          <Activity size={20} className="text-orange-500 animate-pulse" />
        </div>
        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Aggregating Advanced Insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Platform Analytics & Insights</h2>
          <p className="text-xs font-bold text-zinc-500 mt-1">Deep operational insights derived from platform data</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80">
          <FilterButton active={dateRange === "today"} onClick={() => setDateRange("today")} label="Today" />
          <FilterButton active={dateRange === "7d"} onClick={() => setDateRange("7d")} label="7 Days" />
          <FilterButton active={dateRange === "30d"} onClick={() => setDateRange("30d")} label="30 Days" />
          <FilterButton active={dateRange === "all"} onClick={() => setDateRange("all")} label="All Time" />
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Gross Volume (GMV)" value={`EGP ${globalMetrics.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={DollarSign} glowColor="emerald" />
        <MetricCard label="Total Orders" value={globalMetrics.orders.toLocaleString()} icon={BarChart3} glowColor="orange" />
        <MetricCard label="Unique Clients" value={globalMetrics.clients.toLocaleString()} icon={Users} glowColor="blue" />
        <MetricCard label="Average Order Value" value={`EGP ${globalMetrics.aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={TrendingUp} glowColor="purple" />
        <MetricCard label="Fulfillment Rate" value={`${globalMetrics.approvalRate.toFixed(1)}%`} icon={Activity} glowColor={globalMetrics.approvalRate > 80 ? "emerald" : "red"} />
      </div>

      {/* ROW 1: TIMELINE & STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><TrendingUp size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Revenue & Volume Trends</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Overall platform performance timeline</p>
            </div>
          </div>
          <div className="h-80 w-full min-w-0 min-h-0">
            {ordersTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={ordersTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `£${val}`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} fill="url(#colorOrd)" name="Order Volume" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" name="Revenue (EGP)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No timeline data" />}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><PieChartIcon size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Order Status</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Fulfillment vs Refusals</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative min-w-0 min-h-0">
            {statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {statusBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#71717a"} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                  <span className="text-2xl font-black text-white">{filteredOrders.length}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Total</span>
                </div>
                <div className="absolute bottom-[-10px] w-full flex flex-wrap justify-center gap-3">
                  {statusBreakdown.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || '#71717a' }} />
                      <span className="text-[10px] font-bold text-zinc-400">{s.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyState message="No status data" />}
          </div>
        </div>
      </div>

      {/* ROW 2: SMART INSIGHTS (Channels & Peak Hours) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><Navigation size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Order Channels</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Delivery vs Pickup vs Dine-in</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative min-w-0 min-h-0">
            {channelBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={channelBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {channelBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.name] || "#71717a"} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                  <span className="text-xl font-black text-white">Channels</span>
                </div>
                <div className="absolute bottom-[-10px] w-full flex flex-wrap justify-center gap-3">
                  {channelBreakdown.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[s.name] || '#71717a' }} />
                      <span className="text-[10px] font-bold text-zinc-400">{s.name} ({((s.value / filteredOrders.length) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyState message="No channel data" />}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><Clock size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Peak Ordering Hours</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Aggregated platform traffic by hour of day</p>
            </div>
          </div>
          <div className="h-64 w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: MENU & CLIENT LEADERBOARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><ShoppingBag size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Top Trending Menu Items</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Most ordered items across all restaurants</p>
            </div>
          </div>
          {topItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/50">
                    <th className="pb-3 px-2">Item Name</th>
                    <th className="pb-3 px-2 text-right">Qty Sold</th>
                    <th className="pb-3 px-2 text-right">Revenue Gen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {topItems.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <span className="text-zinc-600 font-mono text-[10px] w-4">{i + 1}.</span>
                        <span className="text-sm font-bold text-zinc-300 max-w-[200px] truncate" title={item.name}>{item.name}</span>
                      </td>
                      <td className="py-3 px-2 text-right font-black text-emerald-400">{item.quantity}x</td>
                      <td className="py-3 px-2 text-right font-bold text-zinc-400">EGP {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState message="No item data found" />}
        </div>

        <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><Crown size={16} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Top Spenders (Whales)</h3>
              <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Highest lifetime value clients in period</p>
            </div>
          </div>
          {topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/50">
                    <th className="pb-3 px-2">Client Phone</th>
                    <th className="pb-3 px-2 text-right">Orders</th>
                    <th className="pb-3 px-2 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {topCustomers.map((c, i) => (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <span className="text-zinc-600 font-mono text-[10px] w-4">{i + 1}.</span>
                        <span className="text-sm font-bold text-zinc-300 font-mono">{c.phone}</span>
                      </td>
                      <td className="py-3 px-2 text-right font-black text-orange-400">{c.orders}</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-400">EGP {c.spent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState message="No client data found" />}
        </div>
      </div>

      {/* ROW 4: RESTAURANT LEADERBOARD */}
      <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700"><StoreIcon size={16} className="text-white" /></div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Restaurant Leaderboard</h3>
            <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Comparing top performers across the platform</p>
          </div>
        </div>
        
        <div className="h-80 w-full min-w-0 min-h-0">
          {revenueByRestaurant.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={revenueByRestaurant} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickMargin={15} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `£${val.toLocaleString()}`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="revenue" position="top" formatter={(val) => `£${val.toLocaleString()}`} fill="#a1a1aa" fontSize={10} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No revenue data" />}
        </div>

        {revenueByRestaurant.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-t border-zinc-800/50 pt-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  <th className="pb-3 px-2">Restaurant</th>
                  <th className="pb-3 px-2 text-right">Revenue</th>
                  <th className="pb-3 px-2 text-right">Orders</th>
                  <th className="pb-3 px-2 text-right">Clients</th>
                  <th className="pb-3 px-2 text-right">AOV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {revenueByRestaurant.map((r, i) => (
                  <tr key={r.name} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <span className="text-zinc-600 font-mono text-[10px] w-4">{i + 1}.</span>
                      <span className="text-sm font-bold text-zinc-300">{r.name}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-black text-emerald-400">EGP {r.revenue.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-bold text-orange-400">{r.orders}</td>
                    <td className="py-3 px-2 text-right font-bold text-blue-400">{r.clients}</td>
                    <td className="py-3 px-2 text-right font-bold text-purple-400">EGP {r.aov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
        active ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value, icon: Icon, glowColor }) {
  const glowMap = {
    emerald: "text-emerald-400 shadow-emerald-500/10",
    orange: "text-orange-400 shadow-orange-500/10",
    blue: "text-blue-400 shadow-blue-500/10",
    purple: "text-purple-400 shadow-purple-500/10",
    red: "text-red-400 shadow-red-500/10",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-700/80">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="p-1.5 rounded-md bg-zinc-950 border border-zinc-800">
          <Icon size={14} className={glowMap[glowColor]?.split(' ')[0]} />
        </div>
      </div>
      <div className="text-2xl lg:text-3xl font-black text-white relative z-10 tracking-tight">
        {value}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[150px]">
        {label && <p className="text-zinc-500 text-[10px] font-black mb-3 uppercase tracking-widest border-b border-zinc-800 pb-2">{label}</p>}
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.fill }} />
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{p.name || p.dataKey}</span>
            </div>
            <span className="text-white text-sm font-black">
              {(p.name?.toLowerCase().includes("revenue") || p.dataKey?.includes("revenue")) 
                ? `EGP ${Number(p.value).toLocaleString()}` 
                : Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
      <ArrowRightLeft size={32} className="text-zinc-600 mb-3" />
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{message}</p>
    </div>
  );
}
