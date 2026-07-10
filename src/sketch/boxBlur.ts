/**
 * Separable box blur over a single-channel `Float32Array` image.
 *
 * Runs a horizontal then a vertical moving-average pass, each in O(w*h)
 * regardless of radius by adding the entering sample and subtracting the
 * leaving one. Edges use clamp-to-border (nearest valid pixel).
 *
 * @param src single-channel image, length `w * h`, row-major
 * @param w   image width in pixels
 * @param h   image height in pixels
 * @param r   blur radius; the averaging window spans `2r + 1` samples
 * @returns a new blurred buffer (the input is not mutated)
 */
export function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const norm = 1 / (2 * r + 1);

  // Horizontal pass: src -> tmp
  for (let y = 0; y < h; y++) {
    const off = y * w;
    let sum = 0;
    for (let i = -r; i <= r; i++) {
      const x = i < 0 ? 0 : i >= w ? w - 1 : i;
      sum += src[off + x];
    }
    for (let x = 0; x < w; x++) {
      tmp[off + x] = sum * norm;
      const ai = x + r + 1 >= w ? w - 1 : x + r + 1; // sample entering the window
      const si = x - r < 0 ? 0 : x - r; // sample leaving the window
      sum += src[off + ai] - src[off + si];
    }
  }

  // Vertical pass: tmp -> out
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let i = -r; i <= r; i++) {
      const y = i < 0 ? 0 : i >= h ? h - 1 : i;
      sum += tmp[y * w + x];
    }
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum * norm;
      const ai = y + r + 1 >= h ? h - 1 : y + r + 1;
      const si = y - r < 0 ? 0 : y - r;
      sum += tmp[ai * w + x] - tmp[si * w + x];
    }
  }

  return out;
}
