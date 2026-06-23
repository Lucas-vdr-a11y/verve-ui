import { useEffect, useRef, useState, type RefObject } from "react";

export type ScrollDirection = "up" | "down" | null;

export interface UseScrollDirectionOptions {
  /**
   * Minimum scroll movement (px) required before the direction changes.
   * Filters out tiny jitters. Defaults to `0`.
   */
  threshold?: number;
}

/**
 * Reports the vertical scroll direction (`"up"` | `"down"`) of the window, or
 * of a scrollable element when a `ref` is given.
 *
 * Movements smaller than `threshold` are ignored. Reads are throttled via
 * `requestAnimationFrame`. SSR-safe: starts as `null` and resolves after the
 * first scroll past the threshold. The listener and any pending frame are
 * cleaned up on unmount.
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {},
  ref?: RefObject<HTMLElement | null>
): ScrollDirection {
  const { threshold = 0 } = options;
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastYRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target: HTMLElement | Window = ref?.current ?? window;

    const readY = (): number =>
      target === window
        ? window.scrollY
        : (target as HTMLElement).scrollTop;

    lastYRef.current = readY();
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const y = readY();
      const diff = y - lastYRef.current;
      if (Math.abs(diff) < threshold) return;
      setDirection(diff > 0 ? "down" : "up");
      lastYRef.current = y;
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(update);
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [ref, threshold]);

  return direction;
}
