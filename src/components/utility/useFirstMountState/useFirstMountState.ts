import { useRef } from "react";

/**
 * Returns `true` only on the component's first render, `false` thereafter.
 *
 * Unlike an effect-based flag, this is correct during the render itself (the
 * first render sees `true`), making it useful for skipping work that should
 * only run on updates.
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}
