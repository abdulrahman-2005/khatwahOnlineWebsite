"use client";
import { ArrowRightLeft } from "lucide-react";

export const STATUS_COLORS = { Completed:"#10b981", Preparing:"#f59e0b", Ready:"#3b82f6", Pending:"#8b5cf6", Cancelled:"#ef4444" };
export const CHANNEL_COLORS = { Delivery:"#f43f5e", Pickup:"#14b8a6", "Dine-in":"#8b5cf6" };
export const DOW_COLORS = ["#ef4444","#f59e0b","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"];

export function FilterButton({ active, onClick, label }) {
  return (<button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${active ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"}`}>{label}</button>);
}

export function MetricCard({ label, value, icon: Icon, glowColor, sub, delta }) {
  const colorMap = { emerald:"text-emerald-400", orange:"text-orange-400", blue:"text-blue-400", purple:"text-purple-400", red:"text-red-400", amber:"text-amber-400", cyan:"text-cyan-400", pink:"text-pink-400" };
  const c = colorMap[glowColor] || "text-zinc-400";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:border-zinc-700/80">
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        {Icon && <div className="p-1 rounded-md bg-zinc-950 border border-zinc-800"><Icon size={12} className={c} /></div>}
      </div>
      <div className="text-xl lg:text-2xl font-black text-white relative z-10 tracking-tight">{value}</div>
      {sub && <div className="text-[9px] font-bold text-zinc-600 mt-1">{sub}</div>}
      {delta !== undefined && delta !== null && (
        <div className={`text-[10px] font-black mt-1 ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs prev
        </div>
      )}
    </div>
  );
}

export function ChartCard({ title, subtitle, gradient, children, className="" }) {
  return (
    <div className={`rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 shadow-xl relative overflow-hidden group ${className}`}>
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${gradient || "from-zinc-700 to-zinc-600"} opacity-30 group-hover:opacity-100 transition-opacity`} />
      <div className="mb-5">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[9px] font-bold text-zinc-600 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-3 rounded-xl shadow-2xl min-w-[130px]">
        {label && <p className="text-zinc-500 text-[9px] font-black mb-2 uppercase tracking-widest border-b border-zinc-800 pb-1.5">{label}</p>}
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color||p.payload?.fill }}/><span className="text-zinc-400 text-[10px] font-bold">{p.name||p.dataKey}</span></div>
            <span className="text-white text-xs font-black">{(p.name?.toLowerCase().includes("revenue")||p.dataKey?.includes("revenue")) ? `EGP ${Number(p.value).toLocaleString()}` : Number(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function EmptyState({ message }) {
  return (<div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40"><ArrowRightLeft size={24} className="text-zinc-600 mb-2"/><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{message}</p></div>);
}

export function pctDelta(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}
