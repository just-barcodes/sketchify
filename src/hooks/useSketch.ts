import { useEffect, useRef, useState } from 'react';
import { toImageData } from '../lib/image.ts';
import type { SketchParams } from '../sketch/types.ts';
import type { SketchRequest, SketchResponse } from '../sketch/sketch.worker.ts';

/** Coalesce rapid slider changes before kicking off a re-render. */
const DEBOUNCE_MS = 55;

interface UseSketchResult {
  sketch: ImageData | null;
  processing: boolean;
}

/**
 * Render `original` into a pencil sketch on a Web Worker whenever the image or
 * `params` change, debounced so dragging a slider doesn't queue a job per pixel.
 * The worker keeps the pixel loop off the main thread so the UI stays smooth.
 */
export function useSketch(original: ImageData | null, params: SketchParams): UseSketchResult {
  const [sketch, setSketch] = useState<ImageData | null>(null);
  const [processing, setProcessing] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const latestId = useRef(0);

  // One worker for the component's lifetime.
  useEffect(() => {
    const worker = new Worker(new URL('../sketch/sketch.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<SketchResponse>) => {
      if (e.data.id !== latestId.current) return; // a newer request superseded this one
      setSketch(toImageData(e.data.result));
      setProcessing(false);
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Re-process (debounced) on image or parameter change.
  useEffect(() => {
    const worker = workerRef.current;
    if (!original || !worker) {
      setSketch(null);
      setProcessing(false);
      return;
    }

    setProcessing(true);
    const handle = window.setTimeout(() => {
      const id = ++latestId.current;
      const request: SketchRequest = { id, image: original, params };
      worker.postMessage(request);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [original, params]);

  return { sketch, processing };
}
