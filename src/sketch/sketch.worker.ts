/// <reference lib="webworker" />
import { toSketch } from './sketch.ts';
import type { ImageDataLike, SketchParams } from './types.ts';

export interface SketchRequest {
  /** Monotonic id so the main thread can ignore stale results. */
  id: number;
  image: ImageDataLike;
  params: SketchParams;
}

export interface SketchResponse {
  id: number;
  result: ImageDataLike;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', (e: MessageEvent<SketchRequest>) => {
  const { id, image, params } = e.data;
  const result = toSketch(image, params);
  const response: SketchResponse = { id, result };
  // Transfer the output buffer back to avoid copying it across the boundary.
  ctx.postMessage(response, [result.data.buffer as ArrayBuffer]);
});
