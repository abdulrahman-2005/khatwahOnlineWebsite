"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { X, TrendingUp, Activity, Users, DollarSign, Clock, ShoppingBag, Phone, MapPin } from "lucide-react";

const STATUS_COLORS = { Completed: "#10b981", Preparing: "#f59e0b", Ready: "#3b82f6", Pending: "#8b5cf6", Cancelled: "#ef4444" };
const CHANNEL_COLORS = { Delivery: "#f43f5e", Pickup: "#14b8a6", "Dine-in": "#8b5cf6" };

export default function RestaurantDetailModal({ restaurantId, restaurantName, dateRange, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: d, error } = await supabase.rpc("get_admin_restaurant_detail", {
        p_restaurant_id: restaurantId, p_date_range: dateRange
      });
      if (!error && d) setData(d);
      setLoading(false);
    }
    load();
  }, [restaurantId, dateRange]);

  const m = data?.metrics || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl mt-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-black text-white">{restaurantName}</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Restaurant Deep Dive — {dateRange}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { l: "Revenue", v: `EGP ${Number(m.revenue||0).toLocaleString(undefined,{maximumFractionDigits:0})}`, c: "text-emerald-400" },
                { l: "Orders", v: Number(m.orders||0).toLocaleString(), c: "text-orange-400" },
                { l: "Clients", v: Number(m.clients||0).toLocaleString(), c: "text-blue-400" },
                { l: "AOV", v: `EGP ${Number(m.aov||0).toLocaleString()}`, c: "text-purple-400" },
                { l: "Cancelled", v: Number(m.cancelledOrders||0).toLocaleString(), c: "text-red-400" },
                { l: "Fulfillment", v: `${Number(m.fulfillmentRate||0).toFixed(1)}%`, c: Number(m.fulfillmentRate||0) > 80 ? "text-emerald-400" : "text-red-400" },
              ].map(s => (
                <div key={s.l} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.l}</div>
                  <div className={`text-lg font-black ${s.c}`}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            {data.timeline?.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Revenue & Volume Timeline</h3>
                <div className="h-56 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rdRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="label" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="l" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="r" orientation="right" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px' }} />
                      <Area yAxisId="l" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} fill="none" name="Orders" />
                      <Area yAxisId="r" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rdRev)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Status + Channel + Peak Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.statusBreakdown?.length > 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Status</h3>
                  <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={data.statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                        {data.statusBreakdown.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || "#71717a"} />)}
                      </Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {data.statusBreakdown.map(s => (
                      <div key={s.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#71717a' }} /><span className="text-[9px] font-bold text-zinc-500">{s.name} ({s.value})</span></div>
                    ))}
                  </div>
                </div>
              )}
              {data.channelBreakdown?.length > 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Channels</h3>
                  <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={data.channelBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                        {data.channelBreakdown.map((e, i) => <Cell key={i} fill={CHANNEL_COLORS[e.name] || "#71717a"} />)}
                      </Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {data.channelBreakdown.map(s => (
                      <div key={s.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: CHANNEL_COLORS[s.name] || '#71717a' }} /><span className="text-[9px] font-bold text-zinc-500">{s.name} ({s.value})</span></div>
                    ))}
                  </div>
                </div>
              )}
              {data.peakHours?.length > 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Peak Hours</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.peakHours} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="hour" stroke="#71717a" fontSize={8} axisLine={false} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={8} axisLine={false} tickLine={false} />
                        <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Top Items + Top Customers + Delivery Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2"><ShoppingBag size={12} /> Top Items</h3>
                {data.topItems?.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.topItems.map((it, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
                        <div className="flex items-center gap-2"><span className="text-[10px] text-zinc-600 font-mono w-4">{i+1}.</span><span className="text-xs font-bold text-zinc-300 truncate max-w-[140px]">{it.name}</span></div>
                        <div className="flex items-center gap-3"><span className="text-xs font-black text-emerald-400">{it.quantity}x</span><span className="text-[10px] text-zinc-500 font-bold">EGP {Number(it.revenue||0).toLocaleString()}</span></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-zinc-600">No data</p>}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={12} /> Top Customers</h3>
                {data.topCustomers?.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.topCustomers.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
                        <div><div className="text-xs font-bold text-zinc-300">{c.name}</div><a href={`https://wa.me/${(c.phone||'').replace(/[^0-9]/g,'')}`} target="_blank" className="text-[10px] text-zinc-600 hover:text-emerald-400 flex items-center gap-0.5"><Phone size={8}/>{c.phone}</a></div>
                        <div className="text-right"><div className="text-xs font-black text-orange-400">{c.orders}x</div><div className="text-[10px] text-zinc-500">EGP {Number(c.spent||0).toLocaleString()}</div></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-zinc-600">No data</p>}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={12} /> Delivery Zones</h3>
                {data.deliveryZones?.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.deliveryZones.map((z, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
                        <span className="text-xs font-bold text-zinc-300">{z.zone}</span>
                        <div className="flex items-center gap-3"><span className="text-xs font-black text-blue-400">{z.orders} orders</span><span className="text-[10px] text-zinc-500">EGP {Number(z.fee||0)} fee</span></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-zinc-600">No delivery data</p>}
              </div>
            </div>
          </div>
        ) : <div className="py-20 text-center text-sm text-zinc-600">Failed to load data</div>}
      </div>
    </div>
  );
}
