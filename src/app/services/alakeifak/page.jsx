"use client";

import { useState, useEffect, useMemo } from "react";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";
import {
  Search,
  UtensilsCrossed,
  MessageCircle,
  ArrowUpRight,
  Zap,
  Store,
  Pizza,
  CheckCircle2,
  Plus,
  Smartphone,
  TrendingUp,
  X
} from "lucide-react";

// ─── Arabic-aware fuzzy normalizer ───
function normalizeArabic(str) {
  return str
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "") // strip diacritics
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyScore(haystack, needle) {
  const h = normalizeArabic(haystack);
  const n = normalizeArabic(needle);
  if (!n) return 1;
  if (h === n) return 100;           // exact match
  if (h.startsWith(n)) return 80;    // starts with
  if (h.includes(n)) return 60;      // contains full query
  // token match: each query word found anywhere
  const tokens = n.split(" ").filter(Boolean);
  const matched = tokens.filter(t => h.includes(t));
  if (matched.length === tokens.length) return 50;
  if (matched.length > 0) return 30 * (matched.length / tokens.length);
  // single-char tolerance (1-edit)
  if (n.length >= 3) {
    for (let i = 0; i < n.length; i++) {
      const partial = n.slice(0, i) + n.slice(i + 1);
      if (h.includes(partial)) return 15;
    }
  }
  return 0;
}

