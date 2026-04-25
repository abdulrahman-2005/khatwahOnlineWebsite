"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthButton from "../components/AuthButton";
import SetupWizard from "./SetupWizard";
import DashboardContent from "./DashboardContent";
import Link from "next/link";
import {
  ArrowRight,
  LogOut,
  ShieldCheck,
  Store,
  ChevronRight,
  ChefHat,
  LifeBuoy,
  Smartphone,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function PartnerPage() {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); setAuthChecked(true); return; }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchRestaurant(session.user.id);
      } else {
        setRestaurant(null);
        setLoading(false);
      }
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Detect modal open
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.classList.contains('modal-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      await fetchRestaurant(session.user.id);
    }
    setLoading(false);
    setAuthChecked(true);
  }

  async function fetchRestaurant(userId) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", userId)
      .single();

    if (!error && data) {
      setRestaurant(data);
    } else {
      setRestaurant(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setRestaurant(null);
  }

  function handleSetupComplete(newRestaurant) {
    setRestaurant(newRestaurant);
  }

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <Store className="text-orange-500 animate-pulse" size={24} />
          </div>
          <p className="text-[15px] font-black text-gray-400">جاري الدخول لمساحة شركاء على كيفك...</p>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <PartnerLogin />
    );
  }

  // Logged in but no restaurant → Setup wizard
  if (!restaurant) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
        <style jsx global>{`
          nav { display: none !important; }
          main { padding-top: 0 !important; }
          footer { display: none !important; }
        `}</style>

        {/* Setup Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Store size={20} />
              </div>
              <span className="text-[18px] font-black tracking-tight">إعداد مطعمك الجديد</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-[14px] bg-red-50 px-4 py-2 text-[14px] font-black text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>

        <div className="py-12">
          <SetupWizard userId={user.id} onComplete={handleSetupComplete} />
        </div>
      </main>
    );
  }

  // Logged in with restaurant → Dashboard
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">

      {/* DASHBOARD NAVBAR (Premium Glass) */}
      <div 
        className={`no-print print:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-500 ease-in-out ${
          headerVisible && !isModalOpen ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/services/alakeifak"
              className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all border border-gray-100"
            >
              <ArrowRight size={20} />
            </Link>

            <div className="flex items-center gap-3 h-10 px-1">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[14px] border-2 border-white shadow-sm bg-gray-100">
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50"><Store size={18} className="text-gray-300" /></div>
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-[17px] font-black leading-tight tracking-tight text-gray-900">{restaurant.name}</h1>
                <p className="text-[12px] font-bold uppercase tracking-wider text-orange-500">لوحة التحكم</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
              <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[13px] font-black text-emerald-700">شريك معتمد</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-11 items-center justify-center gap-2 rounded-[18px] bg-gray-900 px-5 text-[14px] font-black text-white hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-28">
        <DashboardContent
          restaurant={restaurant}
          onRestaurantUpdate={(updated) => setRestaurant(updated)}
        />
      </div>
    </main>
  );
}


function PartnerLogin() {
  return (
    <main 
      className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500/30" 
      dir="rtl"
    >
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="absolute w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] top-[-20%] right-[-10%]" />
        <div className="absolute w-[600px] h-[600px] bg-zinc-400/10 rounded-full blur-[100px] bottom-[-10%] left-[-10%]" />
      </div>

      {/* Main Floating Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col lg:flex-row overflow-hidden z-10 min-h-[700px]">
        
        {/* ════ RIGHT SIDE (Visually Right in RTL): LOGIN PANEL ════ */}
        <section className="flex flex-col justify-between w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 relative">
          
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2  text-orange-600 text-sm font-black tracking-tight">
              <ChefHat size={16} strokeWidth={2.5} />
              <span>على كيفك — شركاء</span>
            </div>

            <Link
              href="/services/alakeifak"
              className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors group"
            >
              <span>العودة</span>
              <ChevronRight size={16} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>

          {/* Main Auth Area */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-[1.1] mb-4 tracking-tight">
              أهلاً بك في <br />
              مطبخ <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-orange-600">النجاح.</span>
            </h1>
            <p className="text-zinc-500 font-bold leading-relaxed mb-10 text-base sm:text-lg">
              مساحة العمل الخاصة بك للتحكم في المنيو، الأسعار، واستقبال الطلبات في ثوانٍ.
            </p>

            {/* Auth Component Wrapper */}
            <div className="relative group">
                {/* PLACEHOLDER FOR YOUR AUTH BUTTON */}
                  <AuthButton />
                {/* <AuthButton /> */}
            </div>
            
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <a href="https://khatwah.online/contact" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-orange-500 transition-colors">
              <LifeBuoy size={18} />
              تحتاج مساعدة؟
            </a>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              النظام متصل
            </div>
          </div>
        </section>

        {/* ════ LEFT SIDE (Visually Left in RTL): MARKETING SHOWCASE ════ */}
        <section className="hidden lg:flex w-1/2 bg-zinc-950 p-12 relative flex-col items-center justify-center overflow-hidden">
          
          {/* Abstract Dark Background Elements */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

          <div className="relative z-10 w-full max-w-md">
            
            {/* Visual Centerpiece */}
            <div className="mb-12 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] rotate-12 flex items-center justify-center shadow-2xl mx-auto shadow-orange-500/20">
                <Sparkles size={40} className="text-white" strokeWidth={2} />
              </div>
              
            </div>

            <h2 className="text-3xl font-black text-white text-center leading-tight mb-8">
              كل اللي محتاجه عشان <br /> تدير مطعمك بذكاء.
            </h2>

            {/* Feature Grid */}
            <div className="space-y-4">
              {[
                { icon: Smartphone, title: "منيو تفاعلي", desc: "عميلك هيتصفح المنيو ويطلب في ثواني بدون تعقيد." },
                { icon: TrendingUp, title: "تحديثات لحظية", desc: "غيّر أسعارك، ضيف أصناف جديدة، وهتظهر فوراً للجميع." }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-orange-500/50 group">
                  <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-orange-400 group-hover:text-white group-hover:scale-110 transition-all">
                    <feature.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg mb-0.5">{feature.title}</h3>
                    <p className="text-zinc-400 font-bold text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Copyright/Watermark */}
          <div className="absolute bottom-8 text-center w-full text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Powered by Khatwah Online
          </div>
        </section>

      </div>
    </main>
  );
}