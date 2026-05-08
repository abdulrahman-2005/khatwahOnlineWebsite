/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — INTEGRATION TESTS: API Routes
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests the Next.js API route handlers directly:
 *  - /api/alakeifak/manifest
 *  - /api/alakeifak/upload (auth verification)
 *  - /api/alakeifak/revalidate
 *
 * Run:  npx vitest run src/app/services/alakeifak/__tests__/integration/api.test.js
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase for isolated testing
vi.mock('@/app/services/alakeifak/lib/supabaseServer', () => ({
  createServerSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                name: 'Test Restaurant',
                theme_color: '#ff6600',
                slug: 'test-rest',
              },
              error: null,
            }),
        }),
      }),
    }),
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
    },
  }),
}));

describe('Manifest API', () => {
  let GET;

  beforeAll(async () => {
    const mod = await import('../../../../api/alakeifak/manifest/route.js');
    GET = mod.GET;
  });

  it('should return main manifest for slug=main', async () => {
    const req = new Request('http://localhost/api/alakeifak/manifest?slug=main');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('على كيفك');
    expect(body.start_url).toContain('/services/alakeifak');
  });

  it('should return partner manifest for slug=partner', async () => {
    const req = new Request('http://localhost/api/alakeifak/manifest?slug=partner');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toContain('شركاء');
    expect(body.start_url).toContain('/partner');
  });

  it('should return restaurant-specific manifest for valid slug', async () => {
    const req = new Request('http://localhost/api/alakeifak/manifest?slug=test-rest');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('Test Restaurant');
    expect(body.theme_color).toBe('#ff6600');
    expect(body.start_url).toContain('test-rest');
  });

  it('should include PWA required fields', async () => {
    const req = new Request('http://localhost/api/alakeifak/manifest?slug=main');
    const res = await GET(req);
    const body = await res.json();

    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('short_name');
    expect(body).toHaveProperty('start_url');
    expect(body).toHaveProperty('display');
    expect(body).toHaveProperty('icons');
    expect(body.icons.length).toBeGreaterThan(0);
  });
});

describe('Upload API', () => {
  let POST;

  beforeAll(async () => {
    const mod = await import('../../../../api/alakeifak/upload/route.js');
    POST = mod.POST;
  });

  it('should reject unauthenticated requests with 401', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'image/webp' }));
    formData.append('folder', 'logos');

    const req = new Request('http://localhost/api/alakeifak/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe('Revalidate API', () => {
  let POST;

  beforeAll(async () => {
    const mod = await import('../../../../api/alakeifak/revalidate/route.js');
    POST = mod.POST;
  });

  it('should reject requests without slug', async () => {
    const req = new Request('http://localhost/api/alakeifak/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should accept valid revalidation requests', async () => {
    const req = new Request('http://localhost/api/alakeifak/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'test-rest' }),
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.revalidated).toBe(true);
  });
});
