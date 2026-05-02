"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal"; // Assuming you have this
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
  Coffee,
  IceCream,
  CheckCircle2,
  Plus,
  Smartphone,
  Star,
  TrendingUp
} from "lucide-react";
import { seoConfig } from "@/lib/seo";

export default function AlakeifakPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("restaurants").select("*").eq("is_verified", true).order("name");
      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-orange-500/30 font-sans" dir="rtl">
      {/* ═══════════════════ RESTRUCTURED HERO ═══════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 px-4">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 right-1/4 h-[600px] w-[600px] rounded-full bg-orange-400/10 blur-[120px] mix-blend-multiply" />
          <div className="absolute top-40 -left-20 h-[500px] w-[500px] rounded-full bg-yellow-300/10 blur-[100px] mix-blend-multiply" />
          <div className="absolute -bottom-40 left-1/2 h-[600px] w-[600px] rounded-full bg-red-400/5 blur-[120px] mix-blend-multiply" />
          <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-4xl z-10">
          <Reveal direction="up" distance={40}>
            <div className="text-center flex flex-col items-center">
              
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-orange-50 px-5 py-2.5 border border-orange-200/50 shadow-sm animate-bounce-slow">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                  <Zap size={14} fill="currentColor" />
                </span>
                <span className="text-[13px] font-black text-orange-700 tracking-wide">
                  أسرع وأذكى منيو ديجيتال في العريش
                </span>
              </div>

              <h1 className="mb-6 text-[44px] font-black leading-[1.1] tracking-tight sm:text-[64px] lg:text-[72px] text-gray-900 drop-shadow-sm">
                اطلب على <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-600 via-orange-500 to-yellow-500">كيفك 🍕</span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-[17px] sm:text-[20px] font-medium leading-relaxed text-gray-500">
                منصة <strong className="text-gray-800 font-black">على كيفك</strong> بتوفرلك أسهل تجربة طلب من مطاعم وكافيهات العريش. تصفح المنيو، ضيف إضافاتك، واطلب في ثواني.
              </p>

              {/* ─── NEW: PROMINENT SEARCH BAR IN HERO ─── */}
              <div className="no-print w-full max-w-2xl mb-8 group relative">
                 <div className="absolute -inset-1 rounded-[32px] bg-orange-500 opacity-20 blur-md transition duration-500 group-focus-within:opacity-40" />
                 <div className="relative flex items-center bg-white rounded-[28px] border-2 border-gray-100 shadow-xl p-2.5 transition-all group-focus-within:border-orange-300">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg mx-1">
                       <Search size={24} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      placeholder="نفسك في إيه النهاردة؟ ابحث عن مطعم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-[18px] sm:text-[20px] font-bold text-gray-900 placeholder:text-gray-300 px-5"
                    />
                 </div>
              </div>

              {/* ─── ACTION BUTTONS (Partner added here) ─── */}
              <div className="no-print flex flex-wrap justify-center items-center gap-4">
                <a href="#restaurants-grid" className="flex h-14 items-center justify-center rounded-[20px] bg-gray-900 px-8 text-[16px] font-black text-white hover:bg-black transition-all hover:-translate-y-1 shadow-xl shadow-gray-900/20">
                  تصفح كل المطاعم
                </a>
                <Link href="/services/alakeifak/partner" className="flex h-14 items-center justify-center gap-2 rounded-[20px] bg-white border-2 border-gray-200 px-8 text-[16px] font-black text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all hover:-translate-y-1 shadow-sm">
                  <Store size={18} />
                  انضم كشريك للمنصة
                </Link>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ CLEANER RESTAURANTS GRID ═══════════════════ */}
      <section id="restaurants-grid" className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50/30 min-h-[600px] border-t border-gray-100">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" distance={20}>
            {/* Reorganized Header: Focused on Social Proof & Title */}
            <div className="flex flex-col items-center text-center mb-16">
              {!loading && restaurants.length > 0 && (
                <div className="flex items-center gap-3 mb-6 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                  <div className="flex -space-x-3 rtl:space-x-reverse overflow-hidden">
                    {restaurants.slice(0, 5).map((r, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                        {r.logo_url && <img src={r.logo_url} className="h-full w-full object-cover" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[14px] font-bold text-gray-500">
                    أكثر من <span className="text-gray-900 font-black">{restaurants.length}</span> مكان متاح حالياً
                  </p>
                </div>
              )}
              <h2 className="text-[36px] sm:text-[44px] font-black text-gray-900 leading-none">
                المطاعم والكافيهات
              </h2>
            </div>
          </Reveal>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                  <UtensilsCrossed size={20} className="text-orange-500 animate-pulse" />
                </div>
                <p className="text-[16px] font-bold text-gray-400 animate-pulse">جاري التجهيز...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <Reveal direction="up" distance={20}>
              <div className="rounded-[40px] border-2 border-dashed border-gray-200 bg-white p-16 text-center shadow-sm max-w-2xl mx-auto">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50 shadow-inner border border-gray-100">
                  <UtensilsCrossed size={40} className="text-gray-300" />
                </div>
                <h3 className="mb-3 text-[24px] font-black text-gray-900">
                  {searchQuery ? "مفيش مكان بالاسم ده!" : "لسه بنسخن الطاسة! 🍳"}
                </h3>
                <p className="mx-auto mb-8 max-w-md text-[16px] font-bold text-gray-500 leading-relaxed">
                  {searchQuery
                    ? "جرب تكتب الاسم بطريقة تانية أو امسح البحث."
                    : "المطاعم لسه بتجهز المنيوهات بتاعتها. خليك قريب!"}
                </p>
                {searchQuery && (
                   <button onClick={() => setSearchQuery("")} className="rounded-xl bg-orange-100 px-6 py-3 text-[15px] font-black text-orange-600 hover:bg-orange-200 transition-colors">
                     مسح البحث
                   </button>
                )}
              </div>
            </Reveal>
          )}

          {/* Grid (Using your updated RestaurantCard) */}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
              {filtered.map((r, i) => (
                <Reveal key={r.id} direction="up" distance={30} delay={i * 50}>
                  <RestaurantCard restaurant={r} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ TRUE BENTO: HOW IT WORKS ═══════════════════ */}
      <section className="px-4 py-32 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-6xl relative z-10">
          <Reveal direction="up" distance={30}>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[12px] font-black uppercase tracking-widest mb-4">How it works</div>
              <h2 className="text-[40px] md:text-[48px] font-black text-gray-900 mb-4 leading-tight">أسهل طريقة تطلب بيها 🚀</h2>
              <p className="text-[18px] font-bold text-gray-400 max-w-2xl mx-auto">صممنا التجربة عشان تكون سريعة ومريحة، من غير لفة طويلة.</p>
            </div>

            {/* The Asymmetrical Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
              
              {/* Box 1: Discover (Wide) */}
              <div className="md:col-span-2 group p-8 sm:p-10 rounded-[40px] bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl group-hover:bg-orange-300/40 transition-colors" />
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white shadow-sm border border-orange-100 text-orange-500 mb-6">
                    <Search size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[28px] font-black text-gray-900 mb-3">1. اختار مطعمك</h3>
                  <p className="text-[17px] leading-relaxed font-bold text-gray-600 max-w-md">تصفح المنيوهات الرقمية بالصور الواضحة والأسعار الحقيقية، واكتشف أماكن جديدة حواليك في العريش.</p>
                </div>
              </div>

              {/* Box 2: Customize (Square) */}
              <div className="md:col-span-1 group p-8 sm:p-10 rounded-[40px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white shadow-sm border border-blue-100 text-blue-500 mb-6">
                     <Plus size={28} strokeWidth={3} />
                  </div>
                  <h3 className="text-[24px] font-black text-gray-900 mb-3">2. فصّل طلبك</h3>
                  <p className="text-[16px] leading-relaxed font-bold text-gray-600">عايز إضافات؟ شيل وحط براحتك واظبط الوجبة على كيفك.</p>
                </div>
              </div>

              {/* Box 3: WhatsApp Action (Massive Bottom Row) */}
              <div className="md:col-span-3 group p-8 sm:p-12 rounded-[40px] bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100/50 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px]" />
                
                <div className="flex-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-emerald-200 text-emerald-700 text-[13px] font-black mb-6">
                    <Smartphone size={14} />
                    بدون تسجيل دخول
                  </div>
                  <h3 className="text-[32px] sm:text-[40px] font-black text-gray-900 mb-4 leading-tight">3. اطلب مباشرة على الواتساب</h3>
                  <p className="text-[18px] leading-relaxed font-bold text-gray-600 max-w-xl">
                    الطلب بيتم تجميعه بشكل منظم جداً وبيتبعت في رسالة جاهزة مباشرة لواتساب المطعم. مفيش أسهل ولا أسرع من كده!
                  </p>
                </div>

                <div className="shrink-0 relative z-10 flex h-32 w-32 items-center justify-center rounded-[32px] bg-white shadow-lg border border-emerald-100 group-hover:scale-105 transition-transform duration-500">
                   <MessageCircle size={56} className="text-emerald-500" strokeWidth={2} />
                   <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md animate-bounce">
                     <CheckCircle2 size={16} strokeWidth={3} />
                   </div>
                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ ULTIMATE PARTNER CTA ═══════════════════ */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 mb-12">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" distance={30}>
            <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-gray-900 via-gray-900 to-black p-10 sm:p-16 shadow-2xl border border-gray-800">
              
              {/* Background ambient lighting */}
              <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-orange-600/20 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
                
                {/* ─── TEXT CONTENT (LEFT SIDE) ─── */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 mb-6 backdrop-blur-md shadow-inner">
                    <Store size={16} className="text-orange-400" />
                    <span className="text-[13px] font-black text-orange-50 tracking-wide">لأصحاب المطاعم وصناع الأكل</span>
                  </div>
                  
                  <h2 className="mb-6 text-[32px] sm:text-[44px] font-black text-white leading-[1.2] tracking-tight">
                    حوّل مطعمك لديجيتال <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-yellow-400">وكبر مبيعاتك بسرعة!</span>
                  </h2>
                  
                  <p className="mb-8 text-[17px] font-medium leading-relaxed text-gray-300 max-w-lg">
                    صممنا لوحة تحكم عصرية وسهلة جداً. ضيف أصنافك، صورك، الإضافات، وحدد مناطق التوصيل، واستقبل الطلبات في رسالة واتساب أنيقة ومفصلة.
                  </p>
                  
                  <ul className="mb-10 space-y-5">
                    {[
                      { icon: CheckCircle2, text: "منيو رقمي بتصميم جذاب وخاص بمطعمك." },
                      { icon: CheckCircle2, text: "QR Code جاهز للطباعة على طاولاتك." },
                      { icon: CheckCircle2, text: "تحكم كامل في إتاحة الأصناف ونفاد الكمية." },
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-4 group">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <f.icon size={14} strokeWidth={3} />
                        </div>
                        <span className="text-[16px] font-bold text-gray-200">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/services/alakeifak/partner" className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-[20px] bg-orange-500 px-8 py-4 text-[16px] font-black text-white transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-1">
                      <span>انضم كشريك الآن</span>
                      <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* ─── NEW DYNAMIC INFOGRAPHIC (RIGHT SIDE) ─── */}
                <div className="hidden lg:block relative perspective-1000 h-[480px] w-full group cursor-default">
                  
                  {/* 1. Mobile Menu Mockup (Center/Right) */}
                  <div className="absolute right-4 top-8 w-[240px] h-[400px] rounded-[36px] bg-gray-900 border-[6px] border-gray-800 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden rotate-[-4deg] group-hover:rotate-[-2deg] group-hover:-translate-y-3 transition-all duration-700 z-10">
                     {/* Phone Header */}
                     <div className="h-14 bg-gray-800 flex items-center justify-between px-5">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center"><Store size={14} className="text-orange-400"/></div>
                        <div className="w-16 h-2 rounded-full bg-gray-700" />
                     </div>
                     {/* Phone Hero Image */}
                     <div className="h-28 bg-gradient-to-br from-orange-400/20 to-orange-600/10 m-3 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                        <Pizza size={36} className="text-orange-400 mb-2 drop-shadow-lg" />
                        <div className="w-20 h-2.5 rounded-full bg-white/20" />
                     </div>
                     {/* Phone Menu Items list */}
                     <div className="px-4 mt-5 space-y-4">
                        {[1, 2, 3].map((item) => (
                           <div key={item} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gray-800 shrink-0" />
                              <div className="flex-1 space-y-2">
                                 <div className="w-full h-2 rounded-full bg-gray-700" />
                                 <div className="w-2/3 h-2 rounded-full bg-gray-800" />
                              </div>
                           </div>
                        ))}
                     </div>
                     {/* Phone bottom floating button */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                        <div className="w-16 h-2 rounded-full bg-white/50" />
                     </div>
                  </div>

                  {/* 2. WhatsApp Notification Card (Floating Top Left) */}
                  <div className="absolute left-0 top-16 w-[260px] rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rotate-[5deg] group-hover:rotate-[8deg] group-hover:-translate-y-5 group-hover:-translate-x-2 transition-all duration-700 delay-100 z-20">
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-inner">
                           <MessageCircle size={24} className="text-white" fill="currentColor" />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-[15px] font-black text-white">طلب جديد وصل!</span>
                              <span className="text-[11px] font-bold text-gray-400">الآن</span>
                           </div>
                           <p className="text-[13px] font-medium text-gray-300 leading-snug">
                              تم استلام طلب بقيمة <span className="text-emerald-400 font-bold">450 ج.م</span> عبر الواتساب.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* 3. Sales Dashboard Widget (Floating Bottom Left) */}
                  <div className="absolute left-8 bottom-12 w-[220px] rounded-[24px] bg-gray-800/95 backdrop-blur-md border border-gray-700 p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rotate-[-4deg] group-hover:rotate-[-6deg] group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-700 delay-200 z-20">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[13px] font-black text-gray-400 uppercase tracking-wider">مبيعات اليوم</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                           <TrendingUp size={16} strokeWidth={3} />
                        </div>
                     </div>
                     <div className="text-[28px] font-black text-white mb-3 tracking-tight">
                        +2,450 <span className="text-[16px] text-gray-500">ج.م</span>
                     </div>
                     {/* Mini bar chart */}
                     <div className="flex items-end gap-1.5 h-10">
                        <div className="w-full bg-gray-700 rounded-t-sm h-[40%]" />
                        <div className="w-full bg-gray-700 rounded-t-sm h-[60%]" />
                        <div className="w-full bg-gray-700 rounded-t-sm h-[30%]" />
                        <div className="w-full bg-gray-700 rounded-t-sm h-[80%]" />
                        <div className="w-full bg-orange-500 rounded-t-md h-[100%] shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                     </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-emerald-400 animate-pulse z-0" />
                  <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-orange-400 animate-pulse delay-300 z-0" />
                  
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
  const accent = restaurant.theme_color || "#f97316"; 
  const isOpen = restaurant.is_open;

  return (
    <Link href={`/services/alakeifak/${restaurant.slug}`} className="group block h-full outline-none">
      {/* We use flex-col and h-full so if one card has a 3-line name and another has a 1-line name, 
        they stretch to match heights perfectly in the grid.
      */}
      <article className="flex h-full flex-col overflow-hidden rounded-[40px] bg-white border-2 border-gray-100/80 shadow-sm transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.15)] hover:-translate-y-2 hover:border-orange-100 relative group-hover:z-20">
        
        {/* ════ TOP HALF: THE BANNER ════ */}
        <div className="relative h-[220px] w-full bg-gray-50 overflow-hidden shrink-0">
           {restaurant.banner_url ? (
              <img src={restaurant.banner_url} alt="" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
           ) : (
              <div className="absolute inset-0 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)` }}>
                <div className="absolute inset-0 opacity-30" />
              </div>
           )}

           {/* Floating Top Badges */}
           <div className="absolute top-5 inset-x-5 flex justify-between items-start z-10">
              
              <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[14px] text-[13px] font-black shadow-sm backdrop-blur-md border ${isOpen ? 'bg-white/95 text-emerald-600 border-white' : 'bg-gray-900/90 text-gray-200 border-gray-700'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                {isOpen ? "متاح للطلب" : "مغلق الآن"}
              </span>
           </div>
        </div>

        {/* ════ BOTTOM HALF: SAFE TEXT ZONE ════ */}
        <div className="relative flex flex-1 flex-col px-6 pb-6 pt-14 bg-white">

           {/* The Overlapping Logo Layout 
             It floats exactly between the banner and the white card body.
           */}
           <div className="absolute -top-12 right-6 h-[96px] w-[96px] rounded-[28px] bg-white p-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] z-20 transition-transform duration-500 group-hover:-translate-y-2">
             <div className="h-full w-full rounded-[20px] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100/50">
               {restaurant.logo_url ? (
                 <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
               ) : (
                 <Store size={36} style={{ color: accent }} />
               )}
             </div>
           </div>

           {/* Restaurant Title - NO TRUNCATION!
             Using break-words and appropriate line-height so long names just wrap beautifully. 
           */}
           <div className="mb-6 flex-1">
              <h3 className="text-[28px] sm:text-[32px] font-black text-gray-900 leading-[1.3] tracking-tight group-hover:text-orange-500 transition-colors break-words">
                {restaurant.name}
              </h3>
              
              <p className="text-[15px] font-bold text-gray-400 mt-2">
                أشهى المأكولات والمشروبات
              </p>
           </div>

           {/* ════ FOOTER ACTION BAR ════ */}
           <div className="mt-auto pt-5 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
              
              <div className="flex items-center gap-2 group/btn">
                 <span className="text-[16px] font-black text-gray-900 transition-colors group-hover:text-orange-500">
                   تصفح المنيو
                 </span>
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all group-hover:bg-orange-100 group-hover:text-orange-500">
                   <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                 </div>
              </div>
              
              {/* Fun Decorative Icons */}
              {/* <div className="flex -space-x-3 rtl:space-x-reverse opacity-70 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                {[Pizza, Coffee, IceCream].map((Icon, idx) => (
                  <div key={idx} className="h-10 w-10 rounded-[14px] border-2 border-white bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm transition-transform hover:-translate-y-1">
                     <Icon size={18} strokeWidth={2.5} />
                  </div>
                ))}
              </div> */}

           </div>
        </div>
      </article>
    </Link>
  );
}