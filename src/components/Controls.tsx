import { type Dispatch } from 'react';
import { SegmentedControl, type SegmentOption } from './SegmentedControl.tsx';
import { Slider } from './Slider.tsx';
import { type SketchAction } from '../state/sketchParams.ts';
import type { Background, ExportFormat, PencilType, SketchParams } from '../sketch/types.ts';
import styles from './Controls.module.css';

const PENCIL_OPTIONS: SegmentOption<PencilType>[] = [
  { value: 'graphite', label: 'Graphite' },
  { value: 'charcoal', label: 'Charcoal' },
  { value: 'colored', label: 'Colored' },
];

const PAPER_OPTIONS: SegmentOption<Background>[] = [
  { value: 'white', label: 'White' },
  { value: 'paper', label: 'Cream' },
  { value: 'transparent', label: 'None' },
];

const FORMAT_OPTIONS: SegmentOption<ExportFormat>[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'webp', label: 'WEBP' },
];

const FORMAT_NOTES: Record<ExportFormat, string> = {
  png: 'Lossless. Supports transparency.',
  jpg: 'Small file. No transparency (white fill).',
  webp: 'Best size-to-quality. Supports transparency.',
};

interface ControlsProps {
  params: SketchParams;
  dispatch: Dispatch<SketchAction>;
  format: ExportFormat;
  quality: number;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: number) => void;
  onDownload: () => void;
  canDownload: boolean;
}

export function Controls({
  params,
  dispatch,
  format,
  quality,
  onFormatChange,
  onQualityChange,
  onDownload,
  canDownload,
}: ControlsProps) {
  const patch = (patch: Partial<SketchParams>) => dispatch({ type: 'patch', patch });
  const customActive = params.background === 'custom';
  const qualityActive = format === 'jpg' || format === 'webp';

  return (
    <aside className={styles.panel}>
      <div>
        <div className={styles.sectionLabel}>Pencil</div>
        <SegmentedControl
          label="Pencil type"
          options={PENCIL_OPTIONS}
          value={params.type}
          onChange={(type) => patch({ type })}
        />
      </div>

      <div>
        <div className={styles.sectionLabel}>Paper</div>
        <SegmentedControl
          label="Paper background"
          options={PAPER_OPTIONS}
          value={params.background}
          onChange={(background) => patch({ background })}
        />
        <label className={`${styles.customPaper} ${customActive ? styles.customPaperActive : ''}`}>
          <span className={styles.swatch} style={{ background: params.paperColor }} />
          <span className={styles.customName}>Custom color</span>
          <span className={styles.customValue}>{params.paperColor.toUpperCase()}</span>
          <input
            type="color"
            className={styles.hiddenColor}
            value={params.paperColor}
            aria-label="Custom paper color"
            onChange={(e) => patch({ background: 'custom', paperColor: e.target.value })}
          />
        </label>
      </div>

      <div className={styles.divider} />

      <div className={styles.sliders}>
        <Slider
          label="Stroke intensity"
          value={params.intensity}
          onChange={(intensity) => patch({ intensity })}
        />
        <Slider
          label="Contrast"
          value={params.contrast}
          onChange={(contrast) => patch({ contrast })}
        />
        <Slider
          label="Brightness"
          value={params.brightness}
          onChange={(brightness) => patch({ brightness })}
        />
        <Slider label="Detail" value={params.detail} onChange={(detail) => patch({ detail })} />
      </div>

      <div className={styles.divider} />

      <div>
        <div className={styles.sectionLabel}>Export format</div>
        <SegmentedControl
          label="Export format"
          options={FORMAT_OPTIONS}
          value={format}
          onChange={onFormatChange}
        />
        <div className={styles.quality} style={{ opacity: qualityActive ? 1 : 0.45 }}>
          <Slider
            label="Quality"
            value={quality}
            min={10}
            max={100}
            onChange={onQualityChange}
            valueLabel={qualityActive ? `${quality}%` : 'n/a'}
            disabled={!qualityActive}
          />
          <div className={styles.note}>{FORMAT_NOTES[format]}</div>
        </div>
      </div>

      <button
        type="button"
        className={styles.download}
        onClick={onDownload}
        disabled={!canDownload}
      >
        <span aria-hidden="true">&#8595;</span> Download {format.toUpperCase()}
      </button>

      <button type="button" className={styles.reset} onClick={() => dispatch({ type: 'reset' })}>
        Reset controls
      </button>
    </aside>
  );
}
