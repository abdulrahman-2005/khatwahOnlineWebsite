import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    if (!window.__supabaseClientInstance) {
      window.__supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          lock: false, // Disables navigator.locks, preventing cross-tab deadlocks and 5000ms freezing
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    }
    supabase = window.__supabaseClientInstance;
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        lock: false,
      },
    });
  }

  // ── Global auth state monitor ──
  // Emits a custom event when the session becomes invalid so the UI can react
  if (typeof window !== 'undefined' && !window.__supabaseAuthListenerAttached) {
    window.__supabaseAuthListenerAttached = true;
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // Session recovered — dismiss any recovery banners
        window.dispatchEvent(new CustomEvent('supabase:session-recovered'));
      }
      if (event === 'SIGNED_OUT') {
        window.dispatchEvent(new CustomEvent('supabase:signed-out'));
      }
    });
  }
} else if (typeof window !== 'undefined') {
  console.warn('Supabase env vars missing — some features will not work');
}

export { supabase };
