import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SpotlightCorners.css";

export interface SpotlightCornersProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Spotlight cone color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Cone opacity (0–1). Defaults `0.45`. */
  intensity?: number;
  /** Animate the cones with a slow sweep. Defaults `true`. */
  animate?: boolean;
  children?: React.ReactNode;
}

/**
 * Two angled spotlight cones beaming in from the top corners to illuminate a dark
 * hero — the Aceternity multi-spotlight. Content renders above the cones via a
 * slot.
 *
 * SSR-safe (pure CSS, no window access). The sweep animation is disabled under
 * reduced-motion via CSS (cones stay lit, static). Cone layer is aria-hidden.
 */
export const SpotlightCorners = forwardRef<
  HTMLDivElement,
  SpotlightCornersProps
>(function SpotlightCorners(
  {
    color = "var(--nova-primary)",
    intensity = 0.45,
    animate = true,
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
      className={cn(
        "nova-spot-corners",
        animate && "nova-spot-corners--anim",
        className
      )}
      style={
        {
          "--nova-spot-corners-color": color,
          "--nova-spot-corners-intensity": intensity,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div aria-hidden="true" className="nova-spot-corners__layer">
        <span className="nova-spot-corners__cone nova-spot-corners__cone--left" />
        <span className="nova-spot-corners__cone nova-spot-corners__cone--right" />
      </div>
      <div className="nova-spot-corners__content">{children}</div>
    </div>
  );
});
