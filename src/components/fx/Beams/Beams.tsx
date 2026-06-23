import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Beams.css";

export interface BeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of diagonal beams. Defaults `6`. */
  quantity?: number;
  /** Tilt of the beams in degrees. Defaults `-45`. */
  angle?: number;
  /** Beam color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Drift duration in seconds. Defaults `9`. */
  duration?: number;
  children?: React.ReactNode;
}

interface Beam {
  pos: number;
  delay: number;
  width: number;
  opacity: number;
  dur: number;
}

/**
 * Diagonal light beams that slowly sweep across a section — a few angled
 * soft-gradient bars drifting for a premium hero backdrop. Beam count, tilt
 * angle, color and speed are configurable.
 *
 * SSR-safe: beam parameters derived deterministically per render (stable markup),
 * pure CSS animation. Freezes on reduced-motion. Decorative layer aria-hidden.
 */
export const Beams = forwardRef<HTMLDivElement, BeamsProps>(function Beams(
  {
    quantity = 6,
    angle = -45,
    color = "var(--nova-primary)",
    duration = 9,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const beams = useMemo(() => {
    let seed = quantity * 5147 + 233;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: quantity }, (_, i): Beam => ({
      pos: ((i + 0.5) / quantity) * 130 - 15,
      delay: -rand() * duration,
      width: 60 + rand() * 140,
      opacity: 0.25 + rand() * 0.45,
      dur: duration * (0.7 + rand() * 0.6),
    }));
  }, [quantity, duration]);

  return (
    <div
      ref={ref}
      className={cn("nova-beams", className)}
      style={
        {
          "--nova-beams-color": color,
          "--nova-beams-angle": `${angle}deg`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-beams__field" aria-hidden="true">
        {beams.map((b, i) => (
          <span
            key={i}
            className="nova-beams__beam"
            style={
              {
                left: `${b.pos}%`,
                width: `${b.width}px`,
                opacity: b.opacity,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      {children != null && <div className="nova-beams__content">{children}</div>}
    </div>
  );
});
