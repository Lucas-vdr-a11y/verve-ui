import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Meteors.css";

export interface MeteorsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of meteors. Defaults `18`. */
  quantity?: number;
  /** Minimum animation duration in seconds. Defaults `4`. */
  minDuration?: number;
  /** Maximum animation duration in seconds. Defaults `9`. */
  maxDuration?: number;
  /** Angle of the streaks in degrees. Defaults `215` (top-right → bottom-left). */
  angle?: number;
}

/**
 * Animated meteor shower — diagonal streaks that fall across the container, each
 * with a glowing head and a fading trailing tail. Counts, speed, and angle are
 * configurable; positions/delays are derived deterministically per render.
 *
 * SSR-safe (CSS animation, stable markup). Decorative — aria-hidden.
 */
export const Meteors = forwardRef<HTMLDivElement, MeteorsProps>(function Meteors(
  {
    quantity = 18,
    minDuration = 4,
    maxDuration = 9,
    angle = 215,
    className,
    style,
    ...rest
  },
  ref
) {
  const meteors = useMemo(() => {
    let seed = quantity * 7919 + 104729;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: quantity }, () => {
      const dur = minDuration + rand() * (maxDuration - minDuration);
      return {
        left: rand() * 100,
        top: rand() * -40,
        delay: rand() * maxDuration,
        duration: dur,
      };
    });
  }, [quantity, minDuration, maxDuration]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("nova-meteors", className)}
      style={{ "--nova-meteor-angle": `${angle}deg`, ...style } as React.CSSProperties}
      {...rest}
    >
      {meteors.map((m, i) => (
        <span
          key={i}
          className="nova-meteors__meteor"
          style={
            {
              left: `${m.left}%`,
              top: `${m.top}%`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
});
