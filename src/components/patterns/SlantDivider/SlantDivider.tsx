import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SlantDivider.css";

export interface SlantDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Which edge the slant sits on. Defaults `"bottom"`. */
  edge?: "top" | "bottom";
  /** Which way the diagonal rises. Defaults `"left"` (high on the left). */
  direction?: "left" | "right";
  /** Slant height in px — larger = steeper. Defaults `64`. */
  height?: number;
  /** Fill color. Defaults a surface token so the slant blends sections. */
  color?: string;
}

/**
 * A diagonal slanted section edge. The filled triangle attaches to the section;
 * `direction` chooses which corner sits highest and `height` sets the steepness.
 *
 * SSR-safe, no motion. Decorative — aria-hidden.
 */
export const SlantDivider = forwardRef<HTMLDivElement, SlantDividerProps>(
  function SlantDivider(
    {
      edge = "bottom",
      direction = "left",
      height = 64,
      color = "var(--nova-surface)",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const w = 1440;
    const h = Math.max(1, height);

    // Triangle filling the band; the hypotenuse is the visible slant.
    let d: string;
    if (edge === "bottom") {
      d =
        direction === "left"
          ? `M0 0 L ${w} ${h} L 0 ${h} Z`
          : `M${w} 0 L ${w} ${h} L 0 ${h} Z`;
    } else {
      d =
        direction === "left"
          ? `M0 0 L ${w} 0 L 0 ${h} Z`
          : `M0 0 L ${w} 0 L ${w} ${h} Z`;
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-slant-divider",
          `nova-slant-divider--${edge}`,
          `nova-slant-divider--${direction}`,
          className
        )}
        style={
          {
            "--nova-slant-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-slant-divider__svg"
          viewBox={`0 0 ${w} ${h}`}
          width="100%"
          height={h}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="nova-slant-divider__path" d={d} />
        </svg>
      </div>
    );
  }
);
