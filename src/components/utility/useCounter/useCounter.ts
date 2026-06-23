import { useCallback, useMemo, useState } from "react";

export interface UseCounterOptions {
  /** Lower bound. Values are clamped to this minimum. */
  min?: number;
  /** Upper bound. Values are clamped to this maximum. */
  max?: number;
}

export interface UseCounterReturn {
  /** Current count (always within `[min, max]`). */
  count: number;
  /** Increase by `step` (default `1`), clamped. */
  increment: (step?: number) => void;
  /** Decrease by `step` (default `1`), clamped. */
  decrement: (step?: number) => void;
  /** Set an explicit value, clamped. Accepts an updater function. */
  set: (value: number | ((prev: number) => number)) => void;
  /** Reset back to the initial value, clamped. */
  reset: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Numeric counter with optional min/max clamping.
 *
 * Returns `{ count, increment, decrement, set, reset }`. The action callbacks
 * are stable across renders.
 */
export function useCounter(
  initial = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min = -Infinity, max = Infinity } = options;

  const [count, setCount] = useState<number>(() => clamp(initial, min, max));

  const set = useCallback<UseCounterReturn["set"]>(
    (value) =>
      setCount((prev) =>
        clamp(typeof value === "function" ? value(prev) : value, min, max)
      ),
    [min, max]
  );

  const increment = useCallback(
    (step = 1) => setCount((prev) => clamp(prev + step, min, max)),
    [min, max]
  );

  const decrement = useCallback(
    (step = 1) => setCount((prev) => clamp(prev - step, min, max)),
    [min, max]
  );

  const reset = useCallback(
    () => setCount(clamp(initial, min, max)),
    [initial, min, max]
  );

  return useMemo(
    () => ({ count, increment, decrement, set, reset }),
    [count, increment, decrement, set, reset]
  );
}
