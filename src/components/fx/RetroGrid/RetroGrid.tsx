import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RetroGrid.css";

export interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll speed of the grid in seconds per cycle. Defaults `18`. */
  speed?: number;
  /** Grid cell size in px. Defaults `50`. */
  cellSize?: number;
  /** Tilt angle of the perspective floor in degrees. Defaults `65`. */
  angle?: number;
  /** Fade the floor into the horizon at the top. Defaults `true`. */
  fade?: boolean;
}

/**
 * Perspective scrolling retro/synthwave grid floor. A tilted plane of glowing
 * lines scrolls toward the horizon using CSS 3D transforms, fading out into the
 * distance for that Tron/Outrun look.
 *
 * SSR-safe (pure CSS). Decorative — aria-hidden. Freezes on reduced-motion.
 */
export const RetroGrid = forwardRef<HTMLDivElement, RetroGridProps>(
  function RetroGrid(
    { speed = 18, cellSize = 50, angle = 65, fade = true, className, style, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-retro", fade && "nova-retro--fade", className)}
        style={
          {
            "--nova-retro-speed": `${speed}s`,
            "--nova-retro-cell": `${cellSize}px`,
            "--nova-retro-angle": `${angle}deg`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-retro__plane">
          <div className="nova-retro__grid" />
        </div>
      </div>
    );
  }
);
