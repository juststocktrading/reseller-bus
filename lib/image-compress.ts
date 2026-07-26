const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 80;

function canvasSupportsWebp(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function toBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Downscales + re-encodes an image client-side until it fits under maxBytes.
 * Runs entirely in the browser so Cloudinary never receives an oversized upload.
 */
export async function compressImageToMaxSize(file: File, maxBytes = 50 * 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const mimeType = canvasSupportsWebp() ? 'image/webp' : 'image/jpeg';

  let width = bitmap.width;
  let height = bitmap.height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  let quality = 0.82;
  let best: Blob | null = null;

  for (let attempt = 0; attempt < 14; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await toBlob(canvas, mimeType, quality);
    if (blob) {
      best = blob;
      if (blob.size <= maxBytes) break;
    }

    if (quality > 0.35) {
      quality -= 0.12;
    } else {
      width = Math.round(width * 0.82);
      height = Math.round(height * 0.82);
      quality = 0.6;
    }

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) break;
  }

  bitmap.close();
  if (!best) throw new Error('Failed to compress image');
  return best;
}
