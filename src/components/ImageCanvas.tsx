import { useEffect, useRef } from 'react';

interface ImageCanvasProps {
  data: ImageData;
  className?: string;
  /** Accessible description of what the canvas shows. */
  label: string;
}

/** A canvas that paints an `ImageData`, resizing itself to match. */
export function ImageCanvas({ data, className, label }: ImageCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext('2d')?.putImageData(data, 0, 0);
  }, [data]);

  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}
