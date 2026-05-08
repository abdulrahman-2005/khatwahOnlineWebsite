/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — HEAVY K6 LOAD & STRESS TEST
 * ═══════════════════════════════════════════════════════════════
 *
 * This script simulates MASSIVE Eid-level traffic, scaled up to
 * 500 concurrent virtual users. 
 *
 * NOTE: Do not run this against `npm run dev`. To get accurate 
 * results, run: `npm run build && npm start` first!
 * ═══════════════════════════════════════════════════════════════
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
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

const RESTAURANT_SLUGS = ['test1', 'test2', 'test3'];
const SAMPLE_DELIVERY_ZONE_IDS = [
  '65428dd2-cc89-4f80-9a7f-ffbd8870f50d',
  'b0150b96-542b-4d51-a2c8-3a55adb7fd86',
  '074507d6-ddca-48bf-b208-b76ccdbc8a16',
  '2bc50ca2-0c7c-4c67-b52c-6e0268fc4ec6',
  'e4220235-2a8d-4456-9423-8887ef739c67',
  'd5434d86-84d4-4252-8389-4dc7493b9bc6'
];
const SAMPLE_RESTAURANT_IDS = [
  '542a04db-541f-4979-a2b6-3c127c2eda74',
  '2335a0e5-6326-4b9b-99e2-90718846081a',
  'a1ef3870-0890-4029-a023-702b19207db7',
];

// ── Test Scenarios ──────────────────────────────────────────────
export const options = {
  scenarios: {
    browsing_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },   // Aggressive warm up
        { duration: '1m', target: 100 },    // Hold steady
        { duration: '1m', target: 350 },    // Massive spike!
        { duration: '2m', target: 350 },    // Hold the spike
        { duration: '30s', target: 0 },     // Cool down
      ],
      exec: 'browsingUser',
    },
    ordering_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 75 },     // Spike orders
        { duration: '2m', target: 75 },
        { duration: '30s', target: 0 },
      ],
      exec: 'orderingUser',
    },
    api_stress: {
      executor: 'constant-arrival-rate',
      duration: '2m',
      rate: 100,         // 100 requests per second
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      exec: 'apiStress',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],   
    http_req_failed: ['rate<0.05'],      
    menu_page_duration: ['p(95)<800'],
    directory_page_duration: ['p(95)<600'],
    order_submit_duration: ['p(95)<2000'],
    error_rate: ['rate<0.05'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return `+2010${Math.floor(10000000 + Math.random() * 90000000)}`; }
function randomName() { return randomItem(['أحمد', 'محمد', 'فاطمة', 'سارة', 'عمر']); }

// ═══════════════════════════════════════════════════════════════
export function browsingUser() {
  group('01 - Directory Page', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak`);
    const passed = check(res, {
      'Directory returns 200': (r) => r.status === 200,
      'Directory has HTML content': (r) => r.body && r.body.includes('</html>'),
    });
    errorRate.add(!passed);
    directoryDuration.add(res.timings.duration);
    pageLoads.add(1);
  });

  sleep(Math.random() * 2 + 1);

  const slug = randomItem(RESTAURANT_SLUGS);
  group('02 - Restaurant Menu Page', () => {
    const res = http.get(`${BASE_URL}/services/alakeifak/${slug}`);
    const passed = check(res, {
      'Menu returns 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
    menuPageDuration.add(res.timings.duration);
    pageLoads.add(1);
  });

  sleep(Math.random() * 3 + 2);
}

// ═══════════════════════════════════════════════════════════════
export function orderingUser() {
  if (!SUPABASE_ANON_KEY) return;
  
  const restaurantId = randomItem(SAMPLE_RESTAURANT_IDS);
  const slug = randomItem(RESTAURANT_SLUGS);
  
  const resMenu = http.get(`${BASE_URL}/services/alakeifak/${slug}`);
  check(resMenu, { 'Menu page loads': (r) => r.status === 200 });
  
  sleep(Math.random() * 5 + 3);

  group('Order - Submit via RPC', () => {
    const orderPayload = {
      restaurant_id: restaurantId,
      total_amount: Math.floor(Math.random() * 300 + 50),
      cart_snapshot: [{
        itemName: 'وجبة ثقيلة',
        size: { id: 'test-size-1', name: 'كبير', price: 150 },
        extras: [],
        quantity: 2,
      }],
      customer_name: randomName(),
      customer_phone: randomPhone(),
      order_type: 'delivery',
      delivery_address: 'العنوان الجديد',
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
      'Order submission 200': (r) => r.status === 200,
    });

    errorRate.add(!passed);
    if (passed) ordersPlaced.add(1);
    orderSubmitDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 2 + 1);
}

// ═══════════════════════════════════════════════════════════════
export function apiStress() {
  const slug = randomItem(RESTAURANT_SLUGS);
  const endpoint = randomItem([
    `${BASE_URL}/api/alakeifak/manifest?slug=${slug}`,
    `${BASE_URL}/services/alakeifak/${slug}`,
  ]);

  const res = http.get(endpoint);
  const passed = check(res, { 'API responds': (r) => r.status === 200 || r.status === 304 });
  errorRate.add(!passed);
}
