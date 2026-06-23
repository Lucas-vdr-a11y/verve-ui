import { useRef } from "react";

/**
 * Returns the number of times the component has rendered, starting at `1` on
 * the first render and incrementing on every subsequent render.
 *
 * Primarily a debugging aid for spotting unnecessary re-renders.
 */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
