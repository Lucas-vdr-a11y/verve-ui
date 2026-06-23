import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Meter.css";

export type MeterSize = "sm" | "md" | "lg";

export interface MeterProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue"
  > {
  /** Current measured value. */
  value: number;
  /** Lower bound of the range. Defaults to `0`. */
  min?: number;
  /** Upper bound of the range. Defaults to `1`. */
  max?: number;
  /** Upper bound of the "low" (suboptimal-low) region. */
  low?: number;
  /** Lower bound of the "high" (suboptimal-high) region. */
  high?: number;
  /**
   * The optimum value. Determines which regions count as good/ok/bad and
   * drives the recoloring (like the native `<meter>` element).
   */
  optimum?: number;
  /** Visible label rendered above the track. */
  label?: React.ReactNode;
  /**
   * Value text shown next to the label. Pass a node to override, or `false`
   * to hide. Defaults to a percentage of the range.
   */
  valueText?: React.ReactNode | false;
  /** Bar thickness. Defaults to `"md"`. */
  size?: MeterSize;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Returns a quality bucket ("good" | "ok" | "bad") following the semantics of
 * the native <meter> element's low/high/optimum thresholds.
 */
function getQuality(
  value: number,
  low: number,
  high: number,
  optimum: number
): "good" | "ok" | "bad" {
  // Which segment is optimum in? low region, middle, or high region.
  const optimumInLow = optimum <= low;
  const optimumInHigh = optimum >= high;

  if (optimumInLow) {
    // Lower is better.
    if (value <= low) return "good";
    if (value <= high) return "ok";
    return "bad";
  }
  if (optimumInHigh) {
    // Higher is better.
    if (value >= high) return "good";
    if (value >= low) return "ok";
    return "bad";
  }
  // Optimum in the middle: the middle band is good.
  if (value >= low && value <= high) return "good";
  return "ok";
}

/**
 * Meter — a labeled measurement bar for a quantitative value within a known
 * range. Recolors based on low/high/optimum thresholds. For task completion
 * use Progress instead.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 1,
    low,
    high,
    optimum,
    label,
    valueText,
    size = "md",
    className,
    ...rest
  },
  ref
) {
  const lo = low ?? min;
  const hi = high ?? max;
  const opt = optimum ?? max;

  const clamped = clamp(value, min, max);
  const range = max - min || 1;
  const fraction = (clamped - min) / range;
  const percent = Math.round(fraction * 100);

  const quality = getQuality(clamped, lo, hi, opt);

  const resolvedValueText =
    valueText === false
      ? null
      : valueText !== undefined
      ? valueText
      : `${percent}%`;

  return (
    <div
      ref={ref}
      className={cn("nova-meter", `nova-meter--${size}`, className)}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={typeof label === "string" ? label : undefined}
      {...rest}
    >
      {(label != null || resolvedValueText != null) && (
        <div className="nova-meter__header">
          {label != null && <span className="nova-meter__label">{label}</span>}
          {resolvedValueText != null && (
            <span className="nova-meter__value">{resolvedValueText}</span>
          )}
        </div>
      )}
      <div className="nova-meter__track">
        <div
          className={cn(
            "nova-meter__fill",
            `nova-meter__fill--${quality}`
          )}
          style={{ inlineSize: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
});
