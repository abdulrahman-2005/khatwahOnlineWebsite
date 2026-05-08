"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, Phone, ShoppingBag, TrendingUp, Calendar, MapPin } from "lucide-react";

export default function CustomerDetailModal({ phone, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: d, error } = await supabase.rpc("get_admin_customer_detail", { p_phone: phone });
      if (!error && d) setData(d);
      setLoading(false);
    }
    load();
  }, [phone]);

  const c = data?.customer || {};
  const channelLabel = { delivery: "Delivery", pickup: "Pickup", in_house: "Dine-in" };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl mt-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-black text-white">{c.name || phone}</h2>
            <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center gap-1 mt-0.5 transition-colors"><Phone size={10} />{phone}</a>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" /></div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Customer KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Total Spent", v: `EGP ${Number(c.totalSpent||0).toLocaleString()}`, c: "text-emerald-400" },
                { l: "Orders", v: c.totalOrders || 0, c: "text-orange-400" },
                { l: "Avg Order", v: `EGP ${Number(c.avgOrder||0).toLocaleString()}`, c: "text-purple-400" },
                { l: "Restaurants", v: c.restaurantsUsed || 0, c: "text-blue-400" },
              ].map(s => (
                <div key={s.l} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.l}</div>
                  <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-1"><Calendar size={10} /> First Order: {c.firstOrder ? new Date(c.firstOrder).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar size={10} /> Last Order: {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
              <span className="flex items-center gap-1"><MapPin size={10} /> Preferred: {channelLabel[c.preferredChannel] || c.preferredChannel || 'N/A'}</span>
              {c.cancelledOrders > 0 && <span className="text-red-400">Cancelled: {c.cancelledOrders}</span>}
            </div>

            {/* Restaurant Breakdown */}
            {data.restaurantBreakdown?.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Restaurants Ordered From</h3>
                <div className="space-y-2">
                  {data.restaurantBreakdown.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600 font-mono w-4">{i+1}.</span>
                        <a href={`/services/alakeifak/${r.slug}`} target="_blank" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{r.name}</a>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-orange-400">{r.orders} orders</span>
                        <span className="text-xs font-black text-emerald-400">EGP {Number(r.spent||0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Items */}
            {data.favoriteItems?.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2"><ShoppingBag size={12} /> Favorite Items</h3>
                <div className="flex flex-wrap gap-2">
                  {data.favoriteItems.map((it, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300">
                      {it.name} <span className="text-emerald-400 font-black">{it.quantity}x</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            {data.orderHistory?.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Order History</h3>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead><tr className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800/50 sticky top-0 bg-zinc-900/90">
                      <th className="pb-2 px-2">Tracking</th><th className="pb-2 px-2">Restaurant</th><th className="pb-2 px-2">Status</th><th className="pb-2 px-2 text-right">Total</th><th className="pb-2 px-2 text-right">Items</th><th className="pb-2 px-2 text-right">Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-zinc-800/20">
                      {data.orderHistory.map((o, i) => {
                        const statusColors = { completed: 'text-emerald-400', delivered: 'text-emerald-400', cancelled: 'text-red-400', preparing: 'text-amber-400', ready: 'text-blue-400', pending: 'text-purple-400' };
                        return (
                          <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="py-2 px-2 text-[10px] font-mono text-zinc-500">{o.trackingId}</td>
                            <td className="py-2 px-2"><a href={`/services/alakeifak/${o.restaurantSlug}`} target="_blank" className="text-xs font-bold text-zinc-400 hover:text-white">{o.restaurant}</a></td>
                            <td className="py-2 px-2"><span className={`text-[10px] font-black uppercase ${statusColors[o.status] || 'text-zinc-500'}`}>{o.status}</span></td>
                            <td className="py-2 px-2 text-right text-xs font-bold text-zinc-300">EGP {Number(o.total||0).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-xs text-zinc-500">{o.itemCount}</td>
                            <td className="py-2 px-2 text-right text-[10px] text-zinc-600">{new Date(o.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : <div className="py-20 text-center text-sm text-zinc-600">Failed to load customer data</div>}
      </div>
    </div>
  );
}
