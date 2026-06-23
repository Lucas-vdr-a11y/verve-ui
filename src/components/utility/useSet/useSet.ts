import { useCallback, useMemo, useState } from "react";

export interface UseSetReturn<T> {
  /** Current set (a new `Set` instance on every change). */
  set: Set<T>;
  /** Add a value. */
  add: (value: T) => void;
  /** Remove a value (no-op if absent). */
  remove: (value: T) => void;
  /** Add the value if absent, remove it if present. */
  toggle: (value: T) => void;
  /** Whether the value is present. */
  has: (value: T) => boolean;
  /** Empty the set. */
  clear: () => void;
  /** Reset back to the initial values. */
  reset: () => void;
}

/**
 * `Set` state with helpers.
 *
 * Returns `{ set, add, remove, toggle, has, clear, reset }`. Mutations produce a
 * fresh `Set` so React re-renders. Helper callbacks are stable across renders.
 */
export function useSet<T>(initial?: Iterable<T>): UseSetReturn<T> {
  const [set, setSet] = useState<Set<T>>(() => new Set(initial));

  const add = useCallback((value: T) => {
    setSet((prev) => {
      if (prev.has(value)) return prev;
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }, []);

  const remove = useCallback((value: T) => {
    setSet((prev) => {
      if (!prev.has(value)) return prev;
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const toggle = useCallback((value: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const has = useCallback((value: T) => set.has(value), [set]);

  const clear = useCallback(() => setSet(new Set()), []);

  const reset = useCallback(() => setSet(new Set(initial)), [initial]);

  return useMemo(
    () => ({ set, add, remove, toggle, has, clear, reset }),
    [set, add, remove, toggle, has, clear, reset]
  );
}
