import { useMemo, useState } from "react";

export interface UseToggleActions {
  /** Flip the current value. */
  toggle: () => void;
  /** Set to `true`. */
  on: () => void;
  /** Set to `false`. */
  off: () => void;
  /** Set to an explicit value. */
  set: (value: boolean) => void;
}

export type UseToggleReturn = [boolean, UseToggleActions];

/**
 * Boolean state helper.
 *
 * Returns `[on, { toggle, on, off, set }]`. The actions object is stable across
 * renders (the setters never change identity).
 */
export function useToggle(initial = false): UseToggleReturn {
  const [value, setValue] = useState<boolean>(initial);

  const actions = useMemo<UseToggleActions>(
    () => ({
      toggle: () => setValue((v) => !v),
      on: () => setValue(true),
      off: () => setValue(false),
      set: (next: boolean) => setValue(next),
    }),
    []
  );

  return [value, actions];
}
