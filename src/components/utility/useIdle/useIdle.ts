import { useEffect, useRef, useState } from "react";

const DEFAULT_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
];

export interface UseIdleOptions {
  /**
   * Whether the user should be considered idle initially (before any activity).
   * Defaults to `false`.
   */
  initialState?: boolean;
  /** Activity events that reset the idle timer. */
  events?: (keyof WindowEventMap)[];
}

/**
 * Returns `true` once the user has been idle for `timeout` ms.
 *
 * Any of the configured activity events (mouse move/down, key, touch, scroll,
 * wheel) resets the timer back to "active". SSR-safe: subscribes inside an
 * effect and guards `window`. Listeners and the pending timer are cleaned up on
 * unmount.
 */
export function useIdle(timeout = 60_000, options: UseIdleOptions = {}): boolean {
  const { initialState = false, events = DEFAULT_EVENTS } = options;
  const [idle, setIdle] = useState<boolean>(initialState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reset = () => {
      setIdle(false);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIdle(true), timeout);
    };

    // Start the timer on mount.
    timeoutRef.current = setTimeout(() => setIdle(true), timeout);

    for (const event of events) {
      window.addEventListener(event, reset, { passive: true });
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, reset);
      }
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [timeout, events]);

  return idle;
}
