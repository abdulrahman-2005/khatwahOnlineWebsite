import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Uses the service role key for bypassing RLS when needed,
 * or the anon key for public queries.
 */
export function createServerSupabase({ useServiceRole = false } = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useServiceRole 
    ? process.env.NEXT_SERVICE_ROLE_API_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase environment variables for server client');
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
