import { useCallback, useMemo, useState } from "react";

interface HistoryState<T> {
  /** All recorded values, oldest first. */
  past: T[];
  /** The current value. */
  present: T;
  /** Undone values awaiting redo, most-recently-undone first. */
  future: T[];
}

export interface UseStateHistoryReturn<T> {
  /** Current value. */
  state: T;
  /** Push a new value, clearing the redo stack. Accepts an updater function. */
  set: (value: T | ((prev: T) => T)) => void;
  /** Step back to the previous value (no-op if `!canUndo`). */
  undo: () => void;
  /** Step forward to a previously undone value (no-op if `!canRedo`). */
  redo: () => void;
  /** Whether an `undo` is possible. */
  canUndo: boolean;
  /** Whether a `redo` is possible. */
  canRedo: boolean;
  /** Full ordered history of values (past + present + future, oldest first). */
  history: T[];
}

/**
 * Stateful value with undo/redo history.
 *
 * Returns `{ state, set, undo, redo, canUndo, canRedo, history }`. Each `set`
 * records a new entry and clears the redo stack; `undo`/`redo` walk the stack.
 * Action callbacks are stable across renders.
 */
export function useStateHistory<T>(initial: T): UseStateHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const set = useCallback<UseStateHistoryReturn<T>["set"]>((value) => {
    setHistory((current) => {
      const next =
        typeof value === "function"
          ? (value as (prev: T) => T)(current.present)
          : value;
      if (Object.is(next, current.present)) return current;
      return {
        past: [...current.past, current.present],
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const [next, ...rest] = current.future;
      return {
        past: [...current.past, current.present],
        present: next,
        future: rest,
      };
    });
  }, []);

  return useMemo(
    () => ({
      state: history.present,
      set,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      history: [...history.past, history.present, ...history.future],
    }),
    [history, set, undo, redo]
  );
}
