"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, LabelList } from "recharts";
import { Eye, Search, MapPin, ChevronDown, ShoppingBag } from "lucide-react";
import { ChartCard, CustomTooltip, EmptyState } from "../AnalyticsHelpers";

function HealthBadge({ score }) {
  const s = Number(score || 0);
  const color = s >= 70 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : s >= 40 ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-red-500/15 text-red-400 border-red-500/20";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black ${color}`}>{s}</span>;
}

export default function RestaurantsTab({ data, dateRange, onViewRestaurant }) {
  const restaurants = data?.revenueByRestaurant || [];
  const health = data?.restaurantHealth || [];
  const zones = data?.deliveryZones || [];
  const topItems = data?.topItems || [];
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("revenue"); // revenue, orders, clients, health

  // Merge health scores into restaurants
  const healthMap = {};
  health.forEach(h => { healthMap[h.id] = h; });
  const merged = restaurants.map(r => ({ ...r, health: healthMap[r.id]?.score || 0, fulfillment: healthMap[r.id]?.fulfillment || 0 }));

  const filtered = merged.filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "health") return (b.health || 0) - (a.health || 0);
    if (sortBy === "orders") return (b.orders || 0) - (a.orders || 0);
    if (sortBy === "clients") return (b.clients || 0) - (a.clients || 0);
    return (b.revenue || 0) - (a.revenue || 0);
  });
  const visible = showAll ? sorted : sorted.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"/><input type="text" placeholder="Search restaurants..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-72 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 transition-colors"/></div>
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-wider">
          Sort by:
          {["revenue","orders","clients","health"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 rounded-md transition-colors ${sortBy === s ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Health Scores Bar Chart */}
      {health.length > 0 && (
        <ChartCard title="Restaurant Health Scores" subtitle="Composite: 40% fulfillment + 30% client diversity + 30% order volume" gradient="from-emerald-500 to-blue-500">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={health.slice(0, 10)} margin={{top:15,right:10,left:-20,bottom:15}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false}/>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false}/>
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} domain={[0,100]}/>
                <RTooltip content={<CustomTooltip/>} cursor={{fill:'#27272a',opacity:0.3}}/>
                <Bar dataKey="score" name="Health Score" radius={[5,5,0,0]} maxBarSize={45}>
                  {health.slice(0,10).map((h,i) => <cell key={i} fill={Number(h.score)>=70?"#10b981":Number(h.score)>=40?"#f59e0b":"#ef4444"}/>)}
                  <LabelList dataKey="score" position="top" fill="#a1a1aa" fontSize={10} fontWeight="bold"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Restaurant Table */}
      {visible.length > 0 ? (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/50 bg-zinc-900/60">
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-3 text-center">Health</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Clients</th>
                <th className="py-3 px-3 text-right">AOV</th>
                <th className="py-3 px-3 text-right">Fulfillment</th>
                <th className="py-3 px-3 text-right">Cancel%</th>
                <th className="py-3 px-3 text-right hidden lg:table-cell">Del/Pick/Dine</th>
                <th className="py-3 px-3 text-center">View</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-800/20">
                {visible.map((r, i) => (
                  <tr key={r.id||i} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><span className="text-[10px] text-zinc-600 font-mono w-5">{i+1}.</span><span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{r.name}</span></div></td>
                    <td className="py-3 px-3 text-center"><HealthBadge score={r.health}/></td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400 text-xs">EGP {Number(r.revenue||0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-orange-400 text-xs">{r.orders}</td>
                    <td className="py-3 px-3 text-right font-bold text-blue-400 text-xs">{r.clients}</td>
                    <td className="py-3 px-3 text-right font-bold text-purple-400 text-xs">EGP {r.aov}</td>
                    <td className="py-3 px-3 text-right"><span className={`text-xs font-black ${Number(r.fulfillment||0)>80?'text-emerald-400':Number(r.fulfillment||0)>50?'text-amber-400':'text-red-400'}`}>{Number(r.fulfillment||0).toFixed(0)}%</span></td>
                    <td className="py-3 px-3 text-right"><span className={`text-xs font-black ${Number(r.cancelRate||0)>15?'text-red-400':'text-zinc-500'}`}>{Number(r.cancelRate||0).toFixed(1)}%</span></td>
                    <td className="py-3 px-3 text-right text-[10px] text-zinc-500 font-mono hidden lg:table-cell">{r.deliveryOrders||0}/{r.pickupOrders||0}/{r.dineInOrders||0}</td>
                    <td className="py-3 px-3 text-center"><button onClick={() => onViewRestaurant({id:r.id,name:r.name})} className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-600 hover:text-white transition-colors"><Eye size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > 12 && !showAll && (
            <div className="px-4 py-3 border-t border-zinc-800/40"><button onClick={() => setShowAll(true)} className="w-full py-2 rounded-lg bg-zinc-800/50 text-[10px] font-black text-zinc-400 uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"><ChevronDown size={12}/>Show all {sorted.length}</button></div>
          )}
        </div>
      ) : <EmptyState message="No restaurant data"/>}

      {/* Delivery Zones + Top Items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {zones.length > 0 && (
          <ChartCard title="Delivery Zone Popularity" subtitle="Most ordered-from zones" gradient="from-cyan-500 to-blue-500">
            <div className="space-y-3 pt-1">
              {zones.slice(0, 10).map((z, i) => {
                const maxOrders = Math.max(...zones.map(zz => zz.orders || 0));
                const pct = maxOrders > 0 ? ((z.orders / maxOrders) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between"><span className="text-xs font-bold text-zinc-300 flex items-center gap-1"><MapPin size={10} className="text-zinc-600"/>{z.zone}</span><span className="text-xs font-black text-cyan-400">{z.orders} orders</span></div>
                    <div className="h-1.5 bg-zinc-800/60 rounded-full overflow-hidden"><div className="h-full rounded-full bg-cyan-500/70 transition-all duration-700" style={{width:`${pct}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}

        {topItems.length > 0 && (
          <ChartCard title="Top Menu Items" subtitle="Best sellers platform-wide" gradient="from-pink-500 to-rose-500">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {topItems.slice(0, 15).map((it, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/20 last:border-0">
                  <div className="flex items-center gap-2 min-w-0"><span className="text-[10px] text-zinc-600 font-mono w-5 shrink-0">{i+1}.</span><div className="min-w-0"><p className="text-xs font-bold text-zinc-300 truncate">{it.name}</p><p className="text-[9px] text-rose-400/60 font-bold">{it.restaurantName}</p></div></div>
                  <div className="flex items-center gap-3 shrink-0"><span className="text-xs font-black text-emerald-400">{it.quantity}x</span><span className="text-[10px] text-zinc-500 font-bold">EGP {Number(it.revenue||0).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
