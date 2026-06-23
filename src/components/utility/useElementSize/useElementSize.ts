import { useCallback, useRef, useState } from "react";

export interface ElementSize {
  /** Measured content-box width in px. `0` before first measurement. */
  width: number;
  /** Measured content-box height in px. `0` before first measurement. */
  height: number;
}

export type UseElementSizeReturn<T extends HTMLElement = HTMLElement> = [
  (node: T | null) => void,
  ElementSize,
];

/**
 * Measures an element's size via `ResizeObserver`.
 *
 * Returns `[ref, { width, height }]`. Attach `ref` to the element you want to
 * observe. SSR-safe (only observes inside the browser) and disconnects the
 * observer on cleanup or when the ref detaches.
 */
export function useElementSize<
  T extends HTMLElement = HTMLElement,
>(): UseElementSizeReturn<T> {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    // Tear down any previous observer.
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return [ref, size];
}
