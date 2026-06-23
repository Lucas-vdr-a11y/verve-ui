import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";

/**
 * Returns a callback with a stable identity that always invokes the latest
 * `fn`.
 *
 * Combines `useCallback` with a ref so the returned function never changes
 * between renders (safe to pass to memoized children or effect deps) while
 * still calling the most up-to-date closure. The ref is updated in a layout
 * effect so the latest `fn` is in place before paint.
 */
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const fnRef = useRef<(...args: Args) => R>(fn);

  useIsomorphicLayoutEffect(() => {
    fnRef.current = fn;
  });

  return useCallback((...args: Args) => fnRef.current(...args), []);
}
