import { useCallback, useMemo, useState } from "react";

export interface UseMapReturn<K, V> {
  /** Current map (a new `Map` instance on every change). */
  map: Map<K, V>;
  /** Set `key` to `value`. */
  set: (key: K, value: V) => void;
  /** Read the value for `key`, or `undefined`. */
  get: (key: K) => V | undefined;
  /** Whether `key` exists. */
  has: (key: K) => boolean;
  /** Delete `key` (no-op if absent). */
  remove: (key: K) => void;
  /** Empty the map. */
  clear: () => void;
  /** Reset back to the initial entries. */
  reset: () => void;
}

type MapInit<K, V> = Iterable<readonly [K, V]>;

/**
 * `Map` state with helpers.
 *
 * Returns `{ map, set, get, has, remove, clear, reset }`. Mutations produce a
 * fresh `Map` so React re-renders. Helper callbacks are stable across renders.
 */
export function useMap<K, V>(
  initial?: MapInit<K, V>
): UseMapReturn<K, V> {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initial));

  const set = useCallback((key: K, value: V) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const get = useCallback((key: K) => map.get(key), [map]);

  const has = useCallback((key: K) => map.has(key), [map]);

  const remove = useCallback((key: K) => {
    setMap((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => setMap(new Map()), []);

  const reset = useCallback(() => setMap(new Map(initial)), [initial]);

  return useMemo(
    () => ({ map, set, get, has, remove, clear, reset }),
    [map, set, get, has, remove, clear, reset]
  );
}
