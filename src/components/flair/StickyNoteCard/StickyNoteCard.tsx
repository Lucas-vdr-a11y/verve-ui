import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./StickyNoteCard.css";

export type StickyNoteColor =
  | "yellow"
  | "pink"
  | "blue"
  | "green";

export interface StickyNoteCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onDrag" | "onDragEnd"
  > {
  /** Note tint. Defaults `"yellow"`. */
  color?: StickyNoteColor;
  /** Initial x offset (px) within the container. Defaults `0`. */
  initialX?: number;
  /** Initial y offset (px) within the container. Defaults `0`. */
  initialY?: number;
  /** Constrain dragging to the offset parent's bounds. Defaults `true`. */
  bounded?: boolean;
  /** Called with the new position after a drag ends. */
  onDragEnd?: (pos: { x: number; y: number }) => void;
  /** Note content. */
  children?: React.ReactNode;
}

/**
 * A draggable sticky note that can be tossed around inside its positioned
 * container, with a peeling corner curl and a soft drop shadow that lifts while
 * dragging. Position is held on the element via translate; dragging is bounded
 * to the offset parent when `bounded`.
 *
 * SSR-safe (pointer logic in handlers), releases pointer capture, and respects
 * reduced motion by dropping the lift transition.
 */
export const StickyNoteCard = forwardRef<HTMLDivElement, StickyNoteCardProps>(
  function StickyNoteCard(
    {
      color = "yellow",
      initialX = 0,
      initialY = 0,
      bounded = true,
      onDragEnd,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);
    const pos = useRef({ x: initialX, y: initialY });
    const drag = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    } | null>(null);
    const onDragEndRef = useRef(onDragEnd);
    onDragEndRef.current = onDragEnd;

    const apply = useCallback(() => {
      const node = innerRef.current;
      if (!node) return;
      node.style.setProperty("--nova-note-x", `${pos.current.x}px`);
      node.style.setProperty("--nova-note-y", `${pos.current.y}px`);
    }, []);

    useEffect(() => {
      pos.current = { x: initialX, y: initialY };
      apply();
    }, [initialX, initialY, apply]);

    const clamp = useCallback(
      (x: number, y: number) => {
        const node = innerRef.current;
        const parent = node?.offsetParent as HTMLElement | null;
        if (!bounded || !node || !parent) return { x, y };
        const maxX = parent.clientWidth - node.offsetWidth;
        const maxY = parent.clientHeight - node.offsetHeight;
        return {
          x: Math.max(0, Math.min(x, Math.max(0, maxX))),
          y: Math.max(0, Math.min(y, Math.max(0, maxY))),
        };
      },
      [bounded]
    );

    const handlePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const node = innerRef.current;
        if (!node) return;
        node.setPointerCapture?.(event.pointerId);
        node.classList.add("nova-sticky-note--dragging");
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: pos.current.x,
          originY: pos.current.y,
        };
      },
      []
    );

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.pointerId !== event.pointerId) return;
        const next = clamp(
          d.originX + (event.clientX - d.startX),
          d.originY + (event.clientY - d.startY)
        );
        pos.current = next;
        apply();
      },
      [apply, clamp]
    );

    const handlePointerUp = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.pointerId !== event.pointerId) return;
        const node = innerRef.current;
        node?.releasePointerCapture?.(event.pointerId);
        node?.classList.remove("nova-sticky-note--dragging");
        drag.current = null;
        onDragEndRef.current?.({ ...pos.current });
      },
      []
    );

    return (
      <div
        ref={innerRef}
        className={cn(
          "nova-sticky-note",
          `nova-sticky-note--${color}`,
          className
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        {...rest}
      >
        <div className="nova-sticky-note__body">{children}</div>
        <span className="nova-sticky-note__curl" aria-hidden="true" />
      </div>
    );
  }
);
