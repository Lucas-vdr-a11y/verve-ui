import { useCallback, useRef, useState } from "react";

export type UseFocusWithinReturn<T extends HTMLElement = HTMLElement> = [
  (node: T | null) => void,
  boolean,
];

/**
 * Tracks whether focus is anywhere inside an element.
 *
 * Returns `[ref, isFocusWithin]`. Attach `ref` to the container; `isFocusWithin`
 * is `true` while the element or any descendant holds focus. Subscribes to
 * `focusin`/`focusout` and cleans up when the ref detaches.
 */
export function useFocusWithin<
  T extends HTMLElement = HTMLElement,
>(): UseFocusWithinReturn<T> {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((node: T | null) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!node) {
      setIsFocusWithin(false);
      return;
    }

    const handleFocusIn = () => setIsFocusWithin(true);
    const handleFocusOut = (event: FocusEvent) => {
      // Ignore focus moving between descendants of the node.
      if (node.contains(event.relatedTarget as Node | null)) return;
      setIsFocusWithin(false);
    };

    node.addEventListener("focusin", handleFocusIn);
    node.addEventListener("focusout", handleFocusOut);

    cleanupRef.current = () => {
      node.removeEventListener("focusin", handleFocusIn);
      node.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return [ref, isFocusWithin];
}
