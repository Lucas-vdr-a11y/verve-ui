import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./MarqueeRow.css";

export interface MarqueeRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. Defaults `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /** Reverse the travel direction. Defaults `false`. */
  reverse?: boolean;
  /** Pixels-per-second feel; higher is faster. Defaults `30`. */
  speed?: number;
  /** Pause while the pointer is over the row. Defaults `true`. */
  pauseOnHover?: boolean;
  /** Edge fade mask width. Defaults `"4rem"`. */
  fadeWidth?: number | string;
  /** Gap between items. Defaults `"3rem"`. */
  gap?: number | string;
  /** Apply a subtle 3D skew for a dynamic "moving wall" look. Defaults `false`. */
  skew?: boolean;
  children?: React.ReactNode;
}

/**
 * Seamless infinite marquee tuned for "trusted by" logo rows: generous gaps,
 * edge fade masks, pause-on-hover, reversible direction, and an optional 3D
 * skew. Content is duplicated so the loop is seamless; the duplicate copy is
 * hidden from assistive tech.
 *
 * Pure CSS animation (SSR-safe, no measurement). Paused under reduced motion.
 */
export const MarqueeRow = forwardRef<HTMLDivElement, MarqueeRowProps>(
  function MarqueeRow(
    {
      orientation = "horizontal",
      reverse = false,
      speed = 30,
      pauseOnHover = true,
      fadeWidth = "4rem",
      gap = "3rem",
      skew = false,
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const gapValue = typeof gap === "number" ? `${gap}px` : gap;
    const fadeValue =
      typeof fadeWidth === "number" ? `${fadeWidth}px` : fadeWidth;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-marquee-row",
          `nova-marquee-row--${orientation}`,
          reverse && "nova-marquee-row--reverse",
          pauseOnHover && "nova-marquee-row--pause-hover",
          skew && "nova-marquee-row--skew",
          className
        )}
        data-paused={reduced ? "" : undefined}
        style={
          {
            "--nova-marquee-row-gap": gapValue,
            "--nova-marquee-row-fade": fadeValue,
            "--nova-marquee-row-speed": `${Math.max(1, speed)}`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-marquee-row__viewport">
          <div className="nova-marquee-row__track">
            <div className="nova-marquee-row__group">{children}</div>
            <div className="nova-marquee-row__group" aria-hidden="true">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
