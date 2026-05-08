"use client";
import { useState } from "react";
import { Phone, Search, Crown, Eye, ChevronDown } from "lucide-react";
import { ChartCard, EmptyState } from "../AnalyticsHelpers";

function SegmentBadge({ orders }) {
  const o = Number(orders || 0);
  if (o >= 10) return <span className="px-2 py-0.5 rounded-md border text-[9px] font-black bg-amber-500/15 text-amber-400 border-amber-500/20">Whale</span>;
  if (o >= 5) return <span className="px-2 py-0.5 rounded-md border text-[9px] font-black bg-blue-500/15 text-blue-400 border-blue-500/20">Regular</span>;
  if (o >= 2) return <span className="px-2 py-0.5 rounded-md border text-[9px] font-black bg-purple-500/15 text-purple-400 border-purple-500/20">Casual</span>;
  return <span className="px-2 py-0.5 rounded-md border text-[9px] font-black bg-zinc-800 text-zinc-500 border-zinc-700">One-timer</span>;
}

export default function CustomersTab({ data, onViewCustomer }) {
  const customers = data?.topCustomers || [];
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("spent"); // spent, orders, avgOrder

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "orders") return (b.orders || 0) - (a.orders || 0);
    if (sortBy === "avgOrder") return (b.avgOrder || 0) - (a.avgOrder || 0);
    return (b.spent || 0) - (a.spent || 0);
  });

  const visible = showAll ? sorted : sorted.slice(0, 15);
  const totalSpent = customers.reduce((s, c) => s + Number(c.spent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"/><input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-72 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 transition-colors"/></div>
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-wider">
          Sort by:
          {["spent","orders","avgOrder"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 rounded-md transition-colors ${sortBy === s ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>{s === "avgOrder" ? "AOV" : s}</button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      {visible.length > 0 ? (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/50 bg-zinc-900/60">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3 text-center">Segment</th>
                <th className="py-3 px-3 text-right">Total Spent</th>
                <th className="py-3 px-3 text-right">Revenue %</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">AOV</th>
                <th className="py-3 px-3 text-right hidden md:table-cell">Restaurants</th>
                <th className="py-3 px-3 text-right hidden lg:table-cell">Last Order</th>
                <th className="py-3 px-3 text-center">Profile</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-800/20">
                {visible.map((c, i) => {
                  const revPct = totalSpent > 0 ? ((Number(c.spent || 0) / totalSpent) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600 font-mono w-5">{i+1}.</span>
                          {i < 3 && <Crown size={12} className={i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-400" : "text-amber-700"} />}
                          <div>
                            <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{c.name}</p>
                            <a href={`https://wa.me/${(c.phone||'').replace(/[^0-9]/g,'')}`} target="_blank" className="text-[10px] text-zinc-600 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"><Phone size={8}/>{c.phone}</a>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center"><SegmentBadge orders={c.orders}/></td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400 text-xs">EGP {Number(c.spent||0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500/50 transition-all" style={{width:`${Math.min(revPct * 5, 100)}%`}}/></div>
                          <span className="text-[10px] font-bold text-zinc-500">{revPct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-orange-400 text-xs">{c.orders}</td>
                      <td className="py-3 px-3 text-right font-bold text-purple-400 text-xs">EGP {Number(c.avgOrder||0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-xs text-zinc-500 hidden md:table-cell">{c.restaurants || '-'}</td>
                      <td className="py-3 px-3 text-right text-[10px] text-zinc-600 hidden lg:table-cell">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-GB', {day:'2-digit',month:'short'}) : '-'}</td>
                      <td className="py-3 px-3 text-center"><button onClick={() => onViewCustomer(c.phone)} className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-600 hover:text-white transition-colors"><Eye size={14}/></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length > 15 && !showAll && (
            <div className="px-4 py-3 border-t border-zinc-800/40"><button onClick={() => setShowAll(true)} className="w-full py-2 rounded-lg bg-zinc-800/50 text-[10px] font-black text-zinc-400 uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"><ChevronDown size={12}/>Show all {sorted.length}</button></div>
          )}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 bg-zinc-900/40"><span className="text-[10px] font-mono text-zinc-600">{sorted.length} customers • Total LTV: EGP {totalSpent.toLocaleString()}</span></div>
        </div>
      ) : <EmptyState message="No customer data"/>}
    </div>
  );
}
