import {
  cloneElement,
  useEffect,
  useRef,
  type ReactElement,
  type Ref,
} from "react";

export interface ClickAwayListenerProps {
  /**
   * Single React element child. A ref is attached to it to track its DOM node,
   * so the child must forward refs (host elements and `forwardRef` components
   * do).
   */
  children: ReactElement;
  /** Fired when a pointerdown occurs outside the child. */
  onClickAway: (event: PointerEvent) => void;
  /** Disable the listener without unmounting. Defaults to `false`. */
  disabled?: boolean;
}

type RefLike = Ref<unknown> & { current?: unknown };

/** Merge our internal ref with whatever ref the child already had. */
function setRef(ref: RefLike | undefined, node: unknown): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as { current: unknown }).current = node;
  }
}

/**
 * Calls `onClickAway` when a `pointerdown` happens outside its single child.
 *
 * SSR-safe (listeners are attached in an effect). The child must accept a ref.
 */
export function ClickAwayListener({
  children,
  onClickAway,
  disabled = false,
}: ClickAwayListenerProps): ReactElement {
  const nodeRef = useRef<Node | null>(null);

  const onClickAwayRef = useRef(onClickAway);
  onClickAwayRef.current = onClickAway;

  useEffect(() => {
    if (disabled || typeof document === "undefined") return;

    const handler = (event: PointerEvent) => {
      const node = nodeRef.current;
      const target = event.target as Node | null;
      if (!node || !target) return;
      // Ignore clicks that landed inside the child (or on a detached target).
      if (node.contains(target)) return;
      onClickAwayRef.current(event);
    };

    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [disabled]);

  const childRef = (children as { ref?: RefLike }).ref;

  return cloneElement(children, {
    ref: (node: unknown) => {
      nodeRef.current = (node as Node) ?? null;
      setRef(childRef, node);
    },
  } as { ref: Ref<unknown> });
}
