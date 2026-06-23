import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./HorizontalScrollSection.css";

export interface HorizontalScrollSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal items (cards, slides, panels). */
  children: React.ReactNode;
  /**
   * How tall the scroll section is, as a multiple of the viewport height. More
   * height = slower horizontal travel. Defaults `2.5`.
   */
  heightVh?: number;
}

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * HorizontalScrollSection — a tall pinned section whose inner track translates
 * horizontally as the user scrolls vertically past it, revealing each panel in
 * turn (galleries, steps, feature reels).
 *
 * Translate distance = track overflow width; progress is read from the section
 * rect once per animation frame (rAF-throttled scroll + resize, cleaned up on
 * unmount) and the track is measured via ResizeObserver. SSR-safe; under reduced
 * motion the track simply scrolls horizontally on its own (no pin).
 */
export const HorizontalScrollSection = forwardRef<
  HTMLDivElement,
  HorizontalScrollSectionProps
>(function HorizontalScrollSection(
  { children, heightVh = 2.5, className, style, ...rest },
  ref
) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const measureDistance = () => {
      const overflow = track.scrollWidth - track.clientWidth;
      setDistance(overflow > 0 ? overflow : 0);
    };

    const measureProgress = () => {
      frame.current = null;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height - vh;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const p = -rect.top / total;
      setProgress(clamp(p));
    };

    const schedule = () => {
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(measureProgress);
      }
    };

    measureDistance();
    measureProgress();

    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => {
        measureDistance();
        schedule();
      });
      ro.observe(track);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("resize", measureDistance, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("resize", measureDistance);
      ro?.disconnect();
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [children]);

  return (
    <div
      ref={mergeRefs(ref, sectionRef)}
      className={cn("nova-horizontal-scroll", className)}
      style={
        {
          "--nova-horizontal-scroll-height": `${heightVh * 100}vh`,
          "--nova-horizontal-scroll-x": `${-distance * progress}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-horizontal-scroll__sticky">
        <div ref={trackRef} className="nova-horizontal-scroll__track">
          {children}
        </div>
      </div>
    </div>
  );
});

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
