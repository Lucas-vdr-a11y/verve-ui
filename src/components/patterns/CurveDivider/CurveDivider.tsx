import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CurveDivider.css";

export interface CurveDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Which edge the curve sits on. Defaults `"bottom"`. */
  edge?: "top" | "bottom";
  /** Curve direction: bulging out (`"convex"`) or scooping in (`"concave"`). Defaults `"convex"`. */
  variant?: "convex" | "concave";
  /** Curve height in px. Defaults `80`. */
  height?: number;
  /** Flip horizontally (asymmetric variants only — kept for parity). Defaults `false`. */
  flip?: boolean;
  /** Fill color. Defaults a surface token so the curve blends sections. */
  color?: string;
}

/**
 * A smooth single-arc curve divider between two sections. Choose convex (bulging
 * toward the next section) or concave (scooping inward), on the top or bottom edge.
 *
 * SSR-safe, no motion. Decorative — aria-hidden.
 */
export const CurveDivider = forwardRef<HTMLDivElement, CurveDividerProps>(
  function CurveDivider(
    {
      edge = "bottom",
      variant = "convex",
      height = 80,
      flip = false,
      color = "var(--nova-surface)",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const h = height;
    // A single quadratic arc. Control point pushed up or down depending on
    // edge + variant so the filled side stays attached to the section.
    let d: string;
    if (edge === "bottom") {
      // Fill the bottom band; curve forms the top boundary of that band.
      const cy = variant === "convex" ? 0 : h;
      d = `M0 0 Q 720 ${cy}, 1440 0 V ${h} H 0 Z`;
    } else {
      const cy = variant === "convex" ? h : 0;
      d = `M0 ${h} Q 720 ${cy}, 1440 ${h} V 0 H 0 Z`;
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-curve-divider",
          `nova-curve-divider--${edge}`,
          flip && "nova-curve-divider--flip",
          className
        )}
        style={
          {
            "--nova-curve-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-curve-divider__svg"
          viewBox={`0 0 1440 ${h}`}
          width="100%"
          height={h}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="nova-curve-divider__path" d={d} />
        </svg>
      </div>
    );
  }
);
