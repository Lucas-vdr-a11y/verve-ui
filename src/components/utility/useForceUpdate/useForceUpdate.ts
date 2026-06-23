import { useReducer } from "react";

/**
 * Returns a stable function that forces the component to re-render.
 *
 * Useful for bridging mutable/external state into React. Prefer real state where
 * possible; reach for this only when a re-render must be triggered imperatively.
 */
export function useForceUpdate(): () => void {
  const [, dispatch] = useReducer((tick: number) => tick + 1, 0);
  return dispatch as () => void;
}
