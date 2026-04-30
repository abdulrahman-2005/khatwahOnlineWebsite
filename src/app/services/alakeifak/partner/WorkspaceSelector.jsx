"use client";

import {
  Store,
  ShieldCheck,
  ShieldOff,
  ArrowUpRight,
  Crown,
  Shield,
} from "lucide-react";

/**
 * WorkspaceSelector — Displayed when a user belongs to multiple restaurants.
 * Shows a grid of restaurant cards; clicking one sets it as the active workspace.
 */
export default function WorkspaceSelector({ memberships, onSelect, onCreateNew }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2.5 border border-orange-200/50 mb-6">
          <Store size={16} className="text-orange-500" />
          <span className="text-[13px] font-black text-orange-700">اختر مساحة العمل</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
          مرحباً بك يا شريك 👋
        </h1>
        <p className="text-gray-500 font-bold text-lg max-w-lg mx-auto">
          لديك صلاحية الوصول لأكثر من مطعم. اختر المطعم الذي تريد إدارته الآن.
        </p>
      </div>

      {/* Restaurant Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => {
          const r = membership.restaurant;
          if (!r) return null;

          const isActive = r.is_active !== false;
          const accent = r.theme_color || "#f97316";

          return (
            <button
              key={membership.id}
              onClick={() => onSelect(r)}
              disabled={!isActive}
              className={`group relative flex flex-col overflow-hidden rounded-[32px] border-2 bg-white text-right transition-all duration-500 ${
                isActive
                  ? "border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-orange-200 cursor-pointer"
                  : "border-gray-100 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Banner / Color Strip */}
              <div
                className="h-24 w-full relative overflow-hidden"
                style={{
                  background: r.banner_url
                    ? undefined
                    : `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
                }}
              >
                {r.banner_url && (
                  <img
                    src={r.banner_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black backdrop-blur-md border ${
                      isActive
                        ? "bg-white/90 text-emerald-600 border-white"
                        : "bg-gray-900/80 text-gray-300 border-gray-700"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        نشط
                      </>
                    ) : (
                      <>
                        <ShieldOff size={10} />
                        معلّق
                      </>
                    )}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black backdrop-blur-md border ${
                      membership.role === "owner"
                        ? "bg-orange-500/90 text-white border-orange-400"
                        : "bg-white/90 text-gray-600 border-gray-200"
                    }`}
                  >
                    {membership.role === "owner" ? (
                      <>
                        <Crown size={10} />
                        مالك
                      </>
                    ) : (
                      <>
                        <Shield size={10} />
                        مشرف
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex flex-1 flex-col p-5 pt-10">
                {/* Overlapping Logo */}
                <div className="absolute -top-8 right-5 h-16 w-16 rounded-[20px] bg-white p-1.5 shadow-lg border border-gray-100">
                  <div className="h-full w-full rounded-[14px] overflow-hidden bg-gray-50 flex items-center justify-center">
                    {r.logo_url ? (
                      <img
                        src={r.logo_url}
                        alt={r.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store size={24} style={{ color: accent }} />
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xl font-black text-gray-900 leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                  {r.name}
                </h3>
                <p className="text-[12px] font-mono text-gray-400 mb-4">
                  /{r.slug}
                </p>

                {/* Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
                  <span className="text-sm font-black text-gray-500 group-hover:text-orange-500 transition-colors">
                    {isActive ? "فتح لوحة التحكم" : "الحساب معلّق"}
                  </span>
                  {isActive && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all">
                      <ArrowUpRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {/* Add New Workspace Card */}
        <button
          onClick={onCreateNew}
          className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 text-center transition-all duration-500 hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-xl hover:-translate-y-2 min-h-[280px]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl text-gray-300 group-hover:text-orange-500">+</span>
          </div>
          <h3 className="text-lg font-black text-gray-500 group-hover:text-orange-600 transition-colors">
            إضافة مطعم جديد
          </h3>
          <p className="text-[12px] font-bold text-gray-400 mt-2 max-w-[200px]">
            قم بإنشاء مساحة عمل جديدة وإدارة فرع أو مطعم آخر بسهولة.
          </p>
        </button>
      </div>
    </div>
  );
}
