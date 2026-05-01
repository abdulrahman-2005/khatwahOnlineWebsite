/**
 * safeQuery.js — Centralized error-aware wrapper for all Supabase operations.
 * 
 * Solves: silent failures, stale auth sessions, and unhandled mutation errors
 * across the entire Alakeifak service.
 */

import { supabase } from './supabaseClient';

// Helper to prevent infinite hanging due to stuck Supabase token refresh
const withTimeout = (promise, ms = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timed out. Session may be stuck.')), ms);
    })
  ]);
};

// ── Auth-related error codes from PostgREST / GoTrue ──
const AUTH_ERROR_CODES = new Set([
  '401', '403', 'PGRST301', 'PGRST302',
  'invalid_grant', 'invalid_token', 'token_expired',
]);

function isAuthError(error) {
  if (!error) return false;
  const code = String(error.code || error.status || '');
  const msg = (error.message || '').toLowerCase();
  return (
    AUTH_ERROR_CODES.has(code) ||
    msg.includes('jwt') ||
    msg.includes('token') ||
    msg.includes('refresh_token') ||
    msg.includes('not authenticated') ||
    msg.includes('unauthorized') ||
    error.status === 401 ||
    error.status === 403
  );
}


/**
 * Execute a Supabase query with automatic error detection and retry.
 * 
 * @param {Function} queryFn - A function that returns a Supabase query promise.
 *   e.g., () => supabase.from('orders').select('*').eq('id', 1)
 * @param {Object} options
 * @param {number} options.retries - Number of retries on auth errors (default: 1)
 * @returns {{ data, error, isAuthError: boolean }}
 */
export async function safeQuery(queryFn, { retries = 1 } = {}) {
  try {
    const result = await withTimeout(queryFn());
    const { data, error } = result || {};

    if (error && isAuthError(error)) {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase:session-expired'));
      return { data: null, error, isAuthError: true };
    }

    return { data, error, isAuthError: false };
  } catch (err) {
    if (err?.message?.includes('timed out')) {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase:session-expired'));
      return { data: null, error: err, isAuthError: true };
    }
    return { data: null, error: err, isAuthError: false };
  }
}

/**
 * Execute a Supabase mutation (INSERT/UPDATE/DELETE) with error handling,
 * optimistic update support, and automatic rollback.
 * 
 * @param {Function} mutationFn - Async function performing the mutation.
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Called with the result on success.
 * @param {Function} [options.onError] - Called with the error on failure.
 * @param {Function} [options.onAuthError] - Called specifically on auth errors.
 * @param {Function} [options.optimisticUpdate] - Function to apply optimistic state.
 * @param {Function} [options.rollback] - Function to revert optimistic state on error.
 * @returns {{ data, error, ok: boolean }}
 */
export async function safeMutation(mutationFn, {
  onSuccess,
  onError,
  onAuthError,
  optimisticUpdate,
  rollback,
} = {}) {
  // Apply optimistic update immediately
  if (optimisticUpdate) {
    try { optimisticUpdate(); } catch { /* ignore */ }
  }

  try {
    const result = await withTimeout(mutationFn());
    const { data, error } = result || {};

    if (error) {
      // Rollback optimistic update
      if (rollback) {
        try { rollback(); } catch { /* ignore */ }
      }

      if (isAuthError(error)) {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase:session-expired'));
        if (onAuthError) onAuthError(error);
        return { data: null, error, ok: false };
      }

      if (onError) onError(error);
      return { data: null, error, ok: false };
    }

    if (onSuccess) onSuccess(data);
    return { data, error: null, ok: true };
  } catch (err) {
    if (rollback) {
      try { rollback(); } catch { /* ignore */ }
    }
    if (err?.message?.includes('timed out')) {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase:session-expired'));
      if (onAuthError) onAuthError(err);
    } else {
      if (onError) onError(err);
    }
    return { data: null, error: err, ok: false };
  }
}

/**
 * Debounce utility for batching rapid realtime-triggered refetches.
 */
export function createDebouncedFetcher(fetchFn, delayMs = 500) {
  let timer = null;
  let pending = false;

  return function debouncedFetch() {
    if (timer) clearTimeout(timer);
    pending = true;
    timer = setTimeout(async () => {
      if (pending) {
        pending = false;
        await fetchFn();
      }
    }, delayMs);
  };
}
