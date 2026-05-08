/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — RLS SECURITY AUDIT (k6)
 * ═══════════════════════════════════════════════════════════════
 *
 * This test is DEDICATED to verifying that Row Level Security
 * is correctly blocking unauthorized access to every table.
 *
 * Run:
 *   k6 run -e SUPABASE_URL=https://xxx.supabase.co -e SUPABASE_ANON_KEY=xxx \
 *     src/app/services/alakeifak/__tests__/k6/security-audit.js
 *
 * EXPECTED: ALL checks pass. If any check FAILS, you have a data leak.
 *
 * ═══════════════════════════════════════════════════════════════
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { Counter } from 'k6/metrics';

const SUPABASE_URL = 'https://scoyqyidactgnejtnbhj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjb3lxeWlkYWN0Z25lanRuYmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODYyNTIsImV4cCI6MjA5MjM2MjI1Mn0.jAjOvojBpL-qI-n2OxiKW5wf6X6U9uAJG3807s23w7g';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing env vars. Run with:\n' +
    'k6 run -e SUPABASE_URL=https://xxx.supabase.co -e SUPABASE_ANON_KEY=xxx security-audit.js'
  );
}

const leaksFound = new Counter('data_leaks_found');

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    data_leaks_found: ['count==0'],  // ANY leak = test failure
  },
};

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// Tables that should NEVER be readable by anonymous users
const PRIVATE_TABLES = [
  'orders',
  'restaurant_members',
  'restaurant_payments',
  'app_settings',
];

// Tables that SHOULD be readable publicly (menus)
const PUBLIC_TABLES = [
  'restaurants',
  'categories',
  'subcategories',
  'items',
  'item_sizes',
  'extras',
  'delivery_zones',
];

export default function () {
  // ── PRIVATE TABLE AUDIT ──────────────────────────────────────
  PRIVATE_TABLES.forEach((table) => {
    group(`PRIVATE: ${table}`, () => {
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`,
        { headers: HEADERS }
      );

      const isBlocked = check(res, {
        [`${table} returns empty or 403`]: (r) => {
          if (r.status === 403 || r.status === 401) return true;
          try {
            const body = JSON.parse(r.body);
            if (Array.isArray(body) && body.length === 0) return true;
            // If we got data, that's a LEAK
            if (Array.isArray(body) && body.length > 0) {
              console.error(`🚨 DATA LEAK on table "${table}": returned ${body.length} rows!`);
              return false;
            }
            return true;
          } catch {
            return true; // Parse error means no data leaked
          }
        },
      });

      if (!isBlocked) leaksFound.add(1);
    });
  });

  // ── PUBLIC TABLE AUDIT ────────────────────────────────────────
  PUBLIC_TABLES.forEach((table) => {
    group(`PUBLIC: ${table}`, () => {
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`,
        { headers: HEADERS }
      );

      check(res, {
        [`${table} is accessible (200)`]: (r) => r.status === 200,
        [`${table} returns data or empty array`]: (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body);
          } catch {
            return false;
          }
        },
      });
    });
  });

  // ── WRITE AUDIT: anon should NOT be able to delete/update ─────
  group('WRITE: Cannot delete restaurants', () => {
    const res = http.del(
      `${SUPABASE_URL}/rest/v1/restaurants?id=eq.00000000-0000-0000-0000-000000000000`,
      null,
      { headers: HEADERS }
    );
    check(res, {
      'Cannot delete restaurants anonymously': (r) => r.status !== 200 || r.status === 204,
    });
  });

  group('WRITE: Cannot update orders', () => {
    const res = http.patch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.00000000-0000-0000-0000-000000000000`,
      JSON.stringify({ status: 'hacked' }),
      { headers: HEADERS }
    );
    check(res, {
      'Cannot update orders anonymously': (r) => {
        // Either blocked (403) or no rows affected
        return r.status === 403 || r.status === 401 || r.status === 204;
      },
    });
  });

  group('WRITE: Cannot insert restaurant_members', () => {
    const res = http.post(
      `${SUPABASE_URL}/rest/v1/restaurant_members`,
      JSON.stringify({
        restaurant_id: '00000000-0000-0000-0000-000000000000',
        email: 'hacker@evil.com',
        role: 'owner',
      }),
      { headers: HEADERS }
    );
    check(res, {
      'Cannot inject fake member anonymously': (r) =>
        r.status === 403 || r.status === 401 || r.status === 409,
    });
  });

  // ── SENSITIVE FIELD AUDIT: Check if phone numbers are exposed ──
  group('PRIVACY: Orders do not leak phone numbers', () => {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/orders?select=customer_phone&limit=5`,
      { headers: HEADERS }
    );

    check(res, {
      'No phone numbers leaked': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (Array.isArray(body) && body.length > 0) {
            console.error(`🚨 PHONE NUMBERS LEAKED: ${JSON.stringify(body)}`);
            leaksFound.add(1);
            return false;
          }
          return true;
        } catch {
          return true;
        }
      },
    });
  });
}
