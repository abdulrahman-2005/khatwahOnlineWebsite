"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { safeMutation } from "../../lib/safeQuery";
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
  Tag,
  Plus,
  X,
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
  const [tagsEditId, setTagsEditId] = useState(null); // which restaurant is being tag-edited
  const [tagsEditData, setTagsEditData] = useState([]); // working copy of tags (now a simple array)
  const [tagsSaving, setTagsSaving] = useState(false);
  const [newTagInput, setNewTagInput] = useState(""); // single input for new tags

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
    return { label: `${daysLeft}d left`, style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", urgent: false };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-orange-400" />
    ) : (
      <ChevronDown size={12} className="text-orange-400" />
    );
  };

  // ─── Tag Editor Helpers ───
  function openTagsEditor(restaurant) {
    setTagsEditId(restaurant.id);
    setTagsEditData(Array.isArray(restaurant.tags) ? restaurant.tags : []);
    setNewTagInput("");
  }

  function closeTagsEditor() {
    setTagsEditId(null);
    setTagsEditData([]);
    setNewTagInput("");
  }

  function addTag() {
    const val = newTagInput.trim();
    if (!val) return;
    if (tagsEditData.includes(val)) return;
    setTagsEditData([...tagsEditData, val]);
    setNewTagInput("");
  }

  function removeTag(tag) {
    setTagsEditData(tagsEditData.filter(t => t !== tag));
  }



  async function saveTags() {
    if (!tagsEditId) return;
    setTagsSaving(true);
    try {
      const { error, ok } = await safeMutation(
        () => supabase
          .from("restaurants")
          .update({ tags: tagsEditData })
          .eq("id", tagsEditId)
      );

      if (ok && !error) {
        // Optimistically update local state
        onUpdateField(tagsEditId, "tags", tagsEditData);
        closeTagsEditor();
      } else {
        alert("Failed to save tags: " + (error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An unexpected error occurred while saving tags.");
    } finally {
      setTagsSaving(false);
    }
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800/50 bg-zinc-900/50">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 sm:py-2 pl-10 pr-4 text-[14px] sm:text-[13px] font-medium text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-800/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => toggleSort("name")}>
                <span className="flex items-center gap-1">Restaurant <SortIcon field="name" /></span>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => toggleSort("orders")}>
                <span className="flex items-center gap-1">Orders <SortIcon field="orders" /></span>
              </th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => toggleSort("created_at")}>
                <span className="flex items-center gap-1">Created <SortIcon field="created_at" /></span>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => toggleSort("subscription_end_date")}>
                <span className="flex items-center gap-1">Subscription <SortIcon field="subscription_end_date" /></span>
              </th>
              <th className="px-4 py-3 text-center">Controls</th>
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
                    subStatus.urgent ? "bg-red-500/5" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shadow-sm">
                        {r.logo_url ? (
                          <img src={r.logo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Store size={16} className="text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white truncate">{r.name}</span>
                          {r.is_verified && <ShieldCheck size={14} className="text-blue-400 shrink-0" />}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${r.is_open ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                            {r.is_open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[12px] font-mono text-zinc-500 truncate">/{r.slug}</span>
                          <a href={`/services/alakeifak/${r.slug}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={12} className="text-zinc-500 hover:text-orange-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="text-sm font-black text-zinc-300">{orderCount}</span></td>
                  <td className="px-4 py-4"><span className="text-sm font-bold text-zinc-500">{memberCount}</span></td>
                  <td className="px-4 py-4">
                    <span className="text-[13px] font-mono text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${subStatus.style}`}>
                      <Clock size={12} />
                      {subStatus.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <ToggleSwitch active={isActive} onClick={() => onUpdateField(r.id, "is_active", !isActive)} label="Active" activeColor="text-emerald-500" />
                      <ToggleSwitch active={isVerified} onClick={() => onUpdateField(r.id, "is_verified", !isVerified)} label="Verify" activeColor="text-blue-500" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openTagsEditor(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all border border-zinc-700 shadow-sm" title="Manage Tags">
                        <Tag size={14} /><span>Tags</span>
                      </button>
                      <button onClick={() => onRecordPayment(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all border border-zinc-700 shadow-sm" title="Record Payment">
                        <DollarSign size={14} /><span>Payment</span>
                      </button>
                      <button onClick={() => onManageMembers(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all border border-zinc-700 shadow-sm" title="Manage Members">
                        <Users size={14} /><span>Members</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="lg:hidden flex flex-col divide-y divide-zinc-800/50">
        {filteredAndSorted.map((r) => {
          const subStatus = getSubscriptionStatus(r);
          const isActive = r.is_active !== false;
          const isVerified = r.is_verified === true;
          const orderCount = r.orders?.[0]?.count || 0;

          return (
            <div key={r.id} className="p-4 flex flex-col gap-4 hover:bg-zinc-900/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shadow-sm">
                    {r.logo_url ? <img src={r.logo_url} alt="" className="h-full w-full object-cover" /> : <Store size={18} className="text-zinc-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-black text-white">{r.name}</span>
                      {isVerified && <ShieldCheck size={14} className="text-blue-400" />}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${r.is_open ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                        {r.is_open ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[12px] font-mono text-zinc-500">/{r.slug}</span>
                      <a href={`/services/alakeifak/${r.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={12} className="text-zinc-500 hover:text-orange-400 transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
                <div>
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Orders</span>
                  <span className="text-sm font-black text-zinc-300">{orderCount}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Subscription</span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${subStatus.style}`}>
                    <Clock size={10} />
                    {subStatus.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-5">
                  <ToggleSwitch active={isActive} onClick={() => onUpdateField(r.id, "is_active", !isActive)} label="Active" activeColor="text-emerald-500" />
                  <ToggleSwitch active={isVerified} onClick={() => onUpdateField(r.id, "is_verified", !isVerified)} label="Verify" activeColor="text-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openTagsEditor(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[12px] font-bold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-sm">
                    <Tag size={14} /> Tags
                  </button>
                  <button onClick={() => onRecordPayment(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[12px] font-bold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-sm">
                    <DollarSign size={14} /> Pay
                  </button>
                  <button onClick={() => onManageMembers(r)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-[12px] font-bold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-sm">
                    <Users size={14} /> Team
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Store size={40} className="text-zinc-800 mb-4" />
          <p className="text-[15px] font-black text-zinc-500">
            {searchQuery ? "No restaurants match your search." : "No restaurants found."}
          </p>
        </div>
      )}

      {/* Footer Count */}
      <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-900/30">
        <span className="text-[12px] font-mono font-medium text-zinc-500">
          {filteredAndSorted.length} of {restaurants.length} restaurants
        </span>
      </div>

      {/* ═══ TAGS EDITOR MODAL ═══ */}
      {tagsEditId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeTagsEditor}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-purple-400" />
                <h3 className="text-[15px] font-black text-white">
                  Manage Tags — {restaurants.find(r => r.id === tagsEditId)?.name}
                </h3>
              </div>
              <button onClick={closeTagsEditor} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-black text-purple-400 uppercase tracking-wider">Restaurant Tags</span>
                  <span className="text-[11px] font-bold text-zinc-500">{tagsEditData.length} tags total</span>
                </div>

                {/* Existing tags */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {tagsEditData.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-[13px] font-bold text-zinc-300">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {tagsEditData.length === 0 && (
                    <div className="w-full text-center py-6">
                      <Tag size={24} className="text-zinc-700 mx-auto mb-2" />
                      <p className="text-[12px] font-bold text-zinc-600">No tags assigned yet.</p>
                    </div>
                  )}
                </div>

                {/* Add tag input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addTag(); }}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-[14px] font-medium text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-purple-500 transition-colors shadow-inner"
                  />
                  <button onClick={addTag} className="flex items-center gap-2 rounded-lg bg-purple-500/20 border border-purple-500/30 px-4 py-2.5 text-[13px] font-black text-purple-400 hover:bg-purple-500/30 transition-colors">
                    <Plus size={16} /> Add
                  </button>
                </div>
                <p className="mt-3 text-[11px] font-bold text-zinc-500 px-1">
                  💡 These tags power the public search engine. (e.g. burger, pizza, delivery)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
              <button onClick={closeTagsEditor} className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-[13px] font-bold text-zinc-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={saveTags} disabled={tagsSaving} className="rounded-lg bg-purple-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 shadow-lg shadow-purple-600/20">
                {tagsSaving ? "Saving..." : "Save Tags"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
