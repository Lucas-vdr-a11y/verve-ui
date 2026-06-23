import { useEffect, useRef } from "react";

/**
 * Runs `callback` exactly once, when the component unmounts.
 *
 * The latest `callback` is kept in a ref so it can change between renders
 * without re-subscribing, and only the final version runs on teardown.
 */
export function useUnmountEffect(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(
    () => () => {
      callbackRef.current();
    },
    []
  );
}
