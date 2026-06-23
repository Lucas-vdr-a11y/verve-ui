import { useRef, type MutableRefObject } from "react";

/**
 * Returns a ref whose `.current` always holds the latest `value`.
 *
 * Useful inside effects, event handlers, or timers that close over a value but
 * should read the most recent one without re-subscribing.
 */
export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
