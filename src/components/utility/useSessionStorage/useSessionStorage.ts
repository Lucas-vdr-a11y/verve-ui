import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSessionStorageOptions<T> {
  /** Custom serializer. Defaults to `JSON.stringify`. */
  serialize?: (value: T) => string;
  /** Custom deserializer. Defaults to `JSON.parse`. */
  deserialize?: (raw: string) => T;
}

export type UseSessionStorageReturn<T> = [
  T,
  (next: T | ((prev: T) => T)) => void,
  () => void,
];

/**
 * Reactive state synced to `sessionStorage` under `key`.
 *
 * SSR-safe: renders `initialValue` on the server and during the first client
 * render, then hydrates from storage in an effect (avoiding hydration
 * mismatches). Values are JSON-serialized by default. Unlike `useLocalStorage`,
 * `sessionStorage` is per-tab and not shared across tabs, so no `storage`
 * listener is registered.
 *
 * Returns `[value, setValue, remove]`. `remove` deletes the key and resets the
 * state to `initialValue`.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {}
): UseSessionStorageReturn<T> {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const readInitial = useCallback((): T => {
    const init = initialValueRef.current;
    return typeof init === "function" ? (init as () => T)() : init;
  }, []);

  const [value, setValue] = useState<T>(readInitial);

  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;
  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;

  const readStored = useCallback((): T | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw === null) return undefined;
      return deserializeRef.current(raw);
    } catch {
      return undefined;
    }
  }, [key]);

  // Hydrate from storage after mount (SSR-safe). Re-runs when `key` changes.
  useEffect(() => {
    const stored = readStored();
    if (stored !== undefined) {
      setValue(stored);
    } else {
      setValue(readInitial());
    }
  }, [key, readStored, readInitial]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(key, serializeRef.current(resolved));
          } catch {
            /* ignore quota / disabled storage */
          }
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    setValue(readInitial());
  }, [key, readInitial]);

  return [value, set, remove];
}
