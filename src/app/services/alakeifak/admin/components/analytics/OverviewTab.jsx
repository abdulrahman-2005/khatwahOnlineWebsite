"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { DollarSign, BarChart3, Users, TrendingUp, Activity, ArrowRightLeft, ShoppingBag, UserPlus, UserCheck, Target } from "lucide-react";
import { STATUS_COLORS, MetricCard, ChartCard, CustomTooltip, EmptyState, pctDelta } from "../AnalyticsHelpers";

export default function OverviewTab({ data, onViewRestaurant, onViewCustomer }) {
  const gm = data?.globalMetrics || {};
  const prev = data?.previousPeriod || {};
  const timeline = data?.ordersTimeline || [];
  const status = data?.statusBreakdown || [];
  const channels = data?.channelBreakdown || [];
  const retention = data?.retention || {};

  return (
    <div className="space-y-6">
      {/* KPI Row 1: Revenue & Volume */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard label="Net Revenue" value={`EGP ${Number(gm.revenue||0).toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={DollarSign} glowColor="emerald" delta={pctDelta(gm.revenue,prev.revenue)} />
        <MetricCard label="Total Orders" value={Number(gm.orders||0).toLocaleString()} icon={BarChart3} glowColor="orange" delta={pctDelta(gm.orders,prev.orders)} />
        <MetricCard label="Unique Clients" value={Number(gm.clients||0).toLocaleString()} icon={Users} glowColor="blue" delta={pctDelta(gm.clients,prev.clients)} />
        <MetricCard label="Avg Order Value" value={`EGP ${Number(gm.aov||0).toFixed(0)}`} icon={TrendingUp} glowColor="purple" />
        <MetricCard label="Fulfillment Rate" value={`${Number(gm.approvalRate||0).toFixed(1)}%`} icon={Activity} glowColor={Number(gm.approvalRate||0)>80?"emerald":"red"} />
      </div>

      {/* KPI Row 2: Deep Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Cancelled" value={Number(gm.cancelledOrders||0).toLocaleString()} icon={ArrowRightLeft} glowColor="red" sub={`EGP ${Number(gm.losses||0).toLocaleString()} lost`} />
        <MetricCard label="Avg Cart Size" value={`${Number(gm.avgItemsPerOrder||0).toFixed(1)} items`} icon={ShoppingBag} glowColor="amber" />
        <MetricCard label="New Clients" value={Number(gm.newCustomers||0).toLocaleString()} icon={UserPlus} glowColor="cyan" />
        <MetricCard label="Returning" value={Number(gm.returningCustomers||0).toLocaleString()} icon={UserCheck} glowColor="pink" />
        <MetricCard label="Retention Rate" value={`${Number(retention.retentionRate||0).toFixed(1)}%`} icon={Target} glowColor={Number(retention.retentionRate||0)>30?"emerald":"red"} sub={`${retention.retained||0} of ${retention.prevPeriodCustomers||0} returned`} />
        <MetricCard label="Churned" value={Number(retention.churned||0).toLocaleString()} icon={ArrowRightLeft} glowColor="red" sub="Did not return this period" />
      </div>

      {/* Timeline */}
      <ChartCard title="Revenue & Order Trends" subtitle="With cancellation overlay" gradient="from-orange-500 to-emerald-500" className="min-h-[420px]">
        <div className="h-80 w-full min-w-0">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{top:10,right:10,left:-15,bottom:0}}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false}/>
                <XAxis dataKey="label" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tickMargin={8}/>
                <YAxis yAxisId="l" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="r" orientation="right" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v=>`£${v}`}/>
                <RTooltip content={<CustomTooltip/>}/>
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize:'10px',fontWeight:'700'}}/>
                <Area yAxisId="l" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gOrd)" name="Orders" activeDot={{r:5,strokeWidth:0}}/>
                <Area yAxisId="r" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#gRev)" name="Revenue (EGP)" activeDot={{r:5,strokeWidth:0}}/>
                <Area yAxisId="l" type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={1.5} fill="none" name="Cancelled" strokeDasharray="5 3" strokeOpacity={0.7}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No timeline data"/>}
        </div>
      </ChartCard>

      {/* Status + Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Order Status Breakdown" gradient="from-blue-500 to-purple-500">
          <div className="h-56 w-full relative">
            {status.length > 0 ? (<>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={status} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                {status.map((e,i)=><Cell key={i} fill={STATUS_COLORS[e.name]||"#71717a"}/>)}
              </Pie><RTooltip content={<CustomTooltip/>}/></PieChart></ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-3xl font-black text-white">{Number(gm.orders||0).toLocaleString()}</span><span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.15em]">Total Orders</span></div>
            </>) : <EmptyState message="No data"/>}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-zinc-800/40">
            {status.map(s => {
              const pct = gm.orders > 0 ? ((s.value / gm.orders) * 100).toFixed(1) : 0;
              return (<div key={s.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:STATUS_COLORS[s.name]||'#71717a'}}/><span className="text-[10px] font-bold text-zinc-400">{s.name}</span><span className="text-[10px] font-black text-zinc-600">{s.value} ({pct}%)</span></div>);
            })}
          </div>
        </ChartCard>

        <ChartCard title="Channel Performance" subtitle="Revenue contribution per channel" gradient="from-teal-500 to-rose-500">
          {channels.length > 0 ? (
            <div className="space-y-5 pt-2">
              {channels.map(ch => {
                const COLORS = { Delivery: "#f43f5e", Pickup: "#14b8a6", "Dine-in": "#8b5cf6" };
                const maxVal = Math.max(...channels.map(c => c.value || 0));
                const pct = maxVal > 0 ? ((ch.value / maxVal) * 100) : 0;
                const totalOrders = channels.reduce((s,c) => s + (c.value||0), 0);
                const orderPct = totalOrders > 0 ? ((ch.value / totalOrders) * 100).toFixed(0) : 0;
                return (
                  <div key={ch.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{background:COLORS[ch.name]||'#71717a'}}/><span className="text-sm font-bold text-zinc-200">{ch.name}</span></div>
                      <div className="text-right"><span className="text-sm font-black text-white">{ch.value} orders</span><span className="text-xs text-zinc-500 ml-2">({orderPct}%)</span></div>
                    </div>
                    <div className="h-2 bg-zinc-800/60 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:COLORS[ch.name]||'#71717a'}}/></div>
                    <div className="text-[10px] font-bold text-zinc-600 text-right">EGP {Number(ch.revenue||0).toLocaleString()} revenue</div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState message="No channel data"/>}
        </ChartCard>
      </div>
    </div>
  );
}
