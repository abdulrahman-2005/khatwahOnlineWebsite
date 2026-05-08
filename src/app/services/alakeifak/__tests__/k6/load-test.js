/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — COMPREHENSIVE K6 LOAD & STRESS TEST
 * ═══════════════════════════════════════════════════════════════
 *
 * This script simulates realistic Eid-level traffic across ALL
 * public-facing endpoints of the Alakeifak service.
 *
 * SETUP:
 *   1. Install k6:  winget install k6
 *   2. Build locally: npm run build && npm start
 *   3. Run:  k6 run src/app/services/alakeifak/__tests__/k6/load-test.js
 *
 * To target live:
 *   k6 run -e BASE_URL=https://khatwah.online src/app/services/alakeifak/__tests__/k6/load-test.js
 *
 * ═══════════════════════════════════════════════════════════════
 */

import http from 'k6/http';
import { check, sleep, group, fail } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────
const menuPageDuration = new Trend('menu_page_duration', true);
const directoryDuration = new Trend('directory_page_duration', true);
const manifestDuration = new Trend('manifest_api_duration', true);
const orderSubmitDuration = new Trend('order_submit_duration', true);
const errorRate = new Rate('error_rate');
const ordersPlaced = new Counter('orders_placed');
const pageLoads = new Counter('page_loads');

// ── Configuration ───────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://scoyqyidactgnejtnbhj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjb3lxeWlkYWN0Z25lanRuYmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODYyNTIsImV4cCI6MjA5MjM2MjI1Mn0.jAjOvojBpL-qI-n2OxiKW5wf6X6U9uAJG3807s23w7g';

// ⚠️ REPLACE THESE with actual restaurant slugs from your database
const RESTAURANT_SLUGS = [
  'test1',
  'test2',
  'test3',
];

// Sample delivery zone IDs (replace with real ones from your DB)
const SAMPLE_DELIVERY_ZONE_IDS = [
  '65428dd2-cc89-4f80-9a7f-ffbd8870f50d',
  'b0150b96-542b-4d51-a2c8-3a55adb7fd86',
  '074507d6-ddca-48bf-b208-b76ccdbc8a16',
  '2bc50ca2-0c7c-4c67-b52c-6e0268fc4ec6',
  'e4220235-2a8d-4456-9423-8887ef739c67',
  'd5434d86-84d4-4252-8389-4dc7493b9bc6'

];


// Sample restaurant IDs (replace with real ones from your DB)
const SAMPLE_RESTAURANT_IDS = [
  '542a04db-541f-4979-a2b6-3c127c2eda74',
  '2335a0e5-6326-4b9b-99e2-90718846081a',
  'a1ef3870-0890-4029-a023-702b19207db7',
];