export default function AlakeifakPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchRestaurants(); }, []);

  async function fetchRestaurants() {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_verified", true)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let results = restaurants;

    const q = searchQuery.trim();
    if (!q) return results;

    return results
      .map(r => {
        const tags = r.tags || [];
        const nameScore = fuzzyScore(r.name, q);
        const slugScore = fuzzyScore(r.slug, q);
        const tagScore = Math.max(0, ...tags.map(t => fuzzyScore(t, q)));
        const best = Math.max(nameScore, slugScore, tagScore);
        return { ...r, _score: best };
      })
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [restaurants, searchQuery]);

  return (
    <main className="font-sans overflow-hidden bg-[#050D1A] text-white selection:bg-orange-500/30" dir="rtl">
      {/* ═══════════════════ ULTRA ENERGETIC NEON HERO ═══════════════════ */}
      <section className="relative px-4 pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-white/5">
        {/* Neon Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl z-10 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2 border border-white/10 shadow-[0_0_20px_rgba(255,90,0,0.15)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_0_10px_rgba(255,90,0,0.5)]">
              <Zap size={14} fill="currentColor" />
            </span>
            <span className="text-[14px] font-black tracking-wide text-orange-50">
              أسرع منيو ديجيتال في العريش 🚀
            </span>
          </div>

          <h1 className="text-[48px] sm:text-[72px] font-black leading-[1.05] tracking-tight mb-6">
            اطلب على <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 via-orange-500 to-yellow-500 drop-shadow-[0_0_30px_rgba(255,90,0,0.3)]">كيفك 🍕</span>
          </h1>
          <p className="mx-auto text-[18px] sm:text-[22px] font-bold text-gray-400 max-w-2xl mb-12 leading-relaxed">
            تصفح المنيو، فصّل طلبك براحتك، واطلب مباشرة عبر الواتساب في ثواني!
          </p>

          {/* ─── MASSIVE SEARCH BAR ─── */}
          <div className="no-print max-w-3xl mx-auto mb-10 relative group">
            <div className="absolute -inset-1 rounded-[40px] bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-orange-500/20 blur-xl transition duration-500 opacity-0 group-focus-within:opacity-100" />
            <div className="relative flex items-center bg-[#0F172A]/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-2 transition-transform duration-300 group-focus-within:-translate-y-1 group-focus-within:shadow-[0_30px_70px_rgba(255,90,0,0.15)] border-2 border-white/10 group-focus-within:border-orange-500/50">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-[24px] bg-orange-500/20 text-orange-400 mx-1">
                <Search size={26} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="ايه المطعم اللي على بالك؟ 🍔🍟"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                className="w-full bg-transparent border-none outline-none text-[18px] sm:text-[22px] font-black text-white placeholder:text-gray-500 px-4"
              />
              {(searchQuery) && (
                <button onClick={() => { setSearchQuery(""); }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors mx-2">
                  <X size={24} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════ RESTAURANTS GRID ═══════════════════ */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8 min-h-[50vh] relative">
        <div className="absolute inset-0 bg-[#0A0F1A] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">

          {/* ─── RESULTS HEADER ─── */}
          {!loading && (
            <div className="flex items-center justify-between mb-8 sm:mb-12 px-2 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[24px] sm:text-[32px] font-black text-white tracking-tight">
                  {searchQuery ? "نتائج البحث 🎯" : "كل المطاعم المتاحة 🔥"}
                </h2>
                <div className="h-8 w-1 bg-white/10 hidden sm:block rounded-full" />
                <p className="text-[16px] sm:text-[18px] font-bold text-gray-400 mt-1 hidden sm:block">
                  <span className="text-white">{filtered.length}</span> مكان
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-8 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-8 border-orange-500 border-t-transparent animate-spin" />
                  <Pizza size={36} className="text-orange-500 animate-bounce drop-shadow-[0_0_15px_rgba(255,90,0,0.5)]" />
                </div>
                <p className="text-[20px] font-black text-gray-400 animate-pulse">بنجهزلك المطاعم...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="rounded-[40px] border border-white/10 bg-[#0F172A] p-12 sm:p-20 text-center max-w-2xl mx-auto my-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500 opacity-50" />
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/5 text-gray-500 border-4 border-white/5">
                <Search size={56} strokeWidth={3} />
              </div>
              <h3 className="mb-4 text-[28px] sm:text-[36px] font-black text-white tracking-tight">
                {searchQuery ? "مفيش حاجة بالاسم ده!" : "لسه بنسخن الطاسة! 🍳"}
              </h3>
              <p className="mx-auto mb-10 max-w-md text-[18px] font-bold text-gray-400 leading-relaxed">
                {searchQuery
                  ? "جرب تبحث بكلمة تانية عشان تلاقي اللي بتدور عليه."
                  : "المطاعم لسه بتجهز المنيوهات بتاعتها."}
              </p>
              {(searchQuery) && (
                <button onClick={() => { setSearchQuery(""); }} className="rounded-full bg-orange-500 px-10 py-4 text-[18px] font-black text-white hover:bg-orange-400 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,90,0,0.3)]">
                  عرض كل المطاعم
                </button>
              )}
            </div>
          )}

          {/* Grid - 2 cols on mobile, 3 on sm, 4 on lg */}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-4 sm:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((r, i) => (
                <Reveal key={r.id} direction="up" distance={30} delay={(i % 10) * 40}>
                  <RestaurantCard restaurant={r} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS — NEON BENTO ═══════════════════ */}
      <section className="px-4 py-20 sm:py-28 relative overflow-hidden border-t border-white/5 bg-[#050D1A]">
        <div className="mx-auto max-w-6xl relative z-10">
          <Reveal direction="up" distance={30}>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block px-5 py-2 rounded-full bg-orange-500/10 text-orange-400 text-[14px] font-black tracking-widest mb-4 border border-orange-500/20 shadow-[0_0_15px_rgba(255,90,0,0.1)]">خطوات بسيطة</div>
              <h2 className="text-[36px] sm:text-[56px] font-black text-white mb-4 leading-tight">أسهل طريقة تطلب بيها 🚀</h2>
              <p className="text-[18px] sm:text-[22px] font-bold text-gray-400 max-w-2xl mx-auto">صممنا التجربة عشان تكون سريعة، ممتعة، ومريحة.</p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 auto-rows-[minmax(280px,auto)]">

               {/* Box 1: Discover */}
               <div className="md:col-span-2 group p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 transition-all duration-500 overflow-hidden relative hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-[0_20px_60px_-15px_rgba(255,90,0,0.2)]">
                 <div className="absolute -right-10 -top-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
                 <div className="relative z-10 h-full flex flex-col justify-center">
                   <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[24px] bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(255,90,0,0.2)] group-hover:scale-110 transition-transform">
                     <Search size={32} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-[28px] sm:text-[36px] font-black text-white mb-4">1. اختار مطعمك</h3>
                   <p className="text-[17px] sm:text-[20px] leading-relaxed font-bold text-gray-400 max-w-md">تصفح المنيوهات الرقمية بالصور الواضحة والأسعار الحقيقية، واكتشف أماكن جديدة حواليك.</p>
                 </div>
               </div>

               {/* Box 2: Customize */}
               <div className="md:col-span-1 group p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 transition-all duration-500 relative overflow-hidden hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)]">
                 <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                 <div className="relative z-10 h-full flex flex-col justify-center">
                   <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[24px] bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
                     <Plus size={32} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-[26px] sm:text-[32px] font-black text-white mb-4">2. فصّل طلبك</h3>
                   <p className="text-[16px] sm:text-[19px] leading-relaxed font-bold text-gray-400">عايز إضافات؟ شيل وحط براحتك واظبط الوجبة على كيفك.</p>
                 </div>
               </div>

               {/* Box 3: WhatsApp */}
               <div className="md:col-span-3 group p-8 sm:p-16 rounded-[40px] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 transition-all duration-500 flex flex-col md:flex-row items-center gap-10 sm:gap-12 overflow-hidden relative hover:-translate-y-2 hover:border-emerald-400/40 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]">
                 <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
                 <div className="flex-1 relative z-10">
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[15px] font-black mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                     <Smartphone size={16} />
                     بدون تسجيل دخول
                   </div>
                   <h3 className="text-[32px] sm:text-[44px] font-black text-white mb-4 sm:mb-6 leading-tight">3. اطلب مباشرة على الواتساب</h3>
                   <p className="text-[18px] sm:text-[22px] leading-relaxed font-bold text-gray-300 max-w-2xl">
                     الطلب بيتم تجميعه بشكل منظم جداً وبيتبعت في رسالة جاهزة مباشرة لواتساب المطعم عشان يوفر وقتك.
                   </p>
                 </div>
                 <div className="shrink-0 relative z-10 flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-[32px] bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
                   <MessageCircle size={72} className="text-emerald-400" strokeWidth={2} />
                   <div className="absolute -top-3 -right-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_0_20px_rgba(255,90,0,0.5)] animate-bounce">
                     <CheckCircle2 size={24} strokeWidth={4} />
                   </div>
                 </div>
               </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ ULTIMATE PARTNER CTA WITH ANIMATIONS ═══════════════════ */}
      <section className="px-4 pb-20 sm:pb-32 pt-10 sm:pt-16 sm:px-6 lg:px-8 bg-transparent">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" distance={30}>
            <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0F172A] to-black p-10 sm:p-20 shadow-2xl border border-white/10 ring-1 ring-white/5">

              {/* Background ambient lighting */}
              <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-orange-600/20 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />

              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">

                {/* ─── TEXT CONTENT (LEFT SIDE) ─── */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5 mb-8 border border-white/10">
                    <Store size={18} className="text-orange-400" />
                    <span className="text-[15px] font-black text-orange-50 tracking-wide">لأصحاب المطاعم وصناع الأكل</span>
                  </div>

                  <h2 className="mb-6 text-[36px] sm:text-[52px] font-black text-white leading-[1.1] tracking-tight">
                    حوّل مطعمك لديجيتال <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-yellow-400">وكبر مبيعاتك بسرعة!</span>
                  </h2>

                  <p className="mb-10 text-[18px] sm:text-[20px] font-bold leading-relaxed text-gray-400 max-w-lg">
                    صممنا لوحة تحكم عصرية وسهلة جداً. ضيف أصنافك، صورك، الإضافات، وحدد مناطق التوصيل، واستقبل الطلبات في رسالة واتساب أنيقة ومفصلة.
                  </p>

                  <ul className="mb-12 space-y-6">
                    {[
                      { icon: CheckCircle2, text: "منيو رقمي بتصميم جذاب وخاص بمطعمك." },
                      { icon: CheckCircle2, text: "QR Code جاهز للطباعة على طاولاتك." },
                      { icon: CheckCircle2, text: "تحكم كامل في إتاحة الأصناف ونفاد الكمية." },
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-4 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors border border-orange-500/30">
                          <f.icon size={18} strokeWidth={3} />
                        </div>
                        <span className="text-[18px] font-bold text-gray-200">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/services/alakeifak/partner" className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-[24px] bg-orange-500 px-10 py-5 text-[18px] font-black text-white transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-2">
                      <span>انضم كشريك الآن</span>
                      <ArrowUpRight size={24} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* ─── FLOATING ANIMATED INFOGRAPHIC (RIGHT SIDE) ─── */}
                <div className="hidden lg:block relative perspective-1000 h-[520px] w-full group cursor-default">
                  
                  {/* 1. Mobile Menu Mockup (Center/Right) */}
                  <div className="absolute right-4 top-8 w-[260px] h-[440px] rounded-[40px] bg-[#0A0F1A] border-[6px] border-[#1E293B] shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden rotate-[-4deg] group-hover:rotate-[-2deg] group-hover:-translate-y-4 transition-all duration-700 z-10 ring-1 ring-white/5">
                    <div className="h-16 bg-[#131B2B] flex items-center justify-between px-6 border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center"><Store size={18} className="text-orange-400" /></div>
                      <div className="w-20 h-2.5 rounded-full bg-gray-700" />
                    </div>
                    <div className="h-32 bg-gradient-to-br from-orange-500/20 to-orange-600/10 m-4 rounded-[24px] flex flex-col items-center justify-center border border-orange-500/20">
                      <Pizza size={44} className="text-orange-400 mb-3 drop-shadow-[0_0_15px_rgba(255,90,0,0.4)]" />
                      <div className="w-24 h-3 rounded-full bg-white/20" />
                    </div>
                    <div className="px-5 mt-6 space-y-5">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 shrink-0" />
                          <div className="flex-1 space-y-2.5">
                            <div className="w-full h-2.5 rounded-full bg-white/10" />
                            <div className="w-2/3 h-2.5 rounded-full bg-white/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,90,0,0.4)]">
                      <div className="w-20 h-2.5 rounded-full bg-white/50" />
                    </div>
                  </div>

                  {/* 2. WhatsApp Notification Card (Floating Top Left) */}
                  <div className="absolute left-0 top-16 w-[280px] rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rotate-[5deg] group-hover:rotate-[8deg] group-hover:-translate-y-5 group-hover:-translate-x-2 transition-all duration-700 delay-100 z-20">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <MessageCircle size={28} className="text-white" fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[16px] font-black text-white">طلب جديد وصل!</span>
                          <span className="text-[12px] font-bold text-gray-400">الآن</span>
                        </div>
                        <p className="text-[14px] font-medium text-gray-300 leading-snug">
                          تم استلام طلب بقيمة <span className="text-emerald-400 font-bold">450 ج.م</span> عبر الواتساب.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Sales Dashboard Widget (Floating Bottom Left) */}
                  <div className="absolute left-6 bottom-12 w-[240px] rounded-[24px] bg-[#0A0F1A]/95 backdrop-blur-md border border-white/10 p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rotate-[-4deg] group-hover:rotate-[-6deg] group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-700 delay-200 z-20">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[14px] font-black text-gray-400 uppercase tracking-wider">مبيعات اليوم</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        <TrendingUp size={20} strokeWidth={3} />
                      </div>
                    </div>
                    <div className="text-[32px] font-black text-white mb-4 tracking-tight">
                      +2,450 <span className="text-[16px] text-gray-500 font-bold">ج.م</span>
                    </div>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-2 h-12">
                      <div className="w-full bg-white/10 rounded-t-sm h-[40%]" />
                      <div className="w-full bg-white/10 rounded-t-sm h-[60%]" />
                      <div className="w-full bg-white/10 rounded-t-sm h-[30%]" />
                      <div className="w-full bg-white/10 rounded-t-sm h-[80%]" />
                      <div className="w-full bg-orange-500 rounded-t-md h-[100%] shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-emerald-400 animate-pulse z-0 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-orange-400 animate-pulse delay-300 z-0 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />

                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
function RestaurantCard({ restaurant }) {
  const accent = restaurant.theme_color || "#FF5A00";
  const isOpen = restaurant.is_open;

  return (
    <Link href={`/services/alakeifak/${restaurant.slug}`} className="group block h-full outline-none">
      <article className="flex h-full flex-col overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#131B2B] border border-white/5 shadow-sm transition-all duration-300 hover:shadow-[0_20px_50px_-15px_rgba(255,90,0,0.2)] hover:-translate-y-2 hover:border-orange-500/40 relative group-hover:z-20">

        {/* ════ TOP HALF: THE BANNER ════ */}
        <div className="relative h-[120px] sm:h-[180px] w-full bg-gray-900 overflow-hidden shrink-0">
          {restaurant.banner_url ? (
            <img src={restaurant.banner_url} alt="" className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" />
          ) : (
            <div className="absolute inset-0 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${accent}44 0%, ${accent}11 100%)` }}>
              <div className="absolute inset-0 opacity-40 bg-[#0A0F1A]" />
            </div>
          )}

          {/* Floating Top Badges */}
          <div className="absolute top-4 inset-x-4 sm:top-5 sm:inset-x-5 flex justify-between items-start z-10">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-[13px] font-black shadow-md backdrop-blur-md border border-white/10 ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/50 text-white'}`}>
              <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-500'}`} />
              {isOpen ? "متاح للطلب" : "مغلق حالياً"}
            </span>
          </div>
        </div>

        {/* ════ BOTTOM HALF: SAFE TEXT ZONE ════ */}
        <div className="relative flex flex-1 flex-col px-4 sm:px-6 pb-5 sm:pb-7 pt-10 sm:pt-14">

          {/* Overlapping Logo */}
          <div className="absolute -top-8 sm:-top-12 right-4 sm:right-6 h-[64px] w-[64px] sm:h-[88px] sm:w-[88px] rounded-[20px] sm:rounded-[28px] bg-[#0F172A] p-.5 sm:p-1 shadow-xl border border-white/10 z-20 transition-transform duration-500 group-hover:-translate-y-2">
            <div className="h-full w-full rounded-[14px] sm:rounded-[20px] overflow-hidden bg-white/5 flex items-center justify-center">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
              ) : (
                <Store size={28} className="sm:w-10 sm:h-10" style={{ color: accent }} />
              )}
            </div>
          </div>

          <div className="mb-5 sm:mb-6 flex-1 mt-1 sm:mt-2">
            <h3 className="text-[18px] sm:text-[24px] font-black text-white leading-[1.25] tracking-tight group-hover:text-orange-400 transition-colors break-words line-clamp-2">
              {restaurant.name}
            </h3>

           
          </div>

          {/* ════ FOOTER ACTION BAR ════ */}
          <div className="mt-auto pt-4 sm:pt-5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 group/btn">
              <span className="text-[13px] sm:text-[16px] font-black text-gray-400 transition-colors group-hover:text-orange-400">
                عرض المنيو
              </span>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[14px] bg-white/5 text-gray-400 transition-all group-hover:bg-orange-500 group-hover:text-white shadow-sm border border-white/5 group-hover:border-orange-400">
                <ArrowUpRight size={16} className="sm:w-5 sm:h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}