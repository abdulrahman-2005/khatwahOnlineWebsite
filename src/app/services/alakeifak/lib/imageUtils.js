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
 * @param {'logos'|'items'} folder - Target folder in R2
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadImage(compressedFile, folder) {
  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('folder', folder);

  const response = await fetch('/api/alakeifak/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('[imageUtils] Upload failed:', result);
    throw new Error(result.error || 'فشل رفع الصورة. حاول مرة أخرى.');
  }

  return result.url;
}
