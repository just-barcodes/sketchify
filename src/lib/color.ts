export type Rgb = readonly [number, number, number];

/**
 * Parse a CSS hex colour (`#rgb` or `#rrggbb`, with or without the `#`) into
 * an `[r, g, b]` triple of 0..255 channels. Falls back to white on bad input.
 */
export function hexToRgb(hex: string): Rgb {
  let h = (hex || '#ffffff').replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
