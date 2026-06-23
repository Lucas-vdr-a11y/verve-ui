import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./CrossPattern.css";

export interface CrossPatternProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Tile spacing in px (distance between plus centers). Defaults `28`. */
  gap?: number;
  /** Arm length of each plus in px. Defaults `8`. */
  armLength?: number;
  /** Stroke thickness in px. Defaults `1.5`. */
  thickness?: number;
  /** Stroke color. Defaults a subtle border token so it reads as texture. */
  color?: string;
  /** Fade the pattern toward the edges with a radial mask. Defaults `false`. */
  fade?: boolean;
}

/**
 * A tiled plus / cross SVG pattern background — a subtle texture for sections and
 * cards. Configurable spacing, arm length, thickness, and color, with an optional
 * radial fade mask toward the edges.
 *
 * SSR-safe, no motion. Background by default — children render on top.
 * Decorative — aria-hidden.
 */
export const CrossPattern = forwardRef<HTMLDivElement, CrossPatternProps>(
  function CrossPattern(
    {
      gap = 28,
      armLength = 8,
      thickness = 1.5,
      color = "var(--nova-border-strong)",
      fade = false,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const id = `nova-cross-${useId()}`;
    const half = armLength / 2;
    const c = gap / 2;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-cross-pattern",
          fade && "nova-cross-pattern--fade",
          className
        )}
        style={
          {
            "--nova-cross-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-cross-pattern__svg"
          width="100%"
          height="100%"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={id}
              width={gap}
              height={gap}
              patternUnits="userSpaceOnUse"
            >
              <path
                className="nova-cross-pattern__mark"
                d={`M ${c - half} ${c} H ${c + half} M ${c} ${c - half} V ${c + half}`}
                strokeWidth={thickness}
                strokeLinecap="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
        {children}
      </div>
    );
  }
);

export { CrossPattern as PlusPattern };
export type { CrossPatternProps as PlusPatternProps };
