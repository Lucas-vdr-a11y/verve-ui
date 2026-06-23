import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RingsLoader.css";

export type RingsLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type RingsLoaderSize = "sm" | "md" | "lg" | number;

export interface RingsLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: RingsLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: RingsLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of concentric rings. Defaults to `3`. */
  rings?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<RingsLoaderSize, number>, number> = {
  sm: 32,
  md: 48,
  lg: 68,
};

function resolveSize(size: RingsLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const RingsLoader = forwardRef<HTMLSpanElement, RingsLoaderProps>(
  function RingsLoader(
    {
      size = "md",
      tone = "primary",
      color,
      rings = 3,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const count = Math.max(2, Math.min(rings, 5));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-rings-loader", className)}
        style={{
          ...style,
          ["--nova-rings-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="nova-rings-loader__ring"
            aria-hidden="true"
            style={{
              ["--nova-rings-i" as string]: i,
              ["--nova-rings-n" as string]: count,
            }}
          />
        ))}
      </span>
    );
  }
);
