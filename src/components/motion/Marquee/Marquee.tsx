import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Marquee.css";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. Defaults `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /**
   * Travel direction. For horizontal: `"start"` scrolls toward the start edge
   * (content moves left). For vertical: `"start"` scrolls upward. Defaults
   * `"start"`.
   */
  direction?: "start" | "end";
  /** Pixels per second. Higher is faster. Defaults `40`. */
  speed?: number;
  /** Pause the animation while the pointer is over the marquee. Defaults `true`. */
  pauseOnHover?: boolean;
  /** Fade the leading/trailing edges with a gradient mask. Defaults `true`. */
  fade?: boolean;
  /** Width of the edge fade. Defaults `"2rem"`. */
  fadeWidth?: number | string;
  /** Gap between the two content copies. Defaults `"2rem"`. */
  gap?: number | string;
  children?: React.ReactNode;
}

/**
 * Continuously scrolling marquee. The content is duplicated so the loop is
 * seamless; one copy is hidden from assistive tech to avoid duplicate reads.
 * Speed is converted to a duration based on the configured pixels-per-second.
 *
 * Pure CSS animation (SSR-safe, no measurement). Under reduced motion the
 * animation is paused and the content sits statically.
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(
  function Marquee(
    {
      orientation = "horizontal",
      direction = "start",
      speed = 40,
      pauseOnHover = true,
      fade = true,
      fadeWidth = "2rem",
      gap = "2rem",
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
          "nova-marquee",
          `nova-marquee--${orientation}`,
          `nova-marquee--${direction}`,
          pauseOnHover && "nova-marquee--pause-hover",
          fade && "nova-marquee--fade",
          className
        )}
        data-paused={reduced ? "" : undefined}
        style={
          {
            "--nova-marquee-gap": gapValue,
            "--nova-marquee-fade": fadeValue,
            // duration = distance / speed; distance ≈ one copy + gap, resolved
            // at runtime by the animation traveling 100% of a track. We expose
            // speed and let CSS compute via a long, mask-bounded loop.
            "--nova-marquee-speed": `${Math.max(1, speed)}`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-marquee__track">
          <div className="nova-marquee__group">{children}</div>
          <div className="nova-marquee__group" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
