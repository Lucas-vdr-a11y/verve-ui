import { useCallback, useMemo, useState } from "react";

export interface UseListReturn<T> {
  /** Current array. */
  list: T[];
  /** Replace the whole list. Accepts an updater function. */
  set: (value: T[] | ((prev: T[]) => T[])) => void;
  /** Append one or more items to the end. */
  push: (...items: T[]) => void;
  /** Remove the item at `index` (no-op if out of range). */
  removeAt: (index: number) => void;
  /** Insert `item` at `index` (clamped to `[0, length]`). */
  insertAt: (index: number, item: T) => void;
  /** Replace the item at `index` (no-op if out of range). Accepts an updater. */
  updateAt: (index: number, item: T | ((prev: T) => T)) => void;
  /** Empty the list. */
  clear: () => void;
  /** Move the item at `from` to `to` (both clamped; no-op if out of range). */
  move: (from: number, to: number) => void;
}

/**
 * Array state with common mutation helpers.
 *
 * Returns `{ list, set, push, removeAt, insertAt, updateAt, clear, move }`. All
 * helpers are immutable (produce a new array) and stable across renders.
 */
export function useList<T>(initial: T[] = []): UseListReturn<T> {
  const [list, setList] = useState<T[]>(initial);

  const set = useCallback<UseListReturn<T>["set"]>(
    (value) =>
      setList((prev) =>
        typeof value === "function" ? (value as (p: T[]) => T[])(prev) : value
      ),
    []
  );

  const push = useCallback(
    (...items: T[]) => setList((prev) => [...prev, ...items]),
    []
  );

  const removeAt = useCallback((index: number) => {
    setList((prev) =>
      index < 0 || index >= prev.length
        ? prev
        : [...prev.slice(0, index), ...prev.slice(index + 1)]
    );
  }, []);

  const insertAt = useCallback((index: number, item: T) => {
    setList((prev) => {
      const at = Math.min(Math.max(index, 0), prev.length);
      return [...prev.slice(0, at), item, ...prev.slice(at)];
    });
  }, []);

  const updateAt = useCallback<UseListReturn<T>["updateAt"]>((index, item) => {
    setList((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.slice();
      next[index] =
        typeof item === "function"
          ? (item as (prev: T) => T)(prev[index])
          : item;
      return next;
    });
  }, []);

  const clear = useCallback(() => setList([]), []);

  const move = useCallback((from: number, to: number) => {
    setList((prev) => {
      if (
        from < 0 ||
        from >= prev.length ||
        to < 0 ||
        to >= prev.length ||
        from === to
      ) {
        return prev;
      }
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ list, set, push, removeAt, insertAt, updateAt, clear, move }),
    [list, set, push, removeAt, insertAt, updateAt, clear, move]
  );
}
