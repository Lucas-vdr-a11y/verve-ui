import { useCallback, type Ref, type RefCallback } from "react";

/**
 * Merges multiple refs (callback refs and ref objects) into a single ref
 * callback. Useful when a component needs both its own internal ref and a
 * forwarded ref on the same node.
 *
 * Returns a stable callback (memoised on the provided refs) that assigns the
 * node to every supplied ref. `null`/`undefined` refs are ignored.
 */
export function useMergedRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
