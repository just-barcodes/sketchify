import { describe, it, expect } from 'vitest';
import { boxBlur } from './boxBlur.ts';

describe('boxBlur', () => {
  it('leaves a constant image unchanged', () => {
    const w = 5;
    const h = 4;
    const src = new Float32Array(w * h).fill(42);
    const out = boxBlur(src, w, h, 2);
    for (const v of out) expect(v).toBeCloseTo(42, 5);
  });

  it('spreads a single spike into its neighbours', () => {
    const w = 5;
    const h = 1;
    const src = new Float32Array([0, 0, 100, 0, 0]);
    const out = boxBlur(src, w, h, 1);
    // The spike's energy leaks outward: centre drops, neighbours rise.
    expect(out[2]).toBeLessThan(100);
    expect(out[1]).toBeGreaterThan(0);
    expect(out[3]).toBeGreaterThan(0);
  });

  it('conserves the total for a spike away from the border (radius 1)', () => {
    const w = 5;
    const h = 1;
    const src = new Float32Array([0, 0, 30, 0, 0]);
    const out = boxBlur(src, w, h, 1);
    // A 1-D radius-1 average with no edge clamping spreads 30 across 3 cells.
    expect(out[1] + out[2] + out[3]).toBeCloseTo(30, 5);
  });
});
