# Alakeifak Loading Reliability — Root Cause Analysis & Fix Plan

## Symptom
`/alakeifak` and `/admin` pages intermittently hang forever on load. Requires manual refresh to recover. Sometimes loads instantly, most times hangs indefinitely.

## Root Causes Identified

### 🔴 Critical: Supabase Auth Token Refresh Deadlock (PRIMARY CAUSE)
- **File**: `supabaseClient.js` — `lock: false` disables `navigator.locks` but this alone doesn't fix all token refresh races
- **Problem**: When the Supabase auth token expires mid-session, `autoRefreshToken` triggers a background refresh. If the refresh takes > 5s or fails silently, ALL subsequent queries queue behind it. The `safeQuery` 30s timeout is too generous — the user sees an infinite spinner for 30 seconds
- **Why it's intermittent**: Works when token is fresh. Hangs when token is stale/expired and refresh gets stuck

### 🔴 Critical: No Abort Controller / Request Cancellation
- **File**: `admin/page.jsx` and `alakeifak/page.jsx`
- **Problem**: `useEffect` fires `fetchData()` but if the component unmounts/re-renders before the fetch completes (React StrictMode, navigation, etc.), the stale promise still resolves and calls `setState` on an unmounted component. More critically, there's no `AbortController` — if a request hangs, there's no way to cancel it
- **Impact**: Stale requests accumulate, new requests may not fire due to the `fetchCountRef` guard

### 🟡 High: `safeQuery` timeout is 30 seconds — Way too long
- **File**: `safeQuery.js` line 11
- **Problem**: `withTimeout(promise, ms = 30000)` means a stuck Supabase request will hang the UI for 30 full seconds before timing out. Users give up and refresh after ~5s
- **Fix**: Reduce to 8-10 seconds with retry logic

### 🟡 High: Admin CRM RPC fallback waterfall is deadly slow
- **File**: `admin/page.jsx` lines 151-239
- **Problem**: When `get_admin_crm_data` RPC fails, the fallback cascades through 3 levels of increasingly expensive queries (all going through RLS evaluation). Each level adds multiple sequential round trips
- **Impact**: On RPC failure, admin page can take 15-30s to load

### 🟡 High: `AnalyticsDashboard` has no timeout/retry, raw `supabase.rpc()` call
- **File**: `AnalyticsDashboard.jsx` line 39
- **Problem**: Uses raw `supabase.rpc()` without `safeQuery` wrapper. If this RPC hangs, there's no timeout at all — infinite spinner. Also no retry mechanism
- **Impact**: Analytics tab can hang permanently

### 🟡 High: `FinancialsDashboard` — same raw-call-without-timeout pattern
- **File**: `FinancialsDashboard.jsx` line 49
- **Problem**: Uses `safeQuery` (good) but if the query hangs at the Supabase level (auth stuck), it still waits 30s

### 🟠 Medium: Realtime channel reconnection can trigger infinite refetch loops
- **File**: `realtimeManager.js` + `admin/page.jsx`
- **Problem**: On connection recovery after a long disconnect, the channel may fire a burst of change events. Even though `debouncedFetch` exists (800ms), the initial reconnect can cause `fetchData(true)` to fire while a previous fetch is still in-flight
- **Impact**: Multiple concurrent fetches, state thrashing

### 🟠 Medium: `supabaseClient.js` creates a NEW client on server-side (non-window)
- **File**: `supabaseClient.js` lines 27-35
- **Problem**: Every server-side import creates a fresh client with `persistSession: true` — meaningless on server. Not a direct cause of the hang but wastes resources

### 🟢 Low: Public page `fetchRestaurants()` has no retry
- **File**: `alakeifak/page.jsx` line 65
- **Problem**: Single attempt, no retry on failure. If the first request fails/hangs, user sees spinner forever

## Security Issues Found

1. **`security definer` functions in exposed schema** — `get_admin_crm_data()` and `is_super_admin()` are `SECURITY DEFINER` in `public` schema. Per Supabase best practice, these should be in a private schema
2. **`safeQuery` retry parameter exists but is never used** — `retries = 1` in the options but no retry logic is implemented
3. **Admin auth check debounce delay** — The 100ms debounce in `admin/layout.jsx` line 58 can cause a visible flash of the "Access Denied" screen before auth resolves

## Fix Plan

### Phase 1: Core Reliability (eliminates the hang)
1. **Reduce `safeQuery` timeout** from 30s → 10s
2. **Add retry logic** to `safeQuery` (1 retry with fresh session check)
3. **Add `AbortController`** to all `fetchData` calls in pages
4. **Wrap `AnalyticsDashboard` RPC** in `safeQuery`
5. **Add global fetch timeout** to supabase client config

### Phase 2: Resilience
6. **Add connection-aware fetch guard** — skip fetches when document is hidden (`visibilitychange`)
7. **Debounce protection** — prevent concurrent fetches in admin page
8. **Improve fallback chain** — if CRM RPC fails, show cached/partial data immediately, fetch in background

### Phase 3: UX Recovery
9. **Auto-retry with exponential backoff** on page-level fetches
10. **"Taking longer than expected" banner** after 5s showing retry button
11. **Stale-while-revalidate pattern** — show cached data immediately, refresh in background
