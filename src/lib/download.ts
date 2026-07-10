import type { ExportFormat } from '../sketch/types.ts';

const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

/** Paint an `ImageData` onto a fresh canvas. */
function imageToCanvas(image: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get a 2D canvas context');
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** JPEG has no alpha, so composite the sketch over white first. */
function flattenOnWhite(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get a 2D canvas context');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      type,
      quality,
    );
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Encode the sketch to the chosen format and start a browser download.
 * `quality` (0..100) applies to JPG/WEBP; PNG is always lossless.
 */
export async function downloadSketch(
  image: ImageData,
  format: ExportFormat,
  quality: number,
): Promise<void> {
  let canvas = imageToCanvas(image);
  if (format === 'jpg') canvas = flattenOnWhite(canvas);

  const encodeQuality = format === 'png' ? undefined : quality / 100;
  const blob = await canvasToBlob(canvas, MIME[format], encodeQuality);
  triggerDownload(blob, `sketch.${format}`);
}
