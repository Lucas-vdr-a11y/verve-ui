import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SpiralLoader.css";

export type SpiralLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type SpiralLoaderSize = "sm" | "md" | "lg" | number;

export interface SpiralLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: SpiralLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: SpiralLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of dots forming the spiral arm. Defaults to `8`. */
  dots?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<SpiralLoaderSize, number>, number> = {
  sm: 32,
  md: 48,
  lg: 68,
};

function resolveSize(size: SpiralLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const SpiralLoader = forwardRef<HTMLSpanElement, SpiralLoaderProps>(
  function SpiralLoader(
    {
      size = "md",
      tone = "primary",
      color,
      dots = 8,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const count = Math.max(4, Math.min(dots, 14));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-spiral-loader", className)}
        style={{
          ...style,
          ["--nova-spiral-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="nova-spiral-loader__dot"
            aria-hidden="true"
            style={{
              ["--nova-spiral-i" as string]: i,
              ["--nova-spiral-n" as string]: count,
            }}
          />
        ))}
      </span>
    );
  }
);
