import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PulseGridLoader.css";

export type PulseGridLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type PulseGridLoaderSize = "sm" | "md" | "lg" | number;

export interface PulseGridLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: PulseGridLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: PulseGridLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<PulseGridLoaderSize, number>, number> = {
  sm: 28,
  md: 40,
  lg: 56,
};

function resolveSize(size: PulseGridLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

/** Chebyshev distance from the center cell (1,1) — drives the ripple delay. */
const CELL_DISTANCE = Array.from({ length: 9 }, (_, i) =>
  Math.max(Math.abs(Math.floor(i / 3) - 1), Math.abs((i % 3) - 1))
);

export const PulseGridLoader = forwardRef<HTMLSpanElement, PulseGridLoaderProps>(
  function PulseGridLoader(
    { size = "md", tone = "primary", color, label = "Loading", className, style, ...rest },
    ref
  ) {
    const px = resolveSize(size);

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-pulse-grid-loader", className)}
        style={{
          ...style,
          ["--nova-pgrid-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {CELL_DISTANCE.map((dist, i) => (
          <span
            key={i}
            className="nova-pulse-grid-loader__cell"
            aria-hidden="true"
            style={{ ["--nova-pgrid-d" as string]: dist }}
          />
        ))}
      </span>
    );
  }
);
