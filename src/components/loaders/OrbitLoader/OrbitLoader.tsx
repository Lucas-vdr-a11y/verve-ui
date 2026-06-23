import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./OrbitLoader.css";

export type OrbitLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type OrbitLoaderSize = "sm" | "md" | "lg" | number;

export interface OrbitLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: OrbitLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: OrbitLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of orbiting bodies (planets). Defaults to `3`. */
  planets?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<OrbitLoaderSize, number>, number> = {
  sm: 28,
  md: 44,
  lg: 64,
};

function resolveSize(size: OrbitLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const OrbitLoader = forwardRef<HTMLSpanElement, OrbitLoaderProps>(
  function OrbitLoader(
    {
      size = "md",
      tone = "primary",
      color,
      planets = 3,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const count = Math.max(1, Math.min(planets, 6));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-orbit-loader", className)}
        style={{
          ...style,
          ["--nova-orbit-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-orbit-loader__nucleus" aria-hidden="true" />
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="nova-orbit-loader__ring"
            aria-hidden="true"
            style={{
              ["--nova-orbit-i" as string]: i,
              ["--nova-orbit-n" as string]: count,
            }}
          >
            <span className="nova-orbit-loader__planet" />
          </span>
        ))}
      </span>
    );
  }
);
