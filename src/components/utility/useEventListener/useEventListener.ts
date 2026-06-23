import { useEffect, useRef, type RefObject } from "react";

/**
 * Targets the listener can be attached to. Pass a ref to a DOM element, the
 * element itself, `window`, `document`, or `null` (to skip).
 */
export type EventTarget_<T extends EventTarget> =
  | RefObject<T | null>
  | T
  | null;

// Overload: window events
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  target?: EventTarget_<Window>,
  options?: boolean | AddEventListenerOptions
): void;

// Overload: document events
export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  target: EventTarget_<Document>,
  options?: boolean | AddEventListenerOptions
): void;

// Overload: generic HTML element events (via ref or element)
export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  target: EventTarget_<T>,
  options?: boolean | AddEventListenerOptions
): void;

/**
 * Generic, typed event-listener hook.
 *
 * Defaults to `window` when no `target` is given. SSR-safe (resolves the target
 * inside an effect and bails if absent). The latest `listener` is always
 * invoked without re-subscribing, and the listener is removed on cleanup.
 */
export function useEventListener(
  type: string,
  listener: (event: Event) => void,
  target?: EventTarget_<EventTarget>,
  options?: boolean | AddEventListenerOptions
): void {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const resolved: EventTarget | null | undefined =
      target === undefined
        ? typeof window !== "undefined"
          ? window
          : null
        : target !== null && "current" in (target as RefObject<EventTarget>)
          ? (target as RefObject<EventTarget | null>).current
          : (target as EventTarget | null);

    if (!resolved || typeof resolved.addEventListener !== "function") return;

    const handler = (event: Event) => listenerRef.current(event);
    resolved.addEventListener(type, handler, options);
    return () => resolved.removeEventListener(type, handler, options);
  }, [type, target, options]);
}
