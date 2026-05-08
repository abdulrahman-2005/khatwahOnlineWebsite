import imageCompression from 'browser-image-compression';

const MAX_RAW_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

/**
 * Validate an image file before processing.
 * @param {File} file
 */
export function validateImage(file) {
  if (!file) {
    throw new Error('لم يتم اختيار ملف.');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`نوع الملف غير مدعوم (${file.type || 'unknown'}). استخدم PNG أو JPG أو WebP.`);
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_RAW_SIZE_MB) {
    throw new Error(`حجم الملف كبير جداً (${sizeMB.toFixed(1)} MB). الحد الأقصى ${MAX_RAW_SIZE_MB} MB.`);
  }
}

/**
 * Compress an image to WebP. Runs entirely in the browser.
 * @param {File} file
 * @param {Object} overrides
 * @returns {Promise<File>}
 */
export async function compressImage(file, overrides = {}) {
  validateImage(file);

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
    ...overrides,
  };

  try {
    const compressed = await imageCompression(file, options);

    if (process.env.NODE_ENV === 'development') {
      const before = (file.size / 1024).toFixed(0);
      const after = (compressed.size / 1024).toFixed(0);
      console.log(`[imageUtils] Compressed: ${before}KB → ${after}KB (${((1 - compressed.size / file.size) * 100).toFixed(0)}% reduction)`);
    }

    return compressed;
  } catch (error) {
    console.error('[imageUtils] Compression failed:', error);
    throw new Error('فشل ضغط الصورة. حاول بصورة أصغر أو بصيغة مختلفة (PNG/JPG).');
  }
}

/**
 * Compress a logo (smaller dimensions, higher quality).
 * @param {File} file
 * @returns {Promise<File>}
 */
export function compressLogo(file) {
  return compressImage(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 400,
    initialQuality: 0.85,
  });
}

/**
 * Convert a File to a base64 data URL for instant preview.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('فشل قراءة الملف.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a pre-compressed image to R2 via the API route.
 * 
 * Flow: browser (compressed WebP ~200-500KB) → POST /api/alakeifak/upload → R2
 * The API route is a thin proxy — no heavy work on Vercel.
 * 
 * @param {File} compressedFile - Already compressed by compressImage/compressLogo
 * @param {'logos'|'items'|'banners'} folder - Target folder in R2
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadImage(compressedFile, folder) {
  const { supabase } = await import('./supabaseClient.js');
  let accessToken = null;

  try {
    // 1. Try to get a fresh token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (session) {
      // Refresh it to be 100% sure it's valid for the upcoming upload
      const { data: refreshData } = await supabase.auth.refreshSession();
      accessToken = refreshData?.session?.access_token || session.access_token;
    }
  } catch (err) {
    console.warn('[imageUtils] Session check failed:', err);
  }

  if (!accessToken) {
    throw new Error('يجب تسجيل الدخول أولاً لرفع الصور. حاول تحديث الصفحة.');
  }

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('folder', folder);

  let response;
  try {
    response = await fetch('/api/alakeifak/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData,
      credentials: 'omit', // 👈 Prevent 431 errors by not sending heavy browser cookies
    });
  } catch (netErr) {
    console.error('[imageUtils] Fetch crash:', netErr);
    throw new Error('فشل الاتصال بالخادم (Network Error). تأكد من جودة الإنترنت.');
  }

  const contentType = response.headers.get("content-type");
  let result = {};
  let rawText = "";

  try {
    rawText = await response.text();
    if (contentType && contentType.includes("application/json")) {
      result = JSON.parse(rawText);
    }
  } catch (parseErr) {
    console.error('[imageUtils] Response parse failed:', rawText);
  }

  if (!response.ok) {
    // Detailed error reporting
    if (response.status === 401) throw new Error('انتهت صلاحية الجلسة. يرجى إعادة تسجيل الدخول.');
    if (response.status === 413) throw new Error('حجم الملف كبير جداً بالنسبة للخادم.');
    
    // If the server gave us a specific JSON error, show it. 
    // Otherwise show the status code and first few chars of whatever the server sent.
    const serverError = result.error || (rawText ? `Server Error: ${rawText.substring(0, 50)}...` : `Error ${response.status}`);
    throw new Error(serverError);
  }

  if (!result.url) {
    throw new Error('لم يتم استلام رابط الصورة. تأكد من إعدادات R2 في ملف .env');
  }

  return result.url;
}
