import { useEffect, useRef } from "react";

/**
 * Runs `callback` once, when the component unmounts. Always invokes the latest
 * callback without re-subscribing.
 */
export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(
    () => () => {
      callbackRef.current();
    },
    []
  );
}
