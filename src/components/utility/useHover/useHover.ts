import { useEffect, useRef, useState, type RefObject } from "react";

export type UseHoverReturn<T extends HTMLElement> = [RefObject<T | null>, boolean];

/**
 * Tracks whether the pointer is over the referenced element.
 *
 * Attach the returned ref to a DOM node; `isHovered` flips on `mouseenter` /
 * `mouseleave`. Listeners are bound in an effect and cleaned up on unmount or
 * when the underlying node changes.
 */
export function useHover<T extends HTMLElement = HTMLElement>(): UseHoverReturn<T> {
  const ref = useRef<T | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);

    return () => {
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
    };
  });

  return [ref, isHovered];
}
