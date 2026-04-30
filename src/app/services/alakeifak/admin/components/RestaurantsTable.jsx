"use client";

import { useState } from "react";
import {
  Store,
  ToggleRight,
  ToggleLeft,
  ExternalLink,
  DollarSign,
  Users,
  Clock,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function RestaurantsTable({
  restaurants,
  onUpdateField,
  onRecordPayment,
  onManageMembers,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const ToggleSwitch = ({ active, onClick, label, activeColor }) => (
    <div className="flex flex-col items-center justify-center gap-0.5" title={label}>
      <button onClick={onClick} className="transition-transform hover:scale-110 active:scale-95">
        {active ? (
          <ToggleRight size={24} className={activeColor} />
        ) : (
          <ToggleLeft size={24} className="text-zinc-600" />
        )}
      </button>
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">{label}</span>
    </div>
  );

  const filteredAndSorted = [...restaurants]
    .filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "orders") {
        aVal = a.orders?.[0]?.count || 0;
        bVal = b.orders?.[0]?.count || 0;
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

  const getSubscriptionStatus = (r) => {
    if (!r.subscription_end_date) return { label: "Free / No Sub", style: "text-zinc-500 bg-zinc-800", urgent: false };
    const end = new Date(r.subscription_end_date);
    const now = new Date();
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0)
      return { label: `Expired ${Math.abs(daysLeft)}d ago`, style: "text-red-400 bg-red-500/10 border-red-500/20", urgent: true };
    if (daysLeft <= 3)
      return { label: `${daysLeft}d left`, style: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse", urgent: true };
    if (daysLeft <= 7)
      return { label: `${daysLeft}d left`, style: "text-amber-400 bg-amber-500/10 border-amber-500/20", urgent: true };
    if (daysLeft <= 30)
      return { label: `${daysLeft}d left`, style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", urgent: false };
    return { label: `${daysLeft}d left`, style: "text-emerald-400 bg-emerald-500/10", urgent: false };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-orange-400" />
    ) : (
      <ChevronDown size={12} className="text-orange-400" />
    );
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="px-5 py-3 border-b border-zinc-800/50">
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-xs font-medium text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              <th className="px-5 py-3 cursor-pointer hover:text-zinc-400 transition-colors" onClick={() => toggleSort("name")}>
                <span className="flex items-center gap-1">Restaurant <SortIcon field="name" /></span>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-400 transition-colors" onClick={() => toggleSort("orders")}>
                <span className="flex items-center gap-1">Orders <SortIcon field="orders" /></span>
              </th>
              <th className="px-4 py-3 hidden lg:table-cell">Members</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-400 transition-colors hidden sm:table-cell" onClick={() => toggleSort("created_at")}>
                <span className="flex items-center gap-1">Created <SortIcon field="created_at" /></span>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-400 transition-colors" onClick={() => toggleSort("subscription_end_date")}>
                <span className="flex items-center gap-1">Subscription <SortIcon field="subscription_end_date" /></span>
              </th>
              <th className="px-4 py-3">Controls</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredAndSorted.map((r) => {
              const subStatus = getSubscriptionStatus(r);
              const isActive = r.is_active !== false;
              const isVerified = r.is_verified === true;
              const orderCount = r.orders?.[0]?.count || 0;
              const memberCount = r.restaurant_members?.[0]?.count || 0;

              return (
                <tr
                  key={r.id}
                  className={`group transition-colors hover:bg-zinc-800/30 ${
                    subStatus.urgent ? "bg-zinc-900/30" : ""
                  }`}
                >
                  {/* Restaurant Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
                        {r.logo_url ? (
                          <img
                            src={r.logo_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store size={14} className="text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white truncate">
                            {r.name}
                          </span>
                          {r.is_verified && (
                            <ShieldCheck size={12} className="text-blue-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-zinc-600 truncate">
                            /{r.slug}
                          </span>
                          <a
                            href={`/services/alakeifak/${r.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink size={10} className="text-zinc-600 hover:text-orange-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Orders */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-black text-zinc-300">
                      {orderCount}
                    </span>
                  </td>

                  {/* Members */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm font-bold text-zinc-500">
                      {memberCount}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-mono text-zinc-600">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </span>
                  </td>

                  {/* Subscription */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${subStatus.style}`}
                    >
                      <Clock size={10} />
                      {subStatus.label}
                    </span>
                  </td>

                  {/* Controls (Toggles) */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-4">
                      <ToggleSwitch 
                        active={isActive} 
                        onClick={() => onUpdateField(r.id, "is_active", !isActive)} 
                        label="Active" 
                        activeColor="text-emerald-500" 
                      />
                      <ToggleSwitch 
                        active={isVerified} 
                        onClick={() => onUpdateField(r.id, "is_verified", !isVerified)} 
                        label="Verify" 
                        activeColor="text-blue-500" 
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onRecordPayment(r)}
                        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all border border-zinc-700"
                        title="Record Payment"
                      >
                        <DollarSign size={12} />
                        <span className="hidden xl:inline">Payment</span>
                      </button>
                      <button
                        onClick={() => onManageMembers(r)}
                        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all border border-zinc-700"
                        title="Manage Members"
                      >
                        <Users size={12} />
                        <span className="hidden xl:inline">Members</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Store size={32} className="text-zinc-700 mb-3" />
            <p className="text-sm font-bold text-zinc-600">
              {searchQuery
                ? "No restaurants match your search."
                : "No restaurants found."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Count */}
      <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/30">
        <span className="text-[11px] font-mono text-zinc-600">
          {filteredAndSorted.length} of {restaurants.length} restaurants
        </span>
      </div>
    </div>
  );
}
