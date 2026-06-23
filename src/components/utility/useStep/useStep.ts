import { useCallback, useMemo, useState } from "react";

export interface UseStepReturn {
  /** Current step index (0-based, within `[0, count - 1]`). */
  step: number;
  /** Advance to the next step (no-op if `!canNext`). */
  next: () => void;
  /** Go back to the previous step (no-op if `!canPrev`). */
  prev: () => void;
  /** Jump to an explicit step (clamped to `[0, count - 1]`). */
  goTo: (step: number) => void;
  /** Return to the first step. */
  reset: () => void;
  /** Whether a `next` is possible. */
  canNext: boolean;
  /** Whether a `prev` is possible. */
  canPrev: boolean;
  /** Whether the current step is the first. */
  isFirst: boolean;
  /** Whether the current step is the last. */
  isLast: boolean;
}

/**
 * Wizard / stepper state for a fixed number of steps.
 *
 * Returns `{ step, next, prev, goTo, reset, canNext, canPrev, isFirst, isLast }`.
 * `count` is the total number of steps. Action callbacks are stable across
 * renders.
 */
export function useStep(count: number, initialStep = 0): UseStepReturn {
  const max = Math.max(count - 1, 0);

  const clampStep = useCallback(
    (value: number) => Math.min(Math.max(value, 0), max),
    [max]
  );

  const [step, setStep] = useState<number>(() => clampStep(initialStep));

  const next = useCallback(
    () => setStep((s) => clampStep(s + 1)),
    [clampStep]
  );

  const prev = useCallback(
    () => setStep((s) => clampStep(s - 1)),
    [clampStep]
  );

  const goTo = useCallback(
    (value: number) => setStep(clampStep(value)),
    [clampStep]
  );

  const reset = useCallback(
    () => setStep(clampStep(initialStep)),
    [clampStep, initialStep]
  );

  return useMemo(
    () => ({
      step,
      next,
      prev,
      goTo,
      reset,
      canNext: step < max,
      canPrev: step > 0,
      isFirst: step === 0,
      isLast: step === max,
    }),
    [step, max, next, prev, goTo, reset]
  );
}
