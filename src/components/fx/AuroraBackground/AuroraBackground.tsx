import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AuroraBackground.css";

export interface AuroraBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation speed multiplier for the drifting blobs. Defaults `"md"`. */
  speed?: "sm" | "md" | "lg";
  /** Blur radius of the aurora layer. Higher = softer/dreamier. Defaults `"md"`. */
  blur?: "sm" | "md" | "lg";
  /** When `true` the aurora fills the viewport (fixed). Defaults `false` (relative). */
  fullscreen?: boolean;
  children?: React.ReactNode;
}

/**
 * Animated flowing aurora behind content — overlapping conic/radial gradient
 * blobs that slowly drift and rotate for a premium, ambient backdrop.
 *
 * SSR-safe (pure CSS animation, no JS). Decorative layer is aria-hidden.
 * Honors reduced-motion via the global token freeze.
 */
export const AuroraBackground = forwardRef<HTMLDivElement, AuroraBackgroundProps>(
  function AuroraBackground(
    { speed = "md", blur = "md", fullscreen = false, className, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-aurora",
          `nova-aurora--speed-${speed}`,
          `nova-aurora--blur-${blur}`,
          fullscreen && "nova-aurora--fullscreen",
          className
        )}
        {...rest}
      >
        <div className="nova-aurora__field" aria-hidden="true">
          <span className="nova-aurora__blob nova-aurora__blob--1" />
          <span className="nova-aurora__blob nova-aurora__blob--2" />
          <span className="nova-aurora__blob nova-aurora__blob--3" />
          <span className="nova-aurora__blob nova-aurora__blob--4" />
        </div>
        {children != null && <div className="nova-aurora__content">{children}</div>}
      </div>
    );
  }
);
