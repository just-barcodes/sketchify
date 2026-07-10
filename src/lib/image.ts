import type { ImageDataLike } from '../sketch/types.ts';

/** Longest side (in px) a source image is downscaled to before processing. */
export const MAX_DIMENSION = 1100;

/**
 * Wrap the algorithm's structural {@link ImageDataLike} in a real `ImageData`
 * for painting. Its buffer is always `ArrayBuffer`-backed at runtime; the cast
 * only narrows the intentionally-wide type used by the DOM-free core.
 */
export function toImageData(img: ImageDataLike): ImageData {
  return new ImageData(img.data as Uint8ClampedArray<ArrayBuffer>, img.width, img.height);
}

/** True for files the browser can decode as a raster image. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Decode an image file and return its pixels as `ImageData`, downscaled so the
 * longest side is at most {@link MAX_DIMENSION}. Keeps processing fast and bounds
 * memory regardless of the original resolution.
 */
export async function loadImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get a 2D canvas context');

    ctx.drawImage(bitmap, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  } finally {
    bitmap.close();
  }
}
