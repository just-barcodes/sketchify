import { boxBlur } from './boxBlur.ts';
import { hexToRgb, type Rgb } from '../lib/color.ts';
import type { ImageDataLike, SketchParams } from './types.ts';

/** Rec. 601 luma weights for RGB -> grayscale. */
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

/** Largest blur radius (at detail = 0). Detail = 100 gives the minimum. */
const MAX_BLUR_RADIUS = 14;

/** Line colours per pencil medium (graphite/charcoal are near-black inks). */
const GRAPHITE_INK: Rgb = [34, 34, 34];
const CHARCOAL_INK: Rgb = [14, 14, 14];
/** Colored pencil keeps the source hue, dimmed toward the paper. */
const COLORED_SCALE = 0.72;
/** Charcoal presses darker by lowering the effective gamma. */
const CHARCOAL_DARK_BOOST = 1.7;

const CREAM_PAPER: Rgb = [239, 231, 214];
const WHITE_PAPER: Rgb = [255, 255, 255];

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function paperRgb(params: SketchParams): Rgb {
  switch (params.background) {
    case 'paper':
      return CREAM_PAPER;
    case 'custom':
      return hexToRgb(params.paperColor);
    default:
      return WHITE_PAPER; // 'white' and 'transparent' composite over white
  }
}

/**
 * Convert a photo into a pencil sketch.
 *
 * Pipeline (per the classic "color dodge" sketch technique):
 *   1. grayscale the source, and keep its inverse
 *   2. blur the inverse twice (box blur; radius set by `detail`)
 *   3. color-dodge blend gray over the blurred inverse -> a soft "highlight" map
 *   4. apply contrast/brightness, then a gamma curve (`intensity`) to get the
 *      per-pixel line amount
 *   5. composite the pencil ink over the chosen paper (or export alpha for a
 *      transparent background)
 *
 * Pure and DOM-free: give it any {@link ImageDataLike} and it returns a fresh one.
 */
export function toSketch(image: ImageDataLike, params: SketchParams): ImageDataLike {
  const { width: w, height: h } = image;
  const n = w * h;
  const src = image.data;

  // 1. grayscale + inverse
  const gray = new Float32Array(n);
  const inv = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const g = LUMA_R * src[p] + LUMA_G * src[p + 1] + LUMA_B * src[p + 2];
    gray[i] = g;
    inv[i] = 255 - g;
  }

  // 2. blur the inverse twice; higher detail -> smaller radius -> finer lines
  const radius = Math.max(1, Math.round(((100 - params.detail) / 100) * MAX_BLUR_RADIUS) + 1);
  const blurred = boxBlur(boxBlur(inv, w, h, radius), w, h, radius);

  // Precompute the tone-mapping curve parameters.
  const gamma = 1.6 - (params.intensity / 100) * 1.25;
  const darkBoost = params.type === 'charcoal' ? CHARCOAL_DARK_BOOST : 1;
  const gEff = Math.max(0.14, gamma / darkBoost);
  const contrast = 0.55 + (params.contrast / 50) * 1.5;
  const brightnessShift = ((params.brightness - 50) / 50) * 0.35;

  const transparent = params.background === 'transparent';
  const [pr, pg, pb] = paperRgb(params);
  const { type } = params;

  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const p = i * 4;

    // 3. color dodge: gray / (1 - blurred)
    let dodge = (gray[i] * 255) / (255 - blurred[i] + 1);
    if (dodge > 255) dodge = 255;

    // 4. contrast + brightness, then gamma -> line amount (0 = paper, 1 = full ink)
    let s = dodge / 255;
    s = (s - 0.5) * contrast + 0.5 + brightnessShift;
    s = clamp01(s);
    const lineAmt = clamp01(Math.pow(1 - s, gEff));
    const paperAmt = 1 - lineAmt;

    // 5a. pick the ink colour
    let lr: number;
    let lg: number;
    let lb: number;
    if (type === 'colored') {
      lr = src[p] * COLORED_SCALE;
      lg = src[p + 1] * COLORED_SCALE;
      lb = src[p + 2] * COLORED_SCALE;
    } else if (type === 'charcoal') {
      [lr, lg, lb] = CHARCOAL_INK;
    } else {
      [lr, lg, lb] = GRAPHITE_INK;
    }

    // 5b. composite over paper, or keep ink with alpha for transparent export
    if (transparent) {
      out[p] = lr;
      out[p + 1] = lg;
      out[p + 2] = lb;
      out[p + 3] = lineAmt * 255;
    } else {
      out[p] = lr * lineAmt + pr * paperAmt;
      out[p + 1] = lg * lineAmt + pg * paperAmt;
      out[p + 2] = lb * lineAmt + pb * paperAmt;
      out[p + 3] = 255;
    }
  }

  return { data: out, width: w, height: h };
}
