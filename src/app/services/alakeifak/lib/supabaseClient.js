import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

// Dummy lock to prevent React Strict Mode / Fast Refresh from deadlocking Supabase Auth
const dummyLock = async (name, acquireTimeout, fn) => {
  return await fn();
};

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      lock: dummyLock,
    },
  });
} else if (typeof window !== 'undefined') {
  console.warn('Supabase env vars missing — some features will not work');
}

export { supabase };
