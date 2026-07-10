/** The pencil medium, which sets the line colour and darkness. */
export type PencilType = 'graphite' | 'charcoal' | 'colored';

/** The paper the sketch is drawn on. `custom` uses {@link SketchParams.paperColor}. */
export type Background = 'white' | 'paper' | 'transparent' | 'custom';

/** Downloadable image formats. */
export type ExportFormat = 'png' | 'jpg' | 'webp';

/**
 * Everything the sketch algorithm needs to turn a photo into a drawing.
 * Slider values are 0..100; the algorithm maps them onto its internal ranges.
 */
export interface SketchParams {
  type: PencilType;
  background: Background;
  /** Hex colour (e.g. `#d8c7a8`) used when `background === 'custom'`. */
  paperColor: string;
  /** Stroke intensity 0..100 — how dark and heavy the pencil lines are. */
  intensity: number;
  /** Contrast 0..100. */
  contrast: number;
  /** Brightness 0..100 (50 is neutral). */
  brightness: number;
  /** Detail 0..100 — higher keeps finer lines (smaller blur radius). */
  detail: number;
}

/**
 * A structural stand-in for the DOM `ImageData` so the pure algorithm can run
 * in a Web Worker, on the main thread, and in Node tests without a DOM.
 */
export interface ImageDataLike {
  data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

/** Default parameters, matching the original design's initial look. */
export const DEFAULT_PARAMS: SketchParams = {
  type: 'graphite',
  background: 'white',
  paperColor: '#d8c7a8',
  intensity: 70,
  contrast: 26,
  brightness: 38,
  detail: 62,
};
