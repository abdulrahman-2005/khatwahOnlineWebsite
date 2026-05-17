import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
let clientReadyPromise = null;

// Function to ensure client is ready
async function ensureClientReady(client) {
  if (!client) return false;
  
  try {
    // Try to get session to verify client is working
    const { error } = await client.auth.getSession();
    return !error || error.message !== 'Failed to fetch';
  } catch (err) {
    console.warn('[Supabase] Client readiness check failed:', err);
    return false;
  }
}

// Function to get or create Supabase client
function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  // Client-side: use singleton
  if (!window.__supabaseClientInstance) {
    console.log('[Supabase] Creating new client instance');
    
    // Create custom fetch with timeout that respects existing signals
    const fetchWithTimeout = (url, options = {}) => {
      // If signal already provided, respect it and don't add timeout
      if (options.signal) {
        return fetch(url, options);
      }
      
      // Only add timeout if no signal exists
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    };

    window.__supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        lock: false, // Disables navigator.locks, preventing cross-tab deadlocks
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        fetch: fetchWithTimeout,
      },
    });
    
    // Initialize readiness check
    clientReadyPromise = ensureClientReady(window.__supabaseClientInstance);
    
    // Set up auth listener once
    if (!window.__supabaseAuthListenerAttached) {
      window.__supabaseAuthListenerAttached = true;
      window.__supabaseClientInstance.auth.onAuthStateChange((event, session) => {
        console.log('[Supabase Auth] Event:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'TOKEN_REFRESHED') {
          window.dispatchEvent(new CustomEvent('supabase:session-recovered'));
        }
        if (event === 'SIGNED_OUT') {
          window.dispatchEvent(new CustomEvent('supabase:signed-out'));
        }
      });
    }
  }
  
  return window.__supabaseClientInstance;
}

// Wait for client to be ready before making calls
async function waitForClient() {
  if (typeof window === 'undefined') return true;
  
  const client = getSupabaseClient();
  if (!client) return false;
  
  // Wait for initial ready check if it exists
  if (clientReadyPromise) {
    await clientReadyPromise;
    clientReadyPromise = null; // Clear after first use
  }
  
  return true;
}

if (supabaseUrl && supabaseAnonKey) {
  supabase = getSupabaseClient();
} else if (typeof window !== 'undefined') {
  console.warn('Supabase env vars missing — some features will not work');
}

export { supabase, getSupabaseClient, waitForClient };
