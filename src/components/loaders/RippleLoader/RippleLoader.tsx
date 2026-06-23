import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RippleLoader.css";

export type RippleLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type RippleLoaderSize = "sm" | "md" | "lg" | number;

export interface RippleLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel diameter. Defaults to `"md"`. */
  size?: RippleLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: RippleLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of concentric rings. Defaults to `3`. */
  rings?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<RippleLoaderSize, number>, number> = {
  sm: 32,
  md: 48,
  lg: 72,
};

function resolveSize(size: RippleLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const RippleLoader = forwardRef<HTMLSpanElement, RippleLoaderProps>(
  function RippleLoader(
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
    const n = Math.max(1, Math.min(rings, 5));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-ripple-loader", className)}
        style={{
          ...style,
          ["--nova-ripple-size" as string]: `${px}px`,
          ["--nova-ripple-n" as string]: n,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: n }).map((_, i) => (
          <span
            key={i}
            className="nova-ripple-loader__ring"
            aria-hidden="true"
            style={{ ["--nova-ripple-i" as string]: i }}
          />
        ))}
      </span>
    );
  }
);
