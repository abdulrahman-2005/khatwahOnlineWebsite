import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/app/services/alakeifak/lib/supabaseServer";

/**
 * POST /api/alakeifak/upload
 * 
 * Receives a compressed image from the browser → uploads to R2 → returns CDN URL.
 * Images are compressed client-side to ~200-500KB before arriving here.
 * The CDN URL is then stored in Supabase and used directly by <img> tags.
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const MAX_SIZE = 1 * 1024 * 1024; // 1MB after compression
const ALLOWED_FOLDERS = ['logos', 'items', 'banners'];

export async function POST(request) {
  try {
    // ── Auth: Standard Bearer Token pattern ──
    // The client sends: Authorization: Bearer <access_token>
    // We verify the token with Supabase's getUser(token) which validates
    // the JWT signature server-side. This is the same pattern used by
    // Stripe, GitHub, and every major REST API.
    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: 'غير مصرح لك برفع الصور.' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح لك برفع الصور.' }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'ملف مطلوب' }, { status: 400 });
    }
    if (file.type !== 'image/webp') {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم. يجب أن يكون WebP.' }, { status: 400 });
    }
    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'مجلد غير صالح' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `الملف كبير (${(file.size / 1024).toFixed(0)}KB). الحد الأقصى 1MB.` },
        { status: 400 }
      );
    }
    if (!R2_BUCKET_NAME || !R2_PUBLIC_URL || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json(
        { error: 'R2 غير مكوّن. تحقق من متغيرات البيئة.' },
        { status: 500 }
      );
    }

    const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Return the R2 CDN URL. 
    // IMPORTANT: R2 public domains (like r2.dev) serve from the bucket root, 
    // so the bucket name should NOT be in the URL path.
    return NextResponse.json({ url: `${R2_PUBLIC_URL}/${key}` });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      context: 'R2_Upload',
      message: error?.message || 'Unknown upload error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    }));
    return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
  }
}
