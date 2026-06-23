import { useCallback, useRef, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Controlled value. When provided (not `undefined`), the hook is controlled. */
  value?: T;
  /** Initial value used in uncontrolled mode. */
  defaultValue?: T | (() => T);
  /** Called whenever the value changes, in both modes. */
  onChange?: (value: T) => void;
}

export type UseControllableStateReturn<T> = [
  T,
  (next: T | ((prev: T) => T)) => void,
];

/**
 * Generic controlled/uncontrolled state hook.
 *
 * - **Controlled:** pass `value` (and usually `onChange`). The hook mirrors the
 *   incoming `value` and never owns internal state; the updater just calls
 *   `onChange` with the resolved next value.
 * - **Uncontrolled:** omit `value` and (optionally) pass `defaultValue`. The
 *   hook owns the state and still calls `onChange` on every update.
 *
 * The control mode is locked on first render (a component should not flip
 * between controlled and uncontrolled), matching React's own conventions.
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>
): UseControllableStateReturn<T> {
  const { value, defaultValue, onChange } = options;

  const isControlled = value !== undefined;
  // Lock the mode for the lifetime of the component.
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const [uncontrolled, setUncontrolled] = useState<T>(
    () =>
      (typeof defaultValue === "function"
        ? (defaultValue as () => T)()
        : (defaultValue as T))
  );

  const resolved = isControlled ? (value as T) : uncontrolled;

  // Keep the latest resolved value in a ref so functional updates in
  // controlled mode see the current value without re-creating the setter.
  const resolvedRef = useRef(resolved);
  resolvedRef.current = resolved;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const prev = resolvedRef.current;
    const resolvedNext =
      typeof next === "function"
        ? (next as (prev: T) => T)(prev)
        : next;

    if (!isControlledRef.current) {
      setUncontrolled(resolvedNext);
    }

    if (resolvedNext !== prev) {
      onChangeRef.current?.(resolvedNext);
    }
  }, []);

  return [resolved, setValue];
}
