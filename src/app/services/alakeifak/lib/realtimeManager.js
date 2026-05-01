/**
 * realtimeManager.js — Self-healing realtime subscription manager.
 * 
 * Wraps Supabase channels with:
 * - Automatic reconnection on CHANNEL_ERROR / CLOSED / TIMED_OUT
 * - Exponential backoff (1s → 2s → 4s → max 30s)
 * - Connection health monitoring
 * - Deduplication (same channelId won't create multiple subscriptions)
 */

import { supabase } from './supabaseClient';

// ── Active channels registry ──
const activeChannels = new Map();

/**
 * Create or retrieve a managed realtime channel with auto-reconnect.
 * 
 * @param {string} channelId - Unique identifier for this channel
 * @param {Function} configureFn - Function that receives the channel and calls .on() etc.
 *   (channel) => channel.on('postgres_changes', { ... }, handler)
 * @param {Object} options
 * @param {Function} [options.onStatusChange] - Called with (status: string) on connection changes
 * @param {number} [options.maxBackoffMs] - Max reconnect delay in ms (default: 30000)
 * @returns {{ unsubscribe: Function }}
 */
export function createManagedChannel(channelId, configureFn, {
  onStatusChange,
  maxBackoffMs = 30000,
} = {}) {
  // If a channel with this ID already exists, tear it down first
  if (activeChannels.has(channelId)) {
    const existing = activeChannels.get(channelId);
    existing.destroy();
  }

  let channel = null;
  let retryCount = 0;
  let retryTimer = null;
  let destroyed = false;
  let currentStatus = 'CONNECTING';

  function setStatus(status) {
    currentStatus = status;
    if (onStatusChange && !destroyed) {
      onStatusChange(status);
    }
  }

  function getBackoffMs() {
    const base = Math.min(1000 * Math.pow(2, retryCount), maxBackoffMs);
    // Add jitter (±25%)
    const jitter = base * 0.25 * (Math.random() * 2 - 1);
    return Math.round(base + jitter);
  }

  function subscribe() {
    if (destroyed || !supabase) return;

    try {
      channel = supabase.channel(channelId);
      
      // Let the caller configure the channel (add .on() handlers)
      configureFn(channel);

      channel.subscribe((status, err) => {
        if (destroyed) return;

        if (status === 'SUBSCRIBED') {
          retryCount = 0; // Reset backoff on successful connection
          setStatus('SUBSCRIBED');
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          setStatus('DISCONNECTED');
          scheduleReconnect();
        } else {
          setStatus(status);
        }
      });
    } catch (err) {
      console.error(`[RealtimeManager] Failed to create channel ${channelId}:`, err);
      setStatus('DISCONNECTED');
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (destroyed) return;
    if (retryTimer) clearTimeout(retryTimer);

    const delay = getBackoffMs();
    retryCount++;

    retryTimer = setTimeout(() => {
      if (destroyed) return;
      
      // Clean up old channel
      if (channel) {
        try { supabase.removeChannel(channel); } catch { /* ignore */ }
        channel = null;
      }

      setStatus('RECONNECTING');
      subscribe();
    }, delay);
  }

  function destroy() {
    destroyed = true;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (channel) {
      try { supabase.removeChannel(channel); } catch { /* ignore */ }
      channel = null;
    }
    activeChannels.delete(channelId);
    setStatus('CLOSED');
  }

  // Store in registry
  const handle = { destroy, getStatus: () => currentStatus };
  activeChannels.set(channelId, handle);

  // Start subscribing
  subscribe();

  return {
    unsubscribe: destroy,
    getStatus: () => currentStatus,
  };
}

/**
 * Destroy all active managed channels. 
 * Call this on user logout.
 */
export function destroyAllChannels() {
  for (const [, handle] of activeChannels) {
    handle.destroy();
  }
  activeChannels.clear();
}
