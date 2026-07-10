import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Stage } from './components/Stage.tsx';
import { isImageFile, loadImageData, toImageData } from './lib/image.ts';
import { toSketch } from './sketch/sketch.ts';
import { DEFAULT_PARAMS } from './sketch/types.ts';
import styles from './App.module.css';

export default function App() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronous for now; moves to a debounced Web Worker in the next step.
  const sketch = useMemo<ImageData | null>(() => {
    if (!original) return null;
    return toImageData(toSketch(original, DEFAULT_PARAMS));
  }, [original]);

  async function handleFile(file: File) {
    if (!isImageFile(file)) return;
    setOriginal(await loadImageData(file));
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = ''; // allow re-selecting the same file
  }

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sketchify</h1>
          <p className={styles.tagline}>
            Turn any photo into a pencil sketch. Runs entirely in your browser.
          </p>
        </div>
        <span className={styles.privacy}>nothing is uploaded</span>
      </header>

      <main className={styles.layout}>
        <section className={styles.preview}>
          <Stage original={original} sketch={sketch} onFile={handleFile} onPick={openPicker} />

          <div className={styles.toolbar}>
            <button type="button" className={styles.uploadBtn} onClick={openPicker}>
              <span aria-hidden="true">&#8593;</span> Upload photo
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onInputChange}
            hidden
          />
        </section>

        {/* Controls sidebar goes here */}
      </main>
    </div>
  );
}
