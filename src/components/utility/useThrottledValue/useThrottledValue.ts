import { useEffect, useRef, useState } from "react";

/**
 * Returns a throttled copy of `value` that updates at most once every `delay`
 * ms (leading + trailing edge).
 *
 * The leading edge fires immediately on the first change; subsequent rapid
 * changes are coalesced and the latest value is emitted on the trailing edge
 * once the cooldown elapses. The pending trailing timer is cleared on unmount.
 */
export function useThrottledValue<T>(value: T, delay = 200): T {
  const [throttled, setThrottled] = useState<T>(value);

  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastRunRef.current);

    if (remaining <= 0) {
      // Leading edge: enough time has passed, update immediately.
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      lastRunRef.current = now;
      setThrottled(value);
    } else if (timeoutRef.current === null) {
      // Trailing edge: schedule an update with the latest value.
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        lastRunRef.current = Date.now();
        setThrottled(valueRef.current);
      }, remaining);
    }
  }, [value, delay]);

  // Clear any pending trailing timer on unmount.
  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    []
  );

  return throttled;
}
