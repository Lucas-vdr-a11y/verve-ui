import { useEffect, useRef, type DependencyList, type EffectCallback } from "react";

/**
 * Like `useEffect`, but skips the first (mount) invocation. The effect runs only
 * on updates when `deps` change. Cleanup behaves the same as `useEffect`.
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
