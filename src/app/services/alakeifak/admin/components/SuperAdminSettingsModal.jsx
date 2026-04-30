"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, Shield, Plus, Trash2, Loader2, Save } from "lucide-react";

export default function SuperAdminSettingsModal({ onClose }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  async function fetchEmails() {
    setLoading(true);
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "super_admin_emails")
      .single();

    if (error && error.code !== "PGRST116") {
      setError(error.message);
    } else if (data && data.value) {
      setEmails(data.value.split(",").map((e) => e.trim()).filter(Boolean));
    }
    setLoading(false);
  }

  async function saveEmails(updatedEmails) {
    setSaving(true);
    setError(null);
    const value = updatedEmails.join(",");

    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "super_admin_emails", value });

    if (error) {
      setError(error.message);
    } else {
      setEmails(updatedEmails);
    }
    setSaving(false);
  }

  function handleAdd() {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    const updated = [...emails, newEmail.trim().toLowerCase()];
    setNewEmail("");
    saveEmails(updated);
  }

  function handleRemove(emailToRemove) {
    if (emails.length === 1) {
      setError("You cannot remove the last super admin.");
      return;
    }
    const updated = emails.filter((e) => e !== emailToRemove);
    saveEmails(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Shield size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Super Admins</h2>
              <p className="text-xs font-bold text-zinc-500">
                Manage who has access to this dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-900/50 bg-red-500/10 p-3 text-sm font-bold text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 space-y-3">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider">
              Current Admins
            </h3>
            {loading ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 size={24} className="animate-spin text-zinc-600" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                  >
                    <span className="text-sm font-bold text-zinc-300">{email}</span>
                    <button
                      onClick={() => handleRemove(email)}
                      disabled={saving}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-5 space-y-3">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider">
              Add New Admin
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="admin@khatwah.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-orange-500 transition-colors"
              />
              <button
                onClick={handleAdd}
                disabled={saving || !newEmail}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
