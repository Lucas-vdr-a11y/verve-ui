import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressRing.css";

export type ProgressRingTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface ProgressRingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Current value. */
  value: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Diameter in pixels. Defaults to `64`. */
  size?: number;
  /** Stroke thickness in pixels. Defaults to `6`. */
  thickness?: number;
  /** Color tone. Defaults to `"primary"`. */
  tone?: ProgressRingTone;
  /**
   * Center label. Pass `true` to show an auto percentage, a node for custom
   * content, or omit/`false` for no label.
   */
  label?: React.ReactNode | boolean;
  /** Accessible label for the progress meter. */
  "aria-label"?: string;
}

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  function ProgressRing(
    {
      value,
      max = 100,
      size = 64,
      thickness = 6,
      tone = "primary",
      label,
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const safeMax = max <= 0 ? 1 : max;
    const clamped = Math.min(Math.max(value, 0), safeMax);
    const fraction = clamped / safeMax;
    const pct = Math.round(fraction * 100);

    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - fraction);
    const center = size / 2;

    const showLabel = label === true || (label != null && label !== false);
    const labelContent = label === true ? `${pct}%` : label;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-progress-ring",
          `nova-progress-ring--${tone}`,
          className
        )}
        style={{ width: size, height: size, ...style }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel ?? "Progress"}
        {...rest}
      >
        <svg
          className="nova-progress-ring__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className="nova-progress-ring__track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
          />
          <circle
            className="nova-progress-ring__indicator"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        {showLabel && (
          <span className="nova-progress-ring__label">{labelContent}</span>
        )}
      </div>
    );
  }
);
