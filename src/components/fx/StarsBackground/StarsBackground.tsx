import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./StarsBackground.css";

export interface StarsBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of stars per depth layer. Defaults `60`. */
  density?: number;
  /** Number of parallax depth layers (1–4 sensible). Defaults `3`. */
  layers?: number;
  /** Whether stars gently twinkle. Defaults `true`. */
  twinkle?: boolean;
  /** Star color. Any CSS color. Defaults a muted text token. */
  color?: string;
  children?: React.ReactNode;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  delay: number;
  dur: number;
}

/**
 * A still or twinkling starfield made of several parallax depth layers of dots,
 * for dark hero backgrounds. Nearer layers have larger, brighter, faster-pulsing
 * stars. Density, layer count, twinkle and color are configurable.
 *
 * SSR-safe: star positions derived deterministically per render (stable markup),
 * pure CSS animation. Twinkle freezes on reduced-motion. Decorative — aria-hidden.
 */
export const StarsBackground = forwardRef<HTMLDivElement, StarsBackgroundProps>(
  function StarsBackground(
    {
      density = 60,
      layers = 3,
      twinkle = true,
      color = "var(--nova-text-subtle)",
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const layerData = useMemo(() => {
      const count = Math.max(1, layers);
      let seed = density * 6379 + count * 17 + 101;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      return Array.from({ length: count }, (_, layer) => {
        const depth = (layer + 1) / count; // 0..1, nearer = larger
        const stars: Star[] = Array.from({ length: density }, () => ({
          x: rand() * 100,
          y: rand() * 100,
          r: 0.4 + depth * 1.4 * rand() + 0.3,
          a: 0.3 + depth * 0.6 + rand() * 0.1,
          delay: rand() * 4,
          dur: 2.5 + rand() * 3 - depth,
        }));
        return { depth, stars };
      });
    }, [density, layers]);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-stars-bg",
          twinkle && "nova-stars-bg--twinkle",
          className
        )}
        style={{ "--nova-stars-color": color, ...style } as React.CSSProperties}
        {...rest}
      >
        <div className="nova-stars-bg__field" aria-hidden="true">
          {layerData.map(({ depth, stars }, li) => (
            <div
              key={li}
              className="nova-stars-bg__layer"
              style={{ "--nova-stars-depth": depth } as React.CSSProperties}
            >
              {stars.map((s, si) => (
                <span
                  key={si}
                  className="nova-stars-bg__star"
                  style={
                    {
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      width: `${s.r}px`,
                      height: `${s.r}px`,
                      opacity: s.a,
                      animationDelay: `${s.delay}s`,
                      animationDuration: `${Math.max(1.2, s.dur)}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
        {children != null && (
          <div className="nova-stars-bg__content">{children}</div>
        )}
      </div>
    );
  }
);
