import { useCallback, useMemo, useRef, type PointerEvent } from "react";

export interface UseLongPressOptions {
  /** Hold duration in ms before firing (default `400`). */
  threshold?: number;
  /** Fired if the pointer is released before the threshold. */
  onCancel?: (event: PointerEvent) => void;
  /** Cancel the press if the pointer moves more than this many px (default `10`). */
  moveTolerance?: number;
}

export interface LongPressHandlers {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerLeave: (event: PointerEvent) => void;
}

/**
 * Long-press gesture binding.
 *
 * Returns handler props to spread onto an element. `callback` fires once the
 * pointer is held for `threshold` ms; the press is cancelled (firing `onCancel`)
 * on pointer up/leave before the threshold, or when the pointer moves beyond
 * `moveTolerance`. SSR-safe (timers only run client-side, inside event
 * handlers).
 */
export function useLongPress(
  callback: (event: PointerEvent) => void,
  options: UseLongPressOptions = {}
): LongPressHandlers {
  const { threshold = 400, onCancel, moveTolerance = 10 } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      clear();
      firedRef.current = false;
      startRef.current = { x: event.clientX, y: event.clientY };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        callback(event);
      }, threshold);
    },
    [callback, threshold, clear]
  );

  const cancel = useCallback(
    (event: PointerEvent) => {
      const wasPending = timerRef.current !== null;
      clear();
      startRef.current = null;
      if (wasPending && !firedRef.current) onCancel?.(event);
    },
    [clear, onCancel]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const start = startRef.current;
      if (!start || timerRef.current === null) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > moveTolerance) cancel(event);
    },
    [moveTolerance, cancel]
  );

  return useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerLeave: cancel,
    }),
    [onPointerDown, onPointerMove, cancel]
  );
}
