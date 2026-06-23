import { useEffect, useRef, useState, type RefObject } from "react";

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Stop observing after the first time the element intersects. */
  freezeOnceVisible?: boolean;
  /** When `false`, the observer is not created. Defaults to `true`. */
  enabled?: boolean;
}

export type UseIntersectionObserverReturn<T extends Element> = [
  RefObject<T | null>,
  IntersectionObserverEntry | undefined,
  boolean,
];

/**
 * Observe an element's intersection with the viewport (or `root`).
 *
 * Returns `[ref, entry, isIntersecting]`. SSR-safe: the observer is only
 * created in an effect and skipped where `IntersectionObserver` is unavailable.
 * `root`, `rootMargin` and `threshold` pass straight through. The observer is
 * disconnected on unmount or when options/node change.
 */
export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const {
    root = null,
    rootMargin,
    threshold,
    freezeOnceVisible = false,
    enabled = true,
  } = options;

  const ref = useRef<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(
    undefined
  );

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = ref.current;

    if (
      !enabled ||
      frozen ||
      !node ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([observedEntry]) => setEntry(observedEntry),
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // `threshold` may be an array; stringify so identity changes are detected.
  }, [
    enabled,
    frozen,
    root,
    rootMargin,
    Array.isArray(threshold) ? threshold.join(",") : threshold,
  ]);

  return [ref, entry, Boolean(entry?.isIntersecting)];
}
