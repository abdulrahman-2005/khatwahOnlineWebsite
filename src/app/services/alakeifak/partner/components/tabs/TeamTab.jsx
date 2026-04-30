"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
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
  Copy,
  Info,
} from "lucide-react";

/**
 * TeamTab — Team access management for restaurant owners/admins.
 * Partners can invite new team members by email and remove existing ones.
 */
export default function TeamTab({ restaurantId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserEmail(data?.user?.email?.toLowerCase() || "");
    });
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurant_members")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true });

    if (!error) setMembers(data || []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleInvite(e) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === email)) {
      setError("هذا البريد الإلكتروني مضاف بالفعل.");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("restaurant_members")
        .insert({
          restaurant_id: restaurantId,
          email: email,
          role: "admin",
        });

      if (insertError) throw insertError;

      setNewEmail("");
      setSuccessMsg(`تمت إضافة ${email} بنجاح!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchMembers();
    } catch (err) {
      console.error("Invite failed:", err);
      setError(err.message || "فشلت عملية الدعوة.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(memberId, memberEmail) {
    if (memberEmail.toLowerCase() === currentUserEmail) {
      setError("لا يمكنك حذف نفسك من الفريق.");
      return;
    }

    if (!confirm(`هل أنت متأكد من إزالة ${memberEmail}؟`)) return;

    setRemoving(memberId);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("restaurant_members")
        .delete()
        .eq("id", memberId);

      if (deleteError) throw deleteError;

      setSuccessMsg(`تم إزالة ${memberEmail}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchMembers();
    } catch (err) {
      console.error("Remove failed:", err);
      setError(err.message || "فشلت عملية الإزالة.");
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[var(--dynamic-color)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="rounded-[40px] bg-white p-8 border border-gray-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
              <Users size={22} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-[22px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                إدارة الفريق
              </h3>
              <p className="text-[14px] text-gray-500 font-medium">
                أضف أعضاء فريقك ليتمكنوا من إدارة المطعم معك.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4 flex gap-3 mb-6">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
            أدخل البريد الإلكتروني (حساب Google) للشخص الذي تريد منحه صلاحية الوصول. 
            سيتمكن من الدخول مباشرة عند تسجيل الدخول بنفس البريد الإلكتروني.
          </p>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="relative flex-1">
            <Mail
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError("");
              }}
              placeholder="البريد الإلكتروني للعضو الجديد..."
              dir="ltr"
              style={{ textAlign: "right" }}
              className="w-full rounded-[20px] border border-gray-200 bg-white py-4 pl-5 pr-12 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-[var(--dynamic-color)] focus:ring-4 focus:ring-[var(--dynamic-color)]/10 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="flex items-center gap-2 rounded-[20px] bg-[var(--dynamic-color)] px-6 py-4 text-[15px] font-black text-white shadow-[0_10px_20px_-5px_var(--dynamic-color)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            <span className="hidden sm:inline">دعوة</span>
          </button>
        </form>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 p-4 mt-4">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-[14px] font-bold text-red-600">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mt-4 animate-in fade-in duration-300">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <p className="text-[14px] font-bold text-emerald-600">{successMsg}</p>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="rounded-[40px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100">
          <h4 className="text-[16px] font-black text-gray-900">
            أعضاء الفريق ({members.length})
          </h4>
        </div>

        <div className="divide-y divide-gray-50">
          {members.map((member) => {
            const isCurrentUser =
              member.email.toLowerCase() === currentUserEmail;
            const isOwner = member.role === "owner";

            return (
              <div
                key={member.id}
                className={`flex items-center justify-between gap-4 px-8 py-4 group transition-colors ${
                  isCurrentUser ? "bg-orange-50/30" : "hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Role Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${
                      isOwner
                        ? "bg-orange-50 border-orange-200 text-orange-500"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    {isOwner ? <Crown size={18} /> : <Shield size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-black text-gray-900 truncate">
                        {member.email}
                      </span>
                      {isCurrentUser && (
                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-600">
                          أنت
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className={`text-[12px] font-bold ${
                          isOwner ? "text-orange-500" : "text-gray-400"
                        }`}
                      >
                        {isOwner ? "مالك المطعم" : "مشرف"}
                      </span>
                      <span className="text-[11px] text-gray-300">•</span>
                      {member.user_id ? (
                        <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-500">
                          <UserCircle size={12} />
                          مربوط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[12px] font-bold text-gray-400">
                          <Mail size={12} />
                          في انتظار التسجيل
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button — hidden for current user and owners */}
                {!isCurrentUser && !isOwner && (
                  <button
                    onClick={() => handleRemove(member.id, member.email)}
                    disabled={removing === member.id}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200 hover:border-red-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="إزالة العضو"
                  >
                    {removing === member.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Users size={40} className="text-gray-200 mb-4" />
            <p className="text-[16px] font-black text-gray-400">
              لا يوجد أعضاء حالياً
            </p>
            <p className="text-[14px] font-bold text-gray-300 mt-1">
              استخدم النموذج أعلاه لدعوة أول عضو في فريقك.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
