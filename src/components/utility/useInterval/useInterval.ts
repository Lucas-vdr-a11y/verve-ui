import { useEffect, useRef } from "react";

/**
 * Declarative `setInterval` (the Dan Abramov pattern).
 *
 * The `callback` is kept in a ref so it can change between renders without
 * resetting the timer. Pass `delay = null` to pause. The interval is cleared on
 * unmount or whenever `delay` changes.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
