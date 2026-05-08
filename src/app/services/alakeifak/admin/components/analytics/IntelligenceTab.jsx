"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Brain, ShieldAlert, Zap, Users, TrendingDown, Clock, CalendarDays, MapPin, AlertTriangle } from "lucide-react";
import { DOW_COLORS, ChartCard, CustomTooltip, EmptyState } from "../AnalyticsHelpers";

const SEG_COLORS = { "Whale (10+)": "#f59e0b", "Regular (5-9)": "#3b82f6", "Casual (2-4)": "#8b5cf6", "One-timer": "#71717a" };

function InsightCard({ icon: Icon, color, bgColor, title, value, description, severity }) {
  const severityBorder = { good: "border-emerald-500/20", warn: "border-amber-500/20", bad: "border-red-500/20", neutral: "border-zinc-800" };
  return (
    <div className={`rounded-2xl border ${severityBorder[severity]||severityBorder.neutral} bg-zinc-900/40 p-5 transition-all hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-xl`}>
      <div className="flex items-start gap-4">
        <div className={`shrink-0 p-2.5 rounded-xl ${bgColor||'bg-zinc-800'} border border-zinc-700/50`}><Icon size={18} className={color||'text-zinc-400'} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.12em] mb-1">{title}</p>
          <p className="text-xl font-black text-white mb-1.5">{value}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function IntelligenceTab({ data }) {
  const segments = data?.customerSegments || [];
  const concentration = data?.revenueConcentration || {};
  const health = data?.restaurantHealth || [];
  const retention = data?.retention || {};
  const peakHours = data?.peakHours || [];
  const dow = data?.dayOfWeek || [];
  const gm = data?.globalMetrics || {};

  // Compute smart insights
  const insights = [];
  const top10 = Number(concentration.top10pct || 0);
  if (top10 > 60) insights.push({ icon: ShieldAlert, color: "text-red-400", bgColor: "bg-red-500/10", title: "Revenue Concentration Risk", value: `${top10.toFixed(0)}% from top 10%`, description: "Your revenue is dangerously concentrated. If your top customers leave, you lose the majority of income. Diversify your customer base.", severity: "bad" });
  else if (top10 > 40) insights.push({ icon: ShieldAlert, color: "text-amber-400", bgColor: "bg-amber-500/10", title: "Revenue Concentration", value: `${top10.toFixed(0)}% from top 10%`, description: "Moderate concentration. Keep nurturing your top spenders while growing the mid-tier.", severity: "warn" });
  else insights.push({ icon: ShieldAlert, color: "text-emerald-400", bgColor: "bg-emerald-500/10", title: "Revenue Diversified", value: `${top10.toFixed(0)}% from top 10%`, description: "Healthy revenue distribution. No single customer group dominates.", severity: "good" });

  const retRate = Number(retention.retentionRate || 0);
  if (retRate > 0) {
    insights.push({ icon: Users, color: retRate > 30 ? "text-emerald-400" : "text-red-400", bgColor: retRate > 30 ? "bg-emerald-500/10" : "bg-red-500/10", title: "Customer Retention", value: `${retRate.toFixed(1)}% returned`, description: `${retention.retained || 0} customers from the previous period ordered again. ${retention.churned || 0} churned and didn't come back.`, severity: retRate > 30 ? "good" : "bad" });
  }

  const oneTimers = segments.find(s => s.segment === "One-timer");
  if (oneTimers && Number(oneTimers.count) > 0) {
    const totalCustomers = segments.reduce((s, seg) => s + (seg.count || 0), 0);
    const oneTimerPct = totalCustomers > 0 ? ((oneTimers.count / totalCustomers) * 100).toFixed(0) : 0;
    insights.push({ icon: TrendingDown, color: Number(oneTimerPct) > 60 ? "text-red-400" : "text-amber-400", bgColor: Number(oneTimerPct) > 60 ? "bg-red-500/10" : "bg-amber-500/10", title: "One-Time Buyers", value: `${oneTimerPct}% never reordered`, description: `${oneTimers.count} customers ordered only once. Consider loyalty rewards or follow-up WhatsApp messages to bring them back.`, severity: Number(oneTimerPct) > 60 ? "bad" : "warn" });
  }

  const fulfillment = Number(gm.approvalRate || 0);
  if (fulfillment < 80) insights.push({ icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10", title: "Low Fulfillment Alert", value: `${fulfillment.toFixed(1)}% fulfillment`, description: "Too many orders are being cancelled. Investigate which restaurants have the highest cancel rates and why.", severity: "bad" });

  // Best performing day/hour
  if (dow.length > 0) {
    const bestDay = [...dow].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
    insights.push({ icon: CalendarDays, color: "text-blue-400", bgColor: "bg-blue-500/10", title: "Best Day", value: bestDay.dayName, description: `${bestDay.dayName} generates the most revenue (EGP ${Number(bestDay.revenue||0).toLocaleString()}) with ${bestDay.orders} orders. Focus marketing pushes on this day.`, severity: "neutral" });
  }
  if (peakHours.length > 0) {
    const bestHour = [...peakHours].sort((a, b) => (b.orders || 0) - (a.orders || 0))[0];
    insights.push({ icon: Clock, color: "text-purple-400", bgColor: "bg-purple-500/10", title: "Rush Hour", value: bestHour.hour, description: `Peak ordering happens at ${bestHour.hour} with ${bestHour.orders} orders. Ensure all restaurants have enough staff during this window.`, severity: "neutral" });
  }

  return (
    <div className="space-y-8">
      {/* Smart Insight Cards */}
      <div>
        <div className="flex items-center gap-2 mb-5"><Brain size={16} className="text-violet-400" /><h3 className="text-sm font-black text-white uppercase tracking-wider">Actionable Insights</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
        </div>
      </div>

      {/* Customer Segments + Revenue Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Customer Segments" subtitle="Who are your customers?" gradient="from-amber-500 to-blue-500">
          {segments.length > 0 ? (
            <div className="space-y-4">
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={segments} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="segment" stroke="none">
                  {segments.map((s,i) => <Cell key={i} fill={SEG_COLORS[s.segment]||"#71717a"}/>)}
                </Pie><RTooltip content={<CustomTooltip/>}/></PieChart></ResponsiveContainer>
              </div>
              <div className="space-y-2.5 border-t border-zinc-800/40 pt-4">
                {segments.map(s => (
                  <div key={s.segment} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{background:SEG_COLORS[s.segment]||'#71717a'}}/><span className="text-xs font-bold text-zinc-300">{s.segment}</span></div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-white">{s.count} customers</span>
                      <span className="text-[10px] font-bold text-zinc-500">EGP {Number(s.revenue||0).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-amber-400">{Number(s.pctRevenue||0).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState message="No segment data"/>}
        </ChartCard>

        <div className="space-y-6">
          {/* Revenue Concentration */}
          <ChartCard title="Revenue Concentration (Pareto)" subtitle="How dependent are you on top spenders?" gradient="from-red-500 to-amber-500">
            <div className="space-y-5 pt-2">
              {[
                { label: "Top 10% of Customers", value: concentration.top10pct, danger: 60 },
                { label: "Top 20% of Customers", value: concentration.top20pct, danger: 75 },
                { label: "Bottom 50% of Customers", value: concentration.bottom50pct, danger: null },
              ].map(r => {
                const val = Number(r.value || 0);
                const color = r.danger ? (val > r.danger ? "#ef4444" : val > r.danger * 0.7 ? "#f59e0b" : "#10b981") : "#3b82f6";
                return (
                  <div key={r.label} className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs font-bold text-zinc-400">{r.label}</span><span className="text-sm font-black text-white">{val.toFixed(1)}% of revenue</span></div>
                    <div className="h-2.5 bg-zinc-800/60 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{width:`${Math.min(val,100)}%`,background:color}}/></div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Peak Hours + Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Peak Ordering Hours" subtitle="When do customers order?" gradient="from-blue-400 to-indigo-500">
          <div className="h-56 w-full">
            {peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours} margin={{top:5,right:5,left:-25,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false}/>
                  <XAxis dataKey="hour" stroke="#52525b" fontSize={9} axisLine={false} tickLine={false}/>
                  <YAxis stroke="#52525b" fontSize={9} axisLine={false} tickLine={false}/>
                  <RTooltip content={<CustomTooltip/>} cursor={{fill:'#27272a',opacity:0.3}}/>
                  <Bar dataKey="orders" fill="#6366f1" radius={[4,4,0,0]} name="Orders"/>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data"/>}
          </div>
        </ChartCard>

        <ChartCard title="Day of Week Performance" subtitle="Revenue & orders by weekday" gradient="from-pink-500 to-amber-500">
          <div className="h-56 w-full">
            {dow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dow} margin={{top:5,right:5,left:-25,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false}/>
                  <XAxis dataKey="dayName" stroke="#52525b" fontSize={11} axisLine={false} tickLine={false}/>
                  <YAxis stroke="#52525b" fontSize={9} axisLine={false} tickLine={false}/>
                  <RTooltip content={<CustomTooltip/>} cursor={{fill:'#27272a',opacity:0.3}}/>
                  <Bar dataKey="orders" name="Orders" radius={[4,4,0,0]}>
                    {dow.map((e,i) => <Cell key={i} fill={DOW_COLORS[e.day]||"#71717a"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data"/>}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
