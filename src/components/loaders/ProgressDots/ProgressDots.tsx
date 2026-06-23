import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressDots.css";

export type ProgressDotsTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ProgressDotsSize = "sm" | "md" | "lg" | number;

export interface ProgressDotsProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Total number of dots. Defaults to `5`. */
  count?: number;
  /**
   * Determinate value — number of dots filled (0..count). When provided the
   * component is a progressbar. When omitted, dots march (indeterminate).
   */
  value?: number;
  /** Size on the sm/md/lg scale, or an explicit pixel dot size. Defaults to `"md"`. */
  size?: ProgressDotsSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: ProgressDotsTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<ProgressDotsSize, number>, number> = {
  sm: 8,
  md: 11,
  lg: 15,
};

function resolveSize(size: ProgressDotsSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export const ProgressDots = forwardRef<HTMLSpanElement, ProgressDotsProps>(
  function ProgressDots(
    {
      count = 5,
      value,
      size = "md",
      tone = "primary",
      color,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const total = Math.max(1, Math.min(count, 12));
    const determinate = typeof value === "number";
    const filled = determinate ? clamp(Math.round(value as number), 0, total) : 0;

    const ariaProps = determinate
      ? {
          role: "progressbar" as const,
          "aria-valuenow": filled,
          "aria-valuemin": 0,
          "aria-valuemax": total,
          "aria-busy": filled < total,
        }
      : { role: "status" as const, "aria-busy": true };

    return (
      <span
        ref={ref}
        aria-label={label}
        className={cn("nova-progress-dots", className)}
        style={{
          ...style,
          ["--nova-pd-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        data-determinate={determinate ? "true" : undefined}
        {...ariaProps}
        {...rest}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "nova-progress-dots__dot",
              determinate && i < filled && "nova-progress-dots__dot--on"
            )}
            aria-hidden="true"
            style={{ ["--nova-pd-i" as string]: i }}
          />
        ))}
      </span>
    );
  }
);