// ── Test Scenarios ──────────────────────────────────────────────
export const options = {
  scenarios: {
    // Scenario 1: Normal browsing traffic (menu viewers)
    browsing_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },    // Warm up
        { duration: '1m', target: 50 },     // Hold steady
        { duration: '30s', target: 150 },   // Eid spike!
        { duration: '2m', target: 150 },    // Hold the spike
        { duration: '30s', target: 0 },     // Cool down
      ],
      exec: 'browsingUser',
      tags: { scenario: 'browsing' },
    },

    // Scenario 2: Customers placing orders (lower volume, heavier operations)
    ordering_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '2m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      exec: 'orderingUser',
      tags: { scenario: 'ordering' },
    },

    // Scenario 3: API endpoint stress (manifest, revalidate)
    api_stress: {
      executor: 'constant-arrival-rate',
      duration: '2m',
      rate: 50,          // 50 requests per second
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 60,
      exec: 'apiStress',
      tags: { scenario: 'api_stress' },
    },

    // Scenario 4: Security probe — try to access protected endpoints
    security_probe: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 1,
      exec: 'securityProbe',
      tags: { scenario: 'security' },
    },
  },

  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<1000'],   // 95% of all requests under 1s
    http_req_failed: ['rate<0.05'],      // Less than 5% failure

    // Per-endpoint thresholds
    menu_page_duration: ['p(95)<800'],
    directory_page_duration: ['p(95)<600'],
    manifest_api_duration: ['p(95)<300'],
    order_submit_duration: ['p(95)<2000'],
    error_rate: ['rate<0.02'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefixes = ['010', '011', '012', '015'];
  const prefix = randomItem(prefixes);
  return `+20${prefix.substring(1)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function randomName() {
  const names = ['أحمد', 'محمد', 'فاطمة', 'سارة', 'عمر', 'ياسمين', 'خالد', 'مريم', 'علي', 'نور'];
  return randomItem(names);
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO 1: BROWSING USER
// Simulates a customer discovering and browsing the menu
// ═══════════════════════════════════════════════════════════════
export function browsingUser() {
  // 1. Visit the main directory listing
  group('01 - Directory Page', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak`);
    check(res, {
      'Directory returns 200': (r) => r.status === 200,
      'Directory has HTML content': (r) => r.body && r.body.includes('</html>'),
    }) || errorRate.add(1);

    directoryDuration.add(res.timings.duration);
    pageLoads.add(1);
  });

  sleep(Math.random() * 2 + 1); // Think time: 1–3s

  // 2. Click into a random restaurant
  const slug = randomItem(RESTAURANT_SLUGS);

  group('02 - Restaurant Menu Page', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak/${slug}`);

    const passed = check(res, {
      'Menu returns 200': (r) => r.status === 200,
      'Menu has content': (r) => r.body && r.body.length > 1000,
    });

    if (!passed) errorRate.add(1);
    menuPageDuration.add(res.timings.duration);
    pageLoads.add(1);
  });

  sleep(Math.random() * 3 + 2); // Browse menu: 2–5s

  // 3. Fetch PWA manifest (browser does this automatically)
  group('03 - PWA Manifest', () => {
    const res = http.get(`${BASE_URL}/api/alakeifak/manifest?slug=${slug}`);
    check(res, {
      'Manifest returns 200': (r) => r.status === 200,
      'Manifest is valid JSON': (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
      'Manifest has name': (r) => JSON.parse(r.body).name !== undefined,
    }) || errorRate.add(1);

    manifestDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 5 + 3); // Read menu: 3–8s

  // 4. Rapid page reload (impatient user, tests cache)
  group('04 - Cache Hit (Repeat Load)', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak/${slug}`);
    check(res, {
      'Cached page returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    pageLoads.add(1);
  });

  // 5. 10% chance: visit a second restaurant
  if (Math.random() < 0.1) {
    const slug2 = randomItem(RESTAURANT_SLUGS.filter((s) => s !== slug));
    if (slug2) {
      group('05 - Cross-Restaurant Browse', () => {
        const res = http.get(`${BASE_URL}/services/alakeifak/${slug2}`);
        check(res, { 'Second restaurant loads': (r) => r.status === 200 });
        pageLoads.add(1);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO 2: ORDERING USER
// Simulates the full order lifecycle via the secure RPC
// ═══════════════════════════════════════════════════════════════
export function orderingUser() {
  // Skip if Supabase config is missing
  if (!SUPABASE_ANON_KEY) {
    console.warn('SUPABASE_ANON_KEY not set — skipping order scenario');
    sleep(5);
    return;
  }

  const restaurantId = randomItem(SAMPLE_RESTAURANT_IDS);

  // 1. Browse the menu first
  group('Order - Browse Menu', () => {
    const slug = randomItem(RESTAURANT_SLUGS);
    const res = http.get(`${BASE_URL}/services/alakeifak/${slug}`);
    check(res, { 'Menu page loads for ordering': (r) => r.status === 200 });
    pageLoads.add(1);
  });

  sleep(Math.random() * 5 + 5); // Spend 5–10s choosing items

  // 2. Place an order via the secure RPC
  group('Order - Submit via RPC', () => {
    const orderPayload = {
      restaurant_id: restaurantId,
      total_amount: Math.floor(Math.random() * 300 + 50),
      cart_snapshot: [
        {
          itemName: 'كريب بانيه',
          size: { id: 'test-size-1', name: 'وسط', price: 70 },
          extras: [{ id: 'test-extra-1', name: 'مخلل', price: 15 }],
          quantity: Math.floor(Math.random() * 3 + 1),
        },
      ],
      customer_name: randomName(),
      customer_phone: randomPhone(),
      order_type: randomItem(['delivery', 'pickup', 'in_house']),
      delivery_address: 'عنوان اختبار التحميل',
      delivery_zone_id: randomItem(SAMPLE_DELIVERY_ZONE_IDS),
    };

    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const res = http.post(
      `${SUPABASE_URL}/rest/v1/rpc/place_order_secure`,
      JSON.stringify({ payload: orderPayload }),
      { headers }
    );

    const passed = check(res, {
      'Order submission returns 200': (r) => r.status === 200,
      'Order returns tracking_id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.tracking_id;
        } catch {
          return false;
        }
      },
    });

    if (passed) {
      ordersPlaced.add(1);
    } else {
      errorRate.add(1);
    }

    orderSubmitDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 2 + 1);
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO 3: API STRESS
// Hammers the manifest and static API endpoints
// ═══════════════════════════════════════════════════════════════
export function apiStress() {
  const slug = randomItem(RESTAURANT_SLUGS);
  const endpoint = randomItem([
    `${BASE_URL}/api/alakeifak/manifest?slug=${slug}`,
    `${BASE_URL}/api/alakeifak/manifest?slug=main`,
    `${BASE_URL}/api/alakeifak/manifest?slug=partner`,
    `${BASE_URL}/services/alakeifak/${slug}`,
    `${BASE_URL}/services/alakeifak`,
  ]);

  const res = http.get(endpoint);

  check(res, {
    'API endpoint responds': (r) => r.status === 200 || r.status === 304,
    'API responds under 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO 4: SECURITY PROBE
// Verifies that protected endpoints reject unauthorized access
// ═══════════════════════════════════════════════════════════════
export function securityProbe() {
  group('Security - Upload Without Auth', () => {
    const res = http.post(`${BASE_URL}/api/alakeifak/upload`, {});
    check(res, {
      'Upload rejects unauthenticated': (r) => r.status === 401 || r.status === 400,
    });
  });

  group('Security - Revalidate Without Auth', () => {
    const res = http.post(
      `${BASE_URL}/api/alakeifak/revalidate`,
      JSON.stringify({ slug: 'test-hack' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    // Revalidate should work (it's a webhook) but should not crash
    check(res, {
      'Revalidate does not crash': (r) => r.status < 500,
    });
  });

  group('Security - 404 Handling', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak/this-restaurant-does-not-exist-xyzzy`);
    check(res, {
      'Fake slug returns 404': (r) => r.status === 404,
    });
  });

  group('Security - Reserved Slug Protection', () => {
    ['partner', 'admin', 'migrations'].forEach((reserved) => {
      const res = http.get(`${BASE_URL}/services/alakeifak/${reserved}`);
      check(res, {
        [`Reserved /${reserved} handled safely`]: (r) =>
          r.status === 200 || r.status === 404 || r.status === 302,
      });
    });
  });

  // Try to read orders via direct REST API (should be blocked by RLS)
  if (SUPABASE_ANON_KEY) {
    group('Security - Direct Orders Read (RLS)', () => {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      };
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/orders?select=*`,
        { headers }
      );
      check(res, {
        'RLS blocks direct order read': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body) && body.length === 0;
          } catch {
            return r.status === 403 || r.status === 401;
          }
        },
      });
    });

    group('Security - Direct Members Read (RLS)', () => {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      };
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/restaurant_members?select=*`,
        { headers }
      );
      check(res, {
        'RLS blocks direct members read': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body) && body.length === 0;
          } catch {
            return r.status === 403 || r.status === 401;
          }
        },
      });
    });
  }
}
