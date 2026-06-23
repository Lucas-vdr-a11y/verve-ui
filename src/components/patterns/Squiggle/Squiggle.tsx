import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Squiggle.css";

export interface SquiggleProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Squiggle style. Defaults `"wave"`. */
  variant?: "wave" | "underline" | "scribble";
  /** Stroke color. Defaults the primary token. */
  color?: string;
  /** Stroke thickness in px. Defaults `3`. */
  thickness?: number;
  /** Number of wave humps (wave/scribble). Defaults `5`. */
  waves?: number;
  /** Draw the line on with a stroke-dash animation. Defaults `false`. */
  animated?: boolean;
}

/** Build the squiggle path across a 100×12 viewbox. */
function buildPath(variant: NonNullable<SquiggleProps["variant"]>, waves: number): string {
  const w = 100;
  const mid = 8;
  if (variant === "underline") {
    return `M1 ${mid} Q ${w / 2} ${mid + 2}, ${w - 1} ${mid - 1}`;
  }
  const n = Math.max(2, waves);
  const step = w / n;
  const amp = variant === "scribble" ? 5 : 3.5;
  let d = `M1 ${mid}`;
  for (let i = 0; i < n; i++) {
    const x0 = 1 + i * step;
    const x1 = x0 + step / 2;
    const x2 = x0 + step;
    const up = i % 2 === 0 ? -amp : amp;
    d += ` Q ${x1.toFixed(1)} ${(mid + up).toFixed(1)}, ${x2.toFixed(1)} ${mid}`;
  }
  return d;
}

/**
 * A hand-drawn-style squiggly accent line for highlighting words — drop it under a
 * heading word or use it as a flourish. Wave, underline, and scribble variants,
 * with an optional draw-on animation.
 *
 * SSR-safe (path computed during render). Draw-on animation respects reduced-motion
 * via CSS. Decorative — aria-hidden.
 */
export const Squiggle = forwardRef<HTMLSpanElement, SquiggleProps>(
  function Squiggle(
    {
      variant = "wave",
      color = "var(--nova-primary)",
      thickness = 3,
      waves = 5,
      animated = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const d = useMemo(() => buildPath(variant, waves), [variant, waves]);

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-squiggle",
          animated && "nova-squiggle--animated",
          className
        )}
        style={
          {
            "--nova-squiggle-color": color,
            "--nova-squiggle-thickness": `${thickness}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-squiggle__svg"
          viewBox="0 0 100 16"
          width="100%"
          height="16"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="nova-squiggle__path"
            d={d}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
);
