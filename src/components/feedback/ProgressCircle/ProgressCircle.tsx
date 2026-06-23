import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressCircle.css";

export type ProgressCircleTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface ProgressCircleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Current value. Ignored when `indeterminate`. Defaults to `0`. */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Animated unknown-progress state (continuous spin). */
  indeterminate?: boolean;
  /** Diameter in px. Defaults to `48`. */
  size?: number;
  /** Stroke thickness in px. Defaults to `4`. */
  thickness?: number;
  /** Color tone. Defaults to `"primary"`. */
  tone?: ProgressCircleTone;
  /** Accessible label for the progressbar. */
  label?: string;
  /** Center content. Pass `true` to auto-render the percentage. */
  centerLabel?: React.ReactNode | boolean;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  function ProgressCircle(
    {
      value = 0,
      max = 100,
      indeterminate = false,
      size = 48,
      thickness = 4,
      tone = "primary",
      label,
      centerLabel,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const safeMax = max > 0 ? max : 100;
    const clamped = clamp(value, 0, safeMax);
    const percent = (clamped / safeMax) * 100;

    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Indeterminate uses a fixed arc; determinate uses a dash offset.
    const dashOffset = indeterminate
      ? circumference * 0.7
      : circumference * (1 - percent / 100);

    const renderCenter =
      centerLabel === true
        ? `${Math.round(percent)}%`
        : centerLabel === false || centerLabel == null
        ? null
        : centerLabel;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={cn(
          "nova-progress-circle",
          `nova-progress-circle--${tone}`,
          indeterminate && "nova-progress-circle--indeterminate",
          className
        )}
        style={{ inlineSize: size, blockSize: size, ...style }}
        {...rest}
      >
        <svg
          className="nova-progress-circle__svg"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className="nova-progress-circle__track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
          />
          <circle
            className="nova-progress-circle__indicator"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {renderCenter != null && (
          <span className="nova-progress-circle__label">{renderCenter}</span>
        )}
      </div>
    );
  }
);
