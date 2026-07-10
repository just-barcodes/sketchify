import { useReducer, useRef, useState, type ChangeEvent } from 'react';
import { Controls } from './components/Controls.tsx';
import { Stage } from './components/Stage.tsx';
import { useSketch } from './hooks/useSketch.ts';
import { downloadSketch } from './lib/download.ts';
import { isImageFile, loadImageData } from './lib/image.ts';
import { sketchReducer } from './state/sketchParams.ts';
import { DEFAULT_PARAMS, type ExportFormat } from './sketch/types.ts';
import styles from './App.module.css';

export default function App() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [params, dispatch] = useReducer(sketchReducer, DEFAULT_PARAMS);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(92);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sketch, processing } = useSketch(original, params);

  function handleDownload() {
    if (sketch) void downloadSketch(sketch, format, quality);
  }

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
            <span className={styles.spacer} />
            {processing && (
              <span className={styles.processing} role="status">
                sketching&hellip;
              </span>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={onInputChange} hidden />
        </section>

        <Controls
          params={params}
          dispatch={dispatch}
          format={format}
          quality={quality}
          onFormatChange={setFormat}
          onQualityChange={setQuality}
          onDownload={handleDownload}
          canDownload={sketch !== null}
        />
      </main>
    </div>
  );
}
