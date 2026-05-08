The complete guide is already written — check it out here: **[Security & Load Testing Guide](file:///C:/Users/bodya/.gemini/antigravity/brain/a5e3b67b-1690-46f6-889a-d38704b21660/artifacts/security_and_load_testing_guide.md)**

But let me give you a quick plain-language breakdown right here since you said you have no experience with this:

---

### What We Built (Test File Map)

```
__tests__/
├── unit/                          ← No keys needed, no server needed
│   ├── cartStore.test.js          ← Tests your shopping cart math
│   ├── whatsappUtils.test.js      ← Tests phone formatting + WhatsApp URLs
│   └── imageUtils.test.js         ← Tests upload validation rules
├── integration/                   ← No keys needed, mocks Supabase
│   └── api.test.js                ← Tests your API routes (manifest, upload, revalidate)
└── k6/                            ← Needs keys + running server
    ├── load-test.js               ← Simulates 150 users browsing your site
    └── security-audit.js          ← Checks if your database is leaking data
```

---

### Step 1: Unit Tests (`npm test`) — No Keys Needed

These run **instantly** in your terminal. No server, no database, no keys. They test pure JavaScript logic.

**What they check:**
- **Cart Store**: "If I add كريب بانيه (70 EGP) + مخلل (15 EGP), does the total equal 85?" — "If I add the same item twice, does it merge into quantity 2 instead of two separate entries?" — "If I set quantity to 0, does the item get removed?"
- **WhatsApp Utils**: "If someone types `01012345678`, does it get formatted to `+201012345678`?" — "Does the WhatsApp URL work on iOS Safari (special character encoding)?"
- **Image Utils**: "Does the upload reject `.png` files?" — "Does it reject files over 1MB?" — "Does it reject a folder name like `../../etc`?"

**How to run:**
```bash
npx vitest run
```

**What you'll see:**
```
 ✓ CartStore > Adding Items > should add an item to empty cart
 ✓ CartStore > Adding Items > should merge identical items
 ✓ CartStore > Price Calculations > should calculate subtotal correctly
 ✗ CartStore > Price Calculations > should calculate total   ← THIS MEANS A BUG
```
Green ✓ = pass, Red ✗ = your code has a bug in that specific calculation.

---

### Step 2: API Integration Tests (`npm test`) — No Keys Needed

These also run with `npx vitest run` (same command, they're included). They use **fake/mocked** Supabase data so they don't touch your real database.

**What they check:**
- "Does `/api/alakeifak/manifest?slug=main` return a valid PWA manifest with icons?"
- "Does `/api/alakeifak/upload` return 401 if no one is logged in?" (upload security gate)
- "Does `/api/alakeifak/revalidate` reject a request with no slug?"

---

### Step 3: Load Test (k6) — Needs Running Server

This is the "simulate 150 people on Eid night" test.

**Before running, you need to:**

1. **Edit `load-test.js`** — Replace the placeholder slugs with real ones from your database:
   ```javascript
   const RESTAURANT_SLUGS = [
     'your-actual-slug-here',    // e.g. 'el-maria'
     'another-real-slug',
   ];
   const SAMPLE_RESTAURANT_IDS = [
     'your-actual-restaurant-uuid',  // from Supabase
   ];
   ```

2. **Build and start production server** (in one terminal):
   ```bash
   npm run build
   npm start
   ```

3. **Run the load test** (in a second terminal):
   ```bash
   k6 run src/app/services/alakeifak/__tests__/k6/load-test.js
   ```

   To also test order submission via Supabase RPC, pass your anon key:
   ```bash
   k6 run -e SUPABASE_ANON_KEY=sb_publishable_g9zl82Jrqcgn4MQ43_UrRQ_rOQql2Ma src/app/services/alakeifak/__tests__/k6/load-test.js
   ```

**What you'll see:**
k6 prints a live dashboard showing how many virtual users are active, then a final report:
```
     ✓ Menu returns 200
     ✓ Directory returns 200
     ✗ response under 500ms   ← BOTTLENECK FOUND

     menu_page_duration......: avg=320ms  p(95)=780ms
     orders_placed...........: 47
     error_rate..............: 1.2%

     ✓ http_req_duration......: p(95)=890ms < 1000ms  ← PASSED threshold
     ✗ error_rate.............: 1.2% > 2%             ← FAILED threshold
```

If a threshold shows ✗, it means your site isn't fast enough or is dropping requests under that load level. If everything is ✓, you're ready for Eid.

---

### Step 4: Security Audit (k6) — Needs Your Anon Key

This is the test that checks **"can a hacker read my orders with just the public key?"** — exactly the vulnerability you discovered with the `curl` command.

**How to run** (no server needed, it hits Supabase directly):
```bash
k6 run -e SUPABASE_URL=https://scoyqyidactgnejtnbhj.supabase.co -e SUPABASE_ANON_KEY=sb_publishable_g9zl82Jrqcgn4MQ43_UrRQ_rOQql2Ma src/app/services/alakeifak/__tests__/k6/security-audit.js
```

**What you'll see:**
```
     ✓ orders returns empty or 403
     ✓ restaurant_members returns empty or 403
     ✓ restaurant_payments returns empty or 403
     ✗ No phone numbers leaked          ← 🚨 DATA LEAK!

     data_leaks_found.......: 0         ← Must be 0 to pass
```

If `data_leaks_found` is anything above 0, you have a security hole that needs immediate fixing. This is the automated version of your `curl` command — run it after every RLS migration to make sure nothing regressed.

---

### Summary: What To Run and When

| When | Command | Keys Needed? |
|---|---|---|
| After editing any business logic | `npx vitest run` | No |
| Before deploying to production | `npm run build && npm start`, then `k6 run ...load-test.js` | Slugs from DB |
| After any RLS/SQL migration | `k6 run ...security-audit.js` with `-e` flags | Supabase anon key |
| Quick sanity check during dev | `npx vitest --watch` | No |