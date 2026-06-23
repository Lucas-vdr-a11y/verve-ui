import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BorderBeam.css";

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Length of the beam along the border (px). Defaults `60`. */
  size?: number;
  /** Time for one full lap in seconds. Defaults `6`. */
  duration?: number;
  /** Border thickness in px. Defaults `1.5`. */
  borderWidth?: number;
  /** Start color of the beam gradient. Defaults brand-400. */
  colorFrom?: string;
  /** End color of the beam gradient. Defaults brand-600. */
  colorTo?: string;
  /** Reverse the travel direction. Defaults `false`. */
  reverse?: boolean;
  /** Delay before the beam starts, in seconds. Defaults `0`. */
  delay?: number;
  children?: React.ReactNode;
}

/**
 * A focused light beam that travels around an element's border, drawn with a
 * conic-gradient masked to just the border ring (mask composite). Wraps children
 * and overlays the animated ring on top.
 *
 * SSR-safe (pure CSS via the `offset-path`/conic technique). Decorative ring is
 * aria-hidden. Freezes on reduced-motion.
 */
export const BorderBeam = forwardRef<HTMLDivElement, BorderBeamProps>(
  function BorderBeam(
    {
      size = 60,
      duration = 6,
      borderWidth = 1.5,
      colorFrom = "var(--nova-brand-400)",
      colorTo = "var(--nova-brand-600)",
      reverse = false,
      delay = 0,
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
        className={cn("nova-beam", className)}
        style={
          {
            "--nova-beam-size": `${size}px`,
            "--nova-beam-duration": `${duration}s`,
            "--nova-beam-border": `${borderWidth}px`,
            "--nova-beam-from": colorFrom,
            "--nova-beam-to": colorTo,
            "--nova-beam-delay": `${delay}s`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cn(
            "nova-beam__ring",
            reverse && "nova-beam__ring--reverse"
          )}
        >
          <span className="nova-beam__spark" />
        </span>
        {children}
      </div>
    );
  }
);
