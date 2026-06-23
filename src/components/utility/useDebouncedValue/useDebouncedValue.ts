import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates `delay` ms after the
 * input stops changing.
 *
 * The pending timer is cleared whenever `value` (or `delay`) changes and on
 * unmount, so rapid updates collapse into a single trailing change.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
