import { useCallback, useEffect, useMemo, useRef } from "react";

export interface ThrottledFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel a pending trailing invocation, if any. */
  cancel: () => void;
}

/**
 * Returns a throttled version of `callback` that runs at most once every
 * `delay` ms (leading + trailing edge).
 *
 * The first call fires immediately; further calls within the window are
 * coalesced and the most recent arguments fire on the trailing edge. The
 * latest `callback` is always used (kept in a ref) so the returned identity is
 * stable. Any pending trailing call is cancelled on unmount.
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 200
): ThrottledFunction<Args> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  // Cancel any pending trailing call when the component unmounts.
  useEffect(() => cancel, [cancel]);

  const throttled = useCallback(
    (...args: Args) => {
      const now = Date.now();
      const remaining = delay - (now - lastRunRef.current);
      lastArgsRef.current = args;

      if (remaining <= 0) {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        lastRunRef.current = now;
        const callArgs = lastArgsRef.current;
        lastArgsRef.current = null;
        callbackRef.current(...callArgs);
      } else if (timeoutRef.current === null) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          lastRunRef.current = Date.now();
          if (lastArgsRef.current !== null) {
            const callArgs = lastArgsRef.current;
            lastArgsRef.current = null;
            callbackRef.current(...callArgs);
          }
        }, remaining);
      }
    },
    [delay]
  );

  return useMemo<ThrottledFunction<Args>>(() => {
    const fn = throttled as ThrottledFunction<Args>;
    fn.cancel = cancel;
    return fn;
  }, [throttled, cancel]);
}
