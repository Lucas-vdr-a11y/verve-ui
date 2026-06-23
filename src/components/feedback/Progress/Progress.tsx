import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Progress.css";

export type ProgressTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Current value. Ignored when `indeterminate`. Defaults to `0`. */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Animated unknown-progress state. */
  indeterminate?: boolean;
  /** Color tone. Defaults to `"primary"`. */
  tone?: ProgressTone;
  /** Track height on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ProgressSize;
  /** Accessible label for the progressbar. */
  label?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      value = 0,
      max = 100,
      indeterminate = false,
      tone = "primary",
      size = "md",
      label,
      className,
      ...rest
    },
    ref
  ) {
    const safeMax = max > 0 ? max : 100;
    const clamped = clamp(value, 0, safeMax);
    const percent = (clamped / safeMax) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={cn(
          "nova-progress",
          `nova-progress--${tone}`,
          `nova-progress--${size}`,
          indeterminate && "nova-progress--indeterminate",
          className
        )}
        {...rest}
      >
        <div
          className="nova-progress__bar"
          style={indeterminate ? undefined : { inlineSize: `${percent}%` }}
        />
      </div>
    );
  }
);
