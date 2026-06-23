import { useCallback, useEffect, useRef } from "react";

export interface UseTimeoutControls {
  /** Restart the timeout from now. */
  reset: () => void;
  /** Cancel a pending timeout. */
  clear: () => void;
}

/**
 * Declarative `setTimeout`.
 *
 * The `callback` is kept in a ref so it can change without restarting the
 * timer. Pass `delay = null` to disable. Returns `{ reset, clear }` for
 * imperative control. The timeout is cleared on unmount or when `delay`
 * changes.
 */
export function useTimeout(
  callback: () => void,
  delay: number | null
): UseTimeoutControls {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const set = useCallback(() => {
    clear();
    if (delay === null) return;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callbackRef.current();
    }, delay);
  }, [clear, delay]);

  const reset = useCallback(() => set(), [set]);

  useEffect(() => {
    set();
    return clear;
  }, [set, clear]);

  return { reset, clear };
}
