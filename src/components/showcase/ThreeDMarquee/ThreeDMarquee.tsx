import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ThreeDMarquee.css";

export interface ThreeDMarqueeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Image URLs painted onto the wall. Distributed across the columns. */
  images: string[];
  /** Number of vertical columns. Defaults `4`. */
  columns?: number;
  /** Seconds for one full slide cycle. Defaults `40`. */
  duration?: number;
  /** Optional alt-text generator for each tile (defaults to empty/decorative). */
  alt?: (src: string, index: number) => string;
}

/**
 * ThreeDMarquee — a perspective-skewed grid of images sliding diagonally across
 * a tilted 3D plane (the Aceternity "3D marquee wall"). The whole grid is rotated
 * in 3D via CSS `transform`; each column drifts vertically on a CSS animation,
 * alternating direction for a parallax weave.
 *
 * Pure CSS motion — no scroll/rAF needed, so it is fully SSR-safe. Under
 * reduced-motion the columns hold still (animation paused via a data attribute).
 */
export const ThreeDMarquee = forwardRef<HTMLDivElement, ThreeDMarqueeProps>(
  function ThreeDMarquee(
    { images, columns = 4, duration = 40, alt, className, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();

    // Split images into N columns round-robin; duplicate each column's list so
    // the vertical loop is seamless.
    const cols = useMemo(() => {
      const buckets: string[][] = Array.from({ length: columns }, () => []);
      images.forEach((src, i) => {
        buckets[i % columns].push(src);
      });
      return buckets;
    }, [images, columns]);

    return (
      <div
        ref={ref}
        className={cn("nova-three-d-marquee", className)}
        style={
          {
            "--nova-three-d-marquee-duration": `${duration}s`,
            ...style,
          } as React.CSSProperties
        }
        data-reduced={reduced ? "" : undefined}
        {...rest}
      >
        <div className="nova-three-d-marquee__stage" aria-hidden="true">
          <div className="nova-three-d-marquee__grid">
            {cols.map((bucket, ci) => (
              <div
                key={ci}
                className="nova-three-d-marquee__col"
                data-dir={ci % 2 === 0 ? "up" : "down"}
              >
                <div className="nova-three-d-marquee__track">
                  {[...bucket, ...bucket].map((src, ri) => (
                    <div className="nova-three-d-marquee__tile" key={ri}>
                      <img
                        className="nova-three-d-marquee__img"
                        src={src}
                        alt={alt ? alt(src, ri % bucket.length) : ""}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
