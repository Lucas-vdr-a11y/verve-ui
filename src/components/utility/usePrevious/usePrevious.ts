import { useEffect, useRef } from "react";

/**
 * Returns the value of `value` from the previous render.
 *
 * On the first render this returns `undefined`. The stored value updates in an
 * effect after each commit, so during render you always see the prior value.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
