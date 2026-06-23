import { useEffect, useRef, useState } from "react";

export interface WindowSize {
  /** Viewport width in px, or `undefined` before mount / on the server. */
  width: number | undefined;
  /** Viewport height in px, or `undefined` before mount / on the server. */
  height: number | undefined;
}

export interface UseWindowSizeOptions {
  /** Debounce resize updates by this many ms. `0` (default) updates eagerly. */
  debounce?: number;
}

/**
 * Tracks the viewport dimensions.
 *
 * SSR-safe: returns `{ width: undefined, height: undefined }` on the server and
 * during the first client render, then measures after mount. Subscribes to
 * `resize` with cleanup; pass `debounce` to throttle rapid resize events.
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { debounce = 0 } = options;

  const [size, setSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measure = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    const onResize =
      debounce > 0
        ? () => {
            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              timeoutRef.current = null;
              measure();
            }, debounce);
          }
        : measure;

    // Sync immediately on mount.
    measure();

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [debounce]);

  return size;
}
