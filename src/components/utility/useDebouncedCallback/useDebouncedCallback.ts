import { useCallback, useEffect, useMemo, useRef } from "react";

export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel a pending invocation, if any. */
  cancel: () => void;
  /** Invoke immediately with the most recent arguments, cancelling the timer. */
  flush: () => void;
}

/**
 * Returns a debounced version of `callback` that delays invocation until
 * `delay` ms have elapsed since the last call.
 *
 * The latest `callback` is always used (kept in a ref) so the debounced
 * function identity is stable. Any pending call is cancelled on unmount.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 200
): DebouncedFunction<Args> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lastArgsRef.current !== null) {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      callbackRef.current(...args);
    }
  }, []);

  // Cancel any pending timer when the component unmounts.
  useEffect(() => cancel, [cancel]);

  const debounced = useCallback(
    (...args: Args) => {
      lastArgsRef.current = args;
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        lastArgsRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return useMemo<DebouncedFunction<Args>>(() => {
    const fn = debounced as DebouncedFunction<Args>;
    fn.cancel = cancel;
    fn.flush = flush;
    return fn;
  }, [debounced, cancel, flush]);
}
