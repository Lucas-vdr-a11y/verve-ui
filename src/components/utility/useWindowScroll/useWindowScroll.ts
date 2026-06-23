import { useCallback, useEffect, useState } from "react";

export interface WindowScrollPosition {
  x: number;
  y: number;
}

export interface UseWindowScrollReturn extends WindowScrollPosition {
  /** Programmatically scroll the window. Accepts `ScrollToOptions`. */
  scrollTo: (options: ScrollToOptions) => void;
}

/**
 * Tracks the window scroll position and exposes a `scrollTo` helper.
 *
 * Reads are throttled via `requestAnimationFrame`. SSR-safe: returns
 * `{ x: 0, y: 0 }` on the server and syncs the real position after mount. The
 * scroll listener and any pending frame are cleaned up on unmount.
 *
 * Returns `{ x, y, scrollTo }`.
 */
export function useWindowScroll(): UseWindowScrollReturn {
  const [position, setPosition] = useState<WindowScrollPosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame: number | null = null;

    const read = () => {
      frame = null;
      setPosition({ x: window.scrollX, y: window.scrollY });
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(read);
    };

    setPosition({ x: window.scrollX, y: window.scrollY });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = useCallback((options: ScrollToOptions) => {
    if (typeof window === "undefined") return;
    window.scrollTo(options);
  }, []);

  return { x: position.x, y: position.y, scrollTo };
}
