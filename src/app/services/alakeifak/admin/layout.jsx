"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { safeQuery } from "../lib/safeQuery";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  LogOut,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";

/**
 * Admin layout — Client-side auth guard for Khatwah super admins.
 * 
 * Since Supabase auth is handled entirely client-side (no SSR cookies),
 * the guard runs here instead of Edge middleware. The layout checks the
 * user's email against the NEXT_PUBLIC_SUPER_ADMIN_EMAILS env var.
 * 
 * Set NEXT_PUBLIC_SUPER_ADMIN_EMAILS in .env.local as a comma-separated list.
 */

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      const u = session?.user || null;
      setUser(u);
      
      if (u) {
        // Check DB for super admin status
        const { data: isSuperAdmin } = await safeQuery(() => supabase.rpc('is_super_admin'));
        setAuthorized(!!isSuperAdmin);
      } else {
        setAuthorized(false);
      }
      
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setAuthorized(false);
  }

  // Loading
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <Shield className="text-orange-500" size={20} />
          </div>
          <p className="text-sm font-bold text-zinc-600">Verifying access...</p>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
            <Lock size={28} className="text-zinc-500" />
          </div>
          <h1 className="mb-2 text-xl font-black text-white">Admin Access Required</h1>
          <p className="mb-8 text-sm text-zinc-500">
            Sign in with an authorized Khatwah admin account.
          </p>
          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/services/alakeifak/admin`,
                },
              })
            }
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          <Link href="/services/alakeifak" className="mt-4 inline-block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Back to Alakeifak
          </Link>
        </div>
      </main>
    );
  }

  // Logged in but NOT authorized
  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-900/50 bg-zinc-900 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-950 border border-red-900/50">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h1 className="mb-2 text-xl font-black text-white">Access Denied</h1>
          <p className="mb-2 text-sm text-zinc-500">
            <span className="text-zinc-400 font-mono">{user.email}</span> is not authorized.
          </p>
          <p className="mb-8 text-xs text-zinc-600">
            Contact the Khatwah team if you believe this is an error.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-700"
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <Link
              href="/services/alakeifak"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-700 border border-zinc-700"
            >
              <ArrowRight size={14} />
              Go Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Authorized — render admin shell
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <style jsx global>{`
        nav { display: none !important; }
        main { padding-top: 0 !important; }
        footer { display: none !important; }
      `}</style>

      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 pr-2">
            <Link
              href="/services/alakeifak"
              className="flex shrink-0 h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:text-orange-400 hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="flex shrink-0 h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Shield size={12} className="text-orange-400 sm:w-[14px] sm:h-[14px]" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h1 className="text-xs sm:text-sm font-black text-white leading-none tracking-tight truncate">
                  Alakeifak Admin
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate mt-0.5 sm:mt-1">
                  God View • Internal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-1.5 border border-zinc-700/50">
              <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[150px] xl:max-w-none">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-lg bg-zinc-800 px-3 sm:px-4 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700 active:scale-95"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </main>
  );
}
