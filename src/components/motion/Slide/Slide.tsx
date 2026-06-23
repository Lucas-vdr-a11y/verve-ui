import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Transition, type TransitionProps } from "../Transition";
import "./Slide.css";

export type SlideDirection = "up" | "down" | "left" | "right";

export interface SlideProps
  extends Omit<TransitionProps, "preset" | "classNames"> {
  /** Drives the slide: `true` slides in, `false` slides out then unmounts. */
  in: boolean;
  /**
   * Edge the content slides from while entering (and toward while exiting).
   * `"up"` means it travels upward into place from below. Defaults `"up"`.
   */
  direction?: SlideDirection;
  /** Travel distance. Number is treated as px; strings pass through. Defaults `"0.75rem"`. */
  distance?: number | string;
}

/**
 * Slide + fade wrapper, built on {@link Transition}. The offset is expressed via
 * a CSS custom property so a single transform handles all directions.
 */
export const Slide = forwardRef<HTMLDivElement, SlideProps>(function Slide(
  { direction = "up", distance = "0.75rem", className, style, ...rest },
  ref
) {
  const dist = typeof distance === "number" ? `${distance}px` : distance;

  return (
    <Transition
      ref={ref}
      className={cn("nova-slide", `nova-slide--${direction}`, className)}
      style={
        { "--nova-slide-distance": dist, ...style } as React.CSSProperties
      }
      {...rest}
    />
  );
});
