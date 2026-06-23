import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PacmanLoader.css";

export type PacmanLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type PacmanLoaderSize = "sm" | "md" | "lg" | number;

export interface PacmanLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel height for the mouth. Defaults to `"md"`. */
  size?: PacmanLoaderSize;
  /** Semantic color tone. Defaults to `"warning"`. */
  tone?: PacmanLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of dots in the trail. Defaults to `3`. */
  dots?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<PacmanLoaderSize, number>, number> = {
  sm: 22,
  md: 32,
  lg: 46,
};

function resolveSize(size: PacmanLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const PacmanLoader = forwardRef<HTMLSpanElement, PacmanLoaderProps>(
  function PacmanLoader(
    {
      size = "md",
      tone = "warning",
      color,
      dots = 3,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const n = Math.max(1, Math.min(dots, 6));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-pacman-loader", className)}
        style={{
          ...style,
          ["--nova-pac-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-pacman-loader__pac" aria-hidden="true">
          <span className="nova-pacman-loader__jaw nova-pacman-loader__jaw--top" />
          <span className="nova-pacman-loader__jaw nova-pacman-loader__jaw--bottom" />
        </span>
        <span className="nova-pacman-loader__trail" aria-hidden="true">
          {Array.from({ length: n }).map((_, i) => (
            <span
              key={i}
              className="nova-pacman-loader__dot"
              style={{ ["--nova-pac-i" as string]: i }}
            />
          ))}
        </span>
      </span>
    );
  }
);
