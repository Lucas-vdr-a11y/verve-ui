import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ScrollVelocitySkew.css";

export interface ScrollVelocitySkewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text repeated across the marquee row. */
  text: string;
  /** Base drift speed (px/frame) while idle. Defaults `1`. */
  baseSpeed?: number;
  /** Maximum skew (degrees) at high scroll velocity. Defaults `12`. */
  maxSkew?: number;
  /** Number of repeated copies to fill the row. Defaults `4`. */
  repeat?: number;
}

/**
 * ScrollVelocitySkew — a continuously drifting marquee whose text skews and
 * stretches based on scroll velocity: the faster you scroll, the more the row
 * leans and the faster it travels; scroll direction flips the drift direction.
 * Returns to a gentle idle drift when scrolling stops.
 *
 * A single rAF loop integrates position from a decaying velocity derived from
 * `window.scrollY` deltas; the loop and scroll listener are created in an effect
 * with cleanup and guard `window`, so it is SSR-safe. Under reduced motion the
 * row is static with no skew.
 */
export const ScrollVelocitySkew = forwardRef<
  HTMLDivElement,
  ScrollVelocitySkewProps
>(function ScrollVelocitySkew(
  { text, baseSpeed = 1, maxSkew = 12, repeat = 4, className, ...rest },
  ref
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let offset = 0;
    let velocity = 0; // smoothed scroll velocity (px/frame-ish)
    let lastScroll = window.scrollY;
    let dir = -1; // drift direction

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll;
      lastScroll = y;
      // accumulate into velocity; clamp to avoid runaway
      velocity += delta;
      velocity = Math.max(-120, Math.min(120, velocity));
      if (delta !== 0) dir = delta > 0 ? -1 : 1;
    };

    const tick = () => {
      // decay velocity toward zero
      velocity *= 0.9;
      if (Math.abs(velocity) < 0.01) velocity = 0;

      const speed = baseSpeed + Math.abs(velocity) * 0.4;
      offset += dir * speed;

      // wrap within one half-width for a seamless loop
      const half = track.scrollWidth / 2 || 1;
      if (offset <= -half) offset += half;
      if (offset >= 0) offset -= half;

      const skew = Math.max(
        -maxSkew,
        Math.min(maxSkew, velocity * 0.18)
      );
      const stretch = 1 + Math.min(0.12, Math.abs(velocity) * 0.0016);

      track.style.transform = `translateX(${offset}px) skewX(${skew}deg) scaleX(${stretch})`;
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, [reduced, baseSpeed, maxSkew]);

  const copies = Array.from({ length: Math.max(2, repeat) });

  return (
    <div
      ref={ref}
      className={cn(
        "nova-scroll-velocity-skew",
        reduced && "nova-scroll-velocity-skew--static",
        className
      )}
      {...rest}
    >
      <div className="nova-scroll-velocity-skew__track" ref={trackRef}>
        {/* duplicated set for seamless wrap */}
        {[0, 1].map((set) => (
          <div className="nova-scroll-velocity-skew__set" key={set} aria-hidden={set === 1}>
            {copies.map((_, i) => (
              <span className="nova-scroll-velocity-skew__word" key={i}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
