"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { safeQuery, safeMutation } from "../../lib/safeQuery";
import {
  X,
  Users,
  Plus,
  Trash2,
  Crown,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  UserCircle,
} from "lucide-react";

/**
 * MembersModal — God-mode access management for a restaurant.
 * 
 * Super admins can:
 *   - View all members of any restaurant
 *   - Add new members by email (invite-first model)
 *   - Remove existing members
 *   - Transfer ownership by adding a new owner + removing the old one
 */
export default function MembersModal({ restaurant, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await safeQuery(() =>
      supabase
        .from("restaurant_members")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true })
    );

    if (!error) setMembers(data || []);
    setLoading(false);
  }, [restaurant.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const ownerCount = members.filter((m) => m.role === "owner").length;

  async function handleAddMember(e) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === email)) {
      setError("This email is already a member. You can change their role above.");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("restaurant_members")
        .insert({
          restaurant_id: restaurant.id,
          email: email,
          role: newRole,
        });

      if (insertError) throw insertError;

      setNewEmail("");
      setSuccessMsg(`${email} added as ${newRole}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchMembers();
    } catch (err) {
      console.error("Add member failed:", err);
      setError(err.message || "Failed to add member.");
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateRole(memberId, currentRole, newRole) {
    if (currentRole === newRole) return;
    
    if (currentRole === "owner" && newRole !== "owner" && ownerCount <= 1) {
      setError("Cannot demote the last owner. Add a new owner first.");
      return;
    }

    setUpdating(memberId);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("restaurant_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (updateError) throw updateError;
      
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
      setSuccessMsg(`Role updated to ${newRole}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Update role failed:", err);
      setError(err.message || "Failed to update role.");
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemoveMember(member) {
    if (member.role === "owner" && ownerCount <= 1) {
      setError("Cannot remove the last owner. Add a new owner first.");
      return;
    }

    if (!confirm(`Remove ${member.email} from ${restaurant.name}?`)) return;

    setRemoving(member.id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("restaurant_members")
        .delete()
        .eq("id", member.id);

      if (deleteError) throw deleteError;

      setSuccessMsg(`${member.email} removed.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      console.error("Remove member failed:", err);
      setError(err.message || "Failed to remove member.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Users size={14} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Access Management</h3>
              <p className="text-[11px] font-mono text-zinc-600">
                {restaurant.name} — {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700">
            <X size={14} />
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-zinc-600" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={28} className="text-zinc-700 mb-3" />
              <p className="text-xs font-bold text-zinc-600">No members found for this restaurant.</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-3 group hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${member.role === "owner" ? "bg-orange-500/10 border-orange-500/20" : "bg-zinc-800 border-zinc-700"}`}>
                    {member.role === "owner" ? <Crown size={14} className="text-orange-400" /> : <Shield size={14} className="text-zinc-500" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-zinc-300 block truncate mb-0.5">
                      {member.email}
                    </span>
                    <div className="flex items-center gap-2">
                      {member.user_id ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <UserCircle size={10} /> Linked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Mail size={10} /> Pending invite
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    disabled={updating === member.id}
                    onChange={(e) => handleUpdateRole(member.id, member.role, e.target.value)}
                    className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer transition-colors ${
                      member.role === "owner"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                    }`}
                  >
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>

                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={removing === member.id}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all border border-zinc-700 disabled:opacity-50"
                    title="Remove member"
                  >
                    {removing === member.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Member Form */}
        <div className="border-t border-zinc-800 px-6 py-4 shrink-0 bg-zinc-900/50">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 mb-3">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-[11px] font-bold text-red-400">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 mb-3">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <p className="text-[11px] font-bold text-emerald-400">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setError(""); }}
              placeholder="email@example.com"
              className="flex-1 min-w-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-blue-500/50 transition-colors"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2 text-xs font-bold text-zinc-400 outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-blue-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
