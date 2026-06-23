import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BatteryLoader.css";

export type BatteryLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BatteryLoaderSize = "sm" | "md" | "lg" | number;

export interface BatteryLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /**
   * Determinate fill value. When provided the loader becomes a progressbar.
   * When omitted, the battery charge loops (indeterminate).
   */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Size on the sm/md/lg scale, or an explicit pixel height. Defaults to `"md"`. */
  size?: BatteryLoaderSize;
  /** Semantic color tone. Defaults to `"success"`. */
  tone?: BatteryLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Show the charging bolt. Defaults to `true`. */
  bolt?: boolean;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<BatteryLoaderSize, number>, number> = {
  sm: 18,
  md: 26,
  lg: 36,
};

function resolveSize(size: BatteryLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export const BatteryLoader = forwardRef<HTMLSpanElement, BatteryLoaderProps>(
  function BatteryLoader(
    {
      value,
      max = 100,
      size = "md",
      tone = "success",
      color,
      bolt = true,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const determinate = typeof value === "number";
    const safeMax = max <= 0 ? 100 : max;
    const ratio = determinate ? clamp((value as number) / safeMax, 0, 1) : 0;

    const ariaProps = determinate
      ? {
          role: "progressbar" as const,
          "aria-valuenow": value,
          "aria-valuemin": 0,
          "aria-valuemax": safeMax,
          "aria-busy": ratio < 1,
        }
      : { role: "status" as const, "aria-busy": true };

    return (
      <span
        ref={ref}
        aria-label={label}
        className={cn("nova-battery-loader", className)}
        style={{
          ...style,
          ["--nova-batt-size" as string]: `${px}px`,
          ...(determinate
            ? { ["--nova-batt-fill" as string]: ratio }
            : null),
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        data-determinate={determinate ? "true" : undefined}
        {...ariaProps}
        {...rest}
      >
        <span className="nova-battery-loader__body" aria-hidden="true">
          <span className="nova-battery-loader__fill" />
          {bolt ? (
            <svg
              className="nova-battery-loader__bolt"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13 2 4 14h6l-1 8 9-12h-6z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="nova-battery-loader__cap" aria-hidden="true" />
      </span>
    );
  }
);
