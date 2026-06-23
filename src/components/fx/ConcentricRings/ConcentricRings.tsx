import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./ConcentricRings.css";

export interface ConcentricRingsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rings pulsing outward. Defaults `4`. */
  count?: number;
  /** Ring color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Seconds for one ring to expand and fade. Defaults `4`. */
  duration?: number;
  /** Horizontal origin as a CSS position. Defaults `"50%"`. */
  originX?: string;
  /** Vertical origin as a CSS position. Defaults `"50%"`. */
  originY?: string;
}

/**
 * Concentric ring outlines that pulse outward from a point and fade — a sonar /
 * radar ping. Ring count, color, cadence and origin are configurable; the rings
 * are evenly phase-offset so a new one launches at a steady beat.
 *
 * SSR-safe (pure CSS, no window access). Rings freeze under reduced-motion via
 * CSS. Decorative — aria-hidden.
 */
export const ConcentricRings = forwardRef<HTMLDivElement, ConcentricRingsProps>(
  function ConcentricRings(
    {
      count = 4,
      color = "var(--nova-primary)",
      duration = 4,
      originX = "50%",
      originY = "50%",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const rings = useMemo(() => Array.from({ length: count }), [count]);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-rings", className)}
        style={
          {
            "--nova-rings-color": color,
            "--nova-rings-dur": `${duration}s`,
            "--nova-rings-x": originX,
            "--nova-rings-y": originY,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {rings.map((_, i) => (
          <span
            key={i}
            className="nova-rings__ring"
            style={
              {
                animationDelay: `${(duration / count) * i}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }
);
