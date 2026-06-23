import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BouncingBalls.css";

export type BouncingBallsTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BouncingBallsSize = "sm" | "md" | "lg" | number;

export interface BouncingBallsProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel height. Defaults to `"md"`. */
  size?: BouncingBallsSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: BouncingBallsTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of balls. Defaults to `3`. */
  count?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<BouncingBallsSize, number>, number> = {
  sm: 24,
  md: 36,
  lg: 52,
};

function resolveSize(size: BouncingBallsSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const BouncingBalls = forwardRef<HTMLSpanElement, BouncingBallsProps>(
  function BouncingBalls(
    {
      size = "md",
      tone = "primary",
      color,
      count = 3,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const n = Math.max(1, Math.min(count, 6));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-bouncing-balls", className)}
        style={{
          ...style,
          ["--nova-bb-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: n }).map((_, i) => (
          <span
            key={i}
            className="nova-bouncing-balls__ball"
            aria-hidden="true"
            style={{ ["--nova-bb-i" as string]: i }}
          />
        ))}
      </span>
    );
  }
);
