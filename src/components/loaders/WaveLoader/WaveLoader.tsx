import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./WaveLoader.css";

export type WaveLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type WaveLoaderSize = "sm" | "md" | "lg" | number;

export interface WaveLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Height on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: WaveLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: WaveLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of bars in the wave. Defaults to `7`. */
  bars?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<WaveLoaderSize, number>, number> = {
  sm: 24,
  md: 36,
  lg: 52,
};

function resolveSize(size: WaveLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const WaveLoader = forwardRef<HTMLSpanElement, WaveLoaderProps>(
  function WaveLoader(
    {
      size = "md",
      tone = "primary",
      color,
      bars = 7,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const count = Math.max(3, Math.min(bars, 12));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-wave-loader", className)}
        style={{
          ...style,
          ["--nova-wave-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="nova-wave-loader__bar"
            aria-hidden="true"
            style={{
              ["--nova-wave-i" as string]: i,
              ["--nova-wave-n" as string]: count,
            }}
          />
        ))}
      </span>
    );
  }
);
