import { describe, it, expect } from 'vitest';
import { toSketch } from './sketch.ts';
import { DEFAULT_PARAMS, type ImageDataLike, type SketchParams } from './types.ts';

/** Build a solid RGBA image of the given colour. */
function solid(w: number, h: number, r: number, g: number, b: number): ImageDataLike {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { data, width: w, height: h };
}

const params = (overrides: Partial<SketchParams> = {}): SketchParams => ({
  ...DEFAULT_PARAMS,
  ...overrides,
});

describe('toSketch', () => {
  it('preserves image dimensions', () => {
    const out = toSketch(solid(7, 5, 128, 128, 128), params());
    expect(out.width).toBe(7);
    expect(out.height).toBe(5);
    expect(out.data.length).toBe(7 * 5 * 4);
  });

  it('renders a blank white photo as (near) blank paper', () => {
    const out = toSketch(solid(4, 4, 255, 255, 255), params({ background: 'white' }));
    // No edges => no ink => paper shows through as white, fully opaque.
    for (let i = 0; i < 4 * 4; i++) {
      expect(out.data[i * 4]).toBeGreaterThan(250);
      expect(out.data[i * 4 + 3]).toBe(255);
    }
  });

  it('uses the cream paper colour for a blank photo', () => {
    const out = toSketch(solid(3, 3, 255, 255, 255), params({ background: 'paper' }));
    expect(out.data[0]).toBe(239);
    expect(out.data[1]).toBe(231);
    expect(out.data[2]).toBe(214);
  });

  it('produces (near) transparent output for a blank photo on a transparent background', () => {
    const out = toSketch(solid(4, 4, 255, 255, 255), params({ background: 'transparent' }));
    for (let i = 0; i < 4 * 4; i++) {
      expect(out.data[i * 4 + 3]).toBeLessThan(5);
    }
  });

  it('inks a fully black photo, with charcoal darker than graphite', () => {
    const black = solid(4, 4, 0, 0, 0);
    const graphite = toSketch(black, params({ type: 'graphite', background: 'white' }));
    const charcoal = toSketch(black, params({ type: 'charcoal', background: 'white' }));
    expect(graphite.data[0]).toBe(34);
    expect(charcoal.data[0]).toBe(14);
    expect(charcoal.data[0]).toBeLessThan(graphite.data[0]);
  });

  it('keeps source hue for a colored pencil (vs. neutral graphite ink)', () => {
    // On a transparent background the raw ink colour is written straight out.
    // Colored pencil dims the source red; graphite is neutral gray.
    const red = solid(4, 4, 200, 0, 0);
    const colored = toSketch(red, params({ type: 'colored', background: 'transparent' }));
    const graphite = toSketch(red, params({ type: 'graphite', background: 'transparent' }));
    expect(colored.data[0]).toBeGreaterThan(colored.data[1]);
    expect(colored.data[0]).toBeGreaterThan(colored.data[2]);
    expect(graphite.data[0]).toBe(graphite.data[1]);
    expect(graphite.data[1]).toBe(graphite.data[2]);
  });
});
