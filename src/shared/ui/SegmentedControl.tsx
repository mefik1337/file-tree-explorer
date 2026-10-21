import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import styles from './SegmentedControl.module.css';

type Option<T extends string> = {
  readonly value: T;
  readonly label: string;
};

type SegmentedControlProps<T extends string> = {
  readonly label: string;
  readonly options: readonly Option<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string | undefined;
};

const STEP_BY_KEY: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) => {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP_BY_KEY[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const nextIndex = (selectedIndex + step + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onChange(next.value);
    optionRefs.current[nextIndex]?.focus();
  };

  const thumbStyle = { '--count': options.length, '--index': selectedIndex } as CSSProperties;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`${styles.control} ${className ?? ''}`}
      style={thumbStyle}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.thumb} aria-hidden="true" />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => {
            optionRefs.current[index] = element;
          }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className={styles.option}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
