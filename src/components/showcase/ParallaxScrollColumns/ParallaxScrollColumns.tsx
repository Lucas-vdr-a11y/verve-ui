import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ParallaxScrollColumns.css";

export interface ParallaxScrollColumnsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Items to distribute across the columns, in order. */
  items: React.ReactNode[];
  /** Number of columns. Defaults `3`. */
  columns?: 2 | 3;
  /** Max translate (px) applied to the fastest column. Defaults `120`. */
  intensity?: number;
}

/**
 * ParallaxScrollColumns — a multi-column gallery whose columns translate at
 * different speeds as the section scrolls through the viewport, for a parallax
 * effect. The scroll handler is rAF-throttled and reads scroll progress
 * relative to the container; listeners are cleaned up on unmount. SSR-safe
 * (starts un-parallaxed) and disabled entirely under reduced-motion.
 */
export const ParallaxScrollColumns = forwardRef<
  HTMLDivElement,
  ParallaxScrollColumnsProps
>(function ParallaxScrollColumns(
  { items, columns = 3, intensity = 120, className, style, ...rest },
  ref
) {
  const reduced = useReducedMotion();
  const localRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (reduced || typeof window === "undefined") {
      setProgress(0);
      return;
    }
    const update = () => {
      frameRef.current = null;
      const node = localRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the section enters from the bottom, 1 when it leaves the top.
      const p = (vh - rect.top) / (vh + rect.height);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (frameRef.current == null) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [reduced]);

  // Distribute items round-robin into columns.
  const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => {
    cols[i % columns]!.push(item);
  });

  // Per-column speed multipliers (centre slower, edges faster).
  const speeds =
    columns === 2 ? [-1, 0.5] : [-1, 0.35, -0.6];

  return (
    <div
      ref={setRefs}
      className={cn(
        "nova-parallax-cols",
        `nova-parallax-cols--${columns}`,
        className
      )}
      style={style}
      {...rest}
    >
      {cols.map((colItems, ci) => {
        const offset = (progress - 0.5) * intensity * (speeds[ci] ?? 0);
        return (
          <div
            key={ci}
            className="nova-parallax-cols__col"
            style={{ transform: `translate3d(0, ${offset.toFixed(2)}px, 0)` }}
          >
            {colItems.map((item, ii) => (
              <div key={ii} className="nova-parallax-cols__cell">
                {item}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
});
