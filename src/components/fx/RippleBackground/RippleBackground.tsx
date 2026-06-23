import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RippleBackground.css";

export interface RippleBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of concentric ripple circles. Defaults `7`. */
  circles?: number;
  /** Diameter of the innermost circle in px. Defaults `120`. */
  baseSize?: number;
  /** Gap added to each successive ring in px. Defaults `70`. */
  ringGap?: number;
  /** Ripple color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Full loop duration in seconds. Defaults `4`. */
  duration?: number;
  children?: React.ReactNode;
}

/**
 * Concentric expanding ripple circles that emanate from the center on a loop
 * (the Magic UI ripple). Each ring is larger and fainter; ring count, base size,
 * spacing, color and loop speed are configurable. Accepts centered content.
 *
 * SSR-safe (pure CSS animation, stable markup). Freezes on reduced-motion.
 * Decorative layer aria-hidden.
 */
export const RippleBackground = forwardRef<
  HTMLDivElement,
  RippleBackgroundProps
>(function RippleBackground(
  {
    circles = 7,
    baseSize = 120,
    ringGap = 70,
    color = "var(--nova-primary)",
    duration = 4,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("nova-ripple", className)}
      style={
        {
          "--nova-ripple-color": color,
          "--nova-ripple-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-ripple__field" aria-hidden="true">
        {Array.from({ length: circles }, (_, i) => {
          const dim = baseSize + i * ringGap;
          const opacity = Math.max(0.05, 0.55 - i * (0.5 / circles));
          return (
            <span
              key={i}
              className="nova-ripple__ring"
              style={
                {
                  width: `${dim}px`,
                  height: `${dim}px`,
                  opacity,
                  borderStyle: i === circles - 1 ? "dashed" : "solid",
                  animationDelay: `${(i * duration) / circles / 2}s`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
      {children != null && (
        <div className="nova-ripple__content">{children}</div>
      )}
    </div>
  );
});
