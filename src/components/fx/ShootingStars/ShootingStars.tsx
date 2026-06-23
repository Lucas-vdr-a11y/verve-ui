import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ShootingStars.css";

export interface ShootingStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Min delay between stars in ms. Defaults `1200`. */
  minDelay?: number;
  /** Max delay between stars in ms. Defaults `4200`. */
  maxDelay?: number;
  /** Head/trail color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Travel duration of a single streak in ms. Defaults `1100`. */
  duration?: number;
  /** Render a faint static starfield behind the streaks. Defaults `true`. */
  starfield?: boolean;
}

interface Streak {
  id: number;
  top: number;
  left: number;
  angle: number;
  scale: number;
}

/**
 * Occasional shooting stars that streak diagonally across an (optionally starry)
 * night sky. Each streak has a glowing head and a fading tail; spawn frequency,
 * colors and speed are configurable.
 *
 * SSR-safe: all timers live in an effect with full cleanup. Freezes (no streaks)
 * on reduced-motion. Decorative — aria-hidden.
 */
export const ShootingStars = forwardRef<HTMLDivElement, ShootingStarsProps>(
  function ShootingStars(
    {
      minDelay = 1200,
      maxDelay = 4200,
      color = "var(--nova-primary)",
      duration = 1100,
      starfield = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const counter = useRef(0);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      if (reduced) return;
      let timer: ReturnType<typeof setTimeout>;
      let mounted = true;

      const spawn = () => {
        if (!mounted) return;
        const id = counter.current++;
        const fromLeft = Math.random() < 0.5;
        const streak: Streak = {
          id,
          top: Math.random() * 55,
          left: fromLeft ? Math.random() * 25 : 55 + Math.random() * 40,
          angle: 25 + Math.random() * 20,
          scale: 0.7 + Math.random() * 0.8,
        };
        setStreaks((prev) => [...prev, streak]);
        // Remove the streak after it finishes animating.
        setTimeout(() => {
          if (!mounted) return;
          setStreaks((prev) => prev.filter((s) => s.id !== id));
        }, duration + 200);

        const next = minDelay + Math.random() * Math.max(0, maxDelay - minDelay);
        timer = setTimeout(spawn, next);
      };

      timer = setTimeout(spawn, minDelay + Math.random() * Math.max(0, maxDelay - minDelay));

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }, [minDelay, maxDelay, duration, reduced]);

    return (
      <div
        ref={setRefs}
        aria-hidden="true"
        className={cn(
          "nova-shooting-stars",
          starfield && "nova-shooting-stars--starfield",
          className
        )}
        style={
          {
            "--nova-ss-color": color,
            "--nova-ss-duration": `${duration}ms`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {streaks.map((s) => (
          <span
            key={s.id}
            className="nova-shooting-stars__star"
            style={
              {
                top: `${s.top}%`,
                left: `${s.left}%`,
                transform: `rotate(${s.angle}deg) scale(${s.scale})`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }
);
