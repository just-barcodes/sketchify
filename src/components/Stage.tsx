import { useState, type DragEvent } from 'react';
import { ImageCanvas } from './ImageCanvas.tsx';
import { isImageFile } from '../lib/image.ts';
import styles from './Stage.module.css';

interface StageProps {
  original: ImageData | null;
  sketch: ImageData | null;
  /** Called with a dropped image file. */
  onFile: (file: File) => void;
  /** Open the file picker (empty-state click). */
  onPick: () => void;
}

/**
 * The preview area: a drop target that shows either the empty prompt or the
 * original photo beside its sketch.
 */
export function Stage({ original, sketch, onFile, onPick }: StageProps) {
  const [dragging, setDragging] = useState(false);
  const hasImage = original !== null && sketch !== null;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isImageFile(file)) onFile(file);
  }

  return (
    <div
      className={`${styles.stage} ${dragging ? styles.dragging : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {hasImage ? (
        <div className={styles.pair}>
          <figure className={styles.figure}>
            <figcaption className={styles.caption}>Original</figcaption>
            <div className={styles.imageWrap}>
              <ImageCanvas data={original} className={styles.canvas} label="Original photo" />
            </div>
          </figure>
          <figure className={styles.figure}>
            <figcaption className={styles.caption}>Sketch</figcaption>
            <div className={`${styles.imageWrap} ${styles.checker}`}>
              <ImageCanvas data={sketch} className={styles.canvas} label="Pencil sketch" />
            </div>
          </figure>
        </div>
      ) : (
        <button type="button" className={styles.empty} onClick={onPick}>
          <span className={styles.emptyIcon} aria-hidden="true">
            &#8593;
          </span>
          <span>
            <span className={styles.emptyTitle}>Drop a photo here</span>
            <span className={styles.emptyHint}>or click to browse &middot; JPG, PNG, WEBP</span>
          </span>
        </button>
      )}
    </div>
  );
}
