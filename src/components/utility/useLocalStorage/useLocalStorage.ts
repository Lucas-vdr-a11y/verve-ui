import { useCallback, useEffect, useRef, useState } from "react";

export interface UseLocalStorageOptions<T> {
  /** Custom serializer. Defaults to `JSON.stringify`. */
  serialize?: (value: T) => string;
  /** Custom deserializer. Defaults to `JSON.parse`. */
  deserialize?: (raw: string) => T;
}

export type UseLocalStorageReturn<T> = [
  T,
  (next: T | ((prev: T) => T)) => void,
  () => void,
];

/**
 * Reactive state synced to `localStorage` under `key`.
 *
 * SSR-safe: renders `initialValue` on the server and during the first client
 * render, then hydrates from storage in an effect (avoiding hydration
 * mismatches). Stays in sync across tabs via the `storage` event. Values are
 * JSON-serialized by default.
 *
 * Returns `[value, setValue, remove]`. `remove` deletes the key and resets the
 * state to `initialValue`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  // Keep the latest `initialValue` in a ref so `readInitial` can stay stable
  // without re-subscribing effects when a fresh literal is passed each render.
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const readInitial = useCallback((): T => {
    const init = initialValueRef.current;
    return typeof init === "function" ? (init as () => T)() : init;
  }, []);

  const [value, setValue] = useState<T>(readInitial);

  // Keep latest deserialize/serialize in refs so the storage listener and
  // setter don't need to be re-created when these change identity.
  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;
  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;

  const readStored = useCallback((): T | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = window.localStorage.getItem(key);
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
          typeof next === "function"
            ? (next as (prev: T) => T)(prev)
            : next;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, serializeRef.current(resolved));
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
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    setValue(readInitial());
  }, [key, readInitial]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage || e.key !== key) return;
      if (e.newValue === null) {
        setValue(readInitial());
        return;
      }
      try {
        setValue(deserializeRef.current(e.newValue));
      } catch {
        /* ignore malformed payloads from other tabs */
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, readInitial]);

  return [value, set, remove];
}
