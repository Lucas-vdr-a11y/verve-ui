import { useEffect, useState, type RefObject } from "react";

export interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Tracks the scroll position of the window, or of a scrollable element when a
 * `ref` is provided.
 *
 * Reads are throttled via `requestAnimationFrame` so updates stay in sync with
 * paint and never fire more than once per frame. SSR-safe: returns
 * `{ x: 0, y: 0 }` on the server and reads the real position after mount. The
 * scroll listener and any pending frame are cleaned up on unmount.
 */
export function useScrollPosition(
  ref?: RefObject<HTMLElement | null>
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target: HTMLElement | Window = ref?.current ?? window;

    const read = (): ScrollPosition =>
      target === window
        ? { x: window.scrollX, y: window.scrollY }
        : {
            x: (target as HTMLElement).scrollLeft,
            y: (target as HTMLElement).scrollTop,
          };

    let frame: number | null = null;

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        setPosition(read());
      });
    };

    // Sync the initial position after mount.
    setPosition(read());

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [ref]);

  return position;
}
