import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./WarpBackground.css";

export interface WarpBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of beams flying in from each of the four sides. Defaults `5`. */
  beamsPerSide?: number;
  /** Beam travel duration in seconds. Defaults `3`. */
  duration?: number;
  /** Beam color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Perspective depth in px (lower = more extreme warp). Defaults `100`. */
  perspective?: number;
  children?: React.ReactNode;
}

interface Beam {
  pos: number;
  delay: number;
  width: number;
}

const SIDES = ["top", "bottom", "left", "right"] as const;

/**
 * A perspective "warp tunnel" — beams fly toward the viewer from all four edges
 * along a 3D-perspective grid, with a content slot in the center. Beam count per
 * side, speed, color and perspective depth are configurable.
 *
 * SSR-safe: beam offsets derived deterministically per render (stable markup),
 * pure CSS animation. Freezes on reduced-motion. Decorative layer aria-hidden.
 */
export const WarpBackground = forwardRef<HTMLDivElement, WarpBackgroundProps>(
  function WarpBackground(
    {
      beamsPerSide = 5,
      duration = 3,
      color = "var(--nova-primary)",
      perspective = 100,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const beamsBySide = useMemo(() => {
      let seed = beamsPerSide * 4099 + 911;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      return SIDES.map(() =>
        Array.from({ length: beamsPerSide }, (_, i): Beam => ({
          pos: ((i + 0.5) / beamsPerSide) * 100,
          delay: rand() * duration,
          width: 4 + rand() * 6,
        }))
      );
    }, [beamsPerSide, duration]);

    return (
      <div
        ref={ref}
        className={cn("nova-warp", className)}
        style={
          {
            "--nova-warp-color": color,
            "--nova-warp-duration": `${duration}s`,
            "--nova-warp-perspective": `${perspective}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-warp__scene" aria-hidden="true">
          {SIDES.map((side, si) => (
            <div
              key={side}
              className={cn("nova-warp__plane", `nova-warp__plane--${side}`)}
            >
              {beamsBySide[si].map((b, bi) => (
                <span
                  key={bi}
                  className="nova-warp__beam"
                  style={
                    {
                      "--nova-warp-pos": `${b.pos}%`,
                      "--nova-warp-bw": `${b.width}%`,
                      animationDelay: `${b.delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
        {children != null && <div className="nova-warp__content">{children}</div>}
      </div>
    );
  }
);
