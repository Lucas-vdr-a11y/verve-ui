import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./RangeSlider.css";

export type RangeSliderSize = "sm" | "md" | "lg";

/** A `[min, max]` tuple. */
export type RangeValue = [number, number];

export interface RangeSliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: RangeSliderSize;
  /** Minimum bound. Defaults to `0`. */
  min?: number;
  /** Maximum bound. Defaults to `100`. */
  max?: number;
  /** Step increment. Defaults to `1`. */
  step?: number;
  /** Controlled `[start, end]` value. */
  value?: RangeValue;
  /** Initial value for uncontrolled usage. Defaults to `[min, max]`. */
  defaultValue?: RangeValue;
  /** Fired with the new `[start, end]` tuple. */
  onChange?: (value: RangeValue) => void;
  /** Minimum allowed distance between the two thumbs. Defaults to `0`. */
  minDistance?: number;
  /** Format the aria value text for each thumb. */
  formatValue?: (value: number) => string;
  /** Accessible label for the lower thumb. */
  startLabel?: string;
  /** Accessible label for the upper thumb. */
  endLabel?: string;
  /** Marks the control as invalid. */
  invalid?: boolean;
  /** Disables the control. */
  disabled?: boolean;
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(
    {
      size = "md",
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onChange,
      minDistance = 0,
      formatValue,
      startLabel = "Minimum",
      endLabel = "Maximum",
      invalid = false,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<RangeValue>(
      defaultValue ?? [min, max]
    );
    const current = isControlled ? (value as RangeValue) : internal;
    const [low, high] = current;

    const commit = useCallback(
      (next: RangeValue) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const handleLow = useCallback(
      (raw: number) => {
        const next = clamp(raw, min, high - minDistance);
        if (next !== low) commit([next, high]);
      },
      [min, high, minDistance, low, commit]
    );

    const handleHigh = useCallback(
      (raw: number) => {
        const next = clamp(raw, low + minDistance, max);
        if (next !== high) commit([low, next]);
      },
      [max, low, minDistance, high, commit]
    );

    const range = max - min;
    const lowPct = range > 0 ? ((low - min) / range) * 100 : 0;
    const highPct = range > 0 ? ((high - min) / range) * 100 : 0;
    const fillLeft = clamp(lowPct, 0, 100);
    const fillRight = clamp(highPct, 0, 100);

    const text = (n: number) => (formatValue ? formatValue(n) : String(n));

    return (
      <div
        ref={ref}
        className={cn(
          "nova-range-slider",
          `nova-range-slider--${size}`,
          invalid && "nova-range-slider--invalid",
          disabled && "nova-range-slider--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        style={{
          ["--nova-range-from" as string]: `${fillLeft}%`,
          ["--nova-range-to" as string]: `${fillRight}%`,
        }}
        {...rest}
      >
        <span className="nova-range-slider__track" aria-hidden="true">
          <span className="nova-range-slider__fill" />
        </span>

        {/* Lower thumb input */}
        <input
          type="range"
          className="nova-range-slider__input nova-range-slider__input--low nova-focusable"
          min={min}
          max={max}
          step={step}
          value={low}
          disabled={disabled}
          aria-label={startLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={low}
          aria-valuetext={formatValue ? text(low) : undefined}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleLow(Number(e.target.value))}
        />

        {/* Upper thumb input */}
        <input
          type="range"
          className="nova-range-slider__input nova-range-slider__input--high nova-focusable"
          min={min}
          max={max}
          step={step}
          value={high}
          disabled={disabled}
          aria-label={endLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={high}
          aria-valuetext={formatValue ? text(high) : undefined}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleHigh(Number(e.target.value))}
        />

        <span
          className="nova-range-slider__thumb nova-range-slider__thumb--low"
          aria-hidden="true"
          style={{ left: `${fillLeft}%` }}
        />
        <span
          className="nova-range-slider__thumb nova-range-slider__thumb--high"
          aria-hidden="true"
          style={{ left: `${fillRight}%` }}
        />
      </div>
    );
  }
);
