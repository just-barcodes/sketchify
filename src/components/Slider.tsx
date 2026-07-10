import { useId } from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  /** Text shown on the right; defaults to the numeric value. */
  valueLabel?: string;
  disabled?: boolean;
}

/** A labelled range input with a live value readout. */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  valueLabel,
  disabled = false,
}: SliderProps) {
  const id = useId();
  return (
    <div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <span className={styles.value}>{valueLabel ?? value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
