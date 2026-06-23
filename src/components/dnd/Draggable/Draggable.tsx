import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import {
  NOVA_DND_MIME,
  setActiveDrag,
  clearActiveDrag,
} from "./dndBridge";
import "./Draggable.css";

export interface DraggableProps<P = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDragStart" | "onDragEnd"> {
  /**
   * Arbitrary payload handed to the drop target. Made available to
   * `Droppable` via the shared dnd bridge; a stringified copy is also placed on
   * the native DataTransfer when possible.
   */
  data?: P;
  /**
   * A logical type/kind for this draggable (e.g. `"card"`, `"file"`). Drop
   * targets can use it in their `accept` predicate.
   */
  type?: string;
  /** Called when the drag begins. */
  onDragStart?: (data: P | undefined, e: React.DragEvent) => void;
  /** Called when the drag ends (dropped or cancelled). */
  onDragEnd?: (
    data: P | undefined,
    e: React.DragEvent,
    didDrop: boolean
  ) => void;
  /** Disable dragging. */
  disabled?: boolean;
}

/**
 * Draggable — wraps a child to make it draggable via the native HTML5 DnD API.
 * Carries a `data` payload to `Droppable` targets and exposes drag lifecycle
 * callbacks. SSR-safe (all logic runs inside event handlers).
 */
function DraggableInner<P = unknown>(
  {
    data,
    type,
    onDragStart,
    onDragEnd,
    disabled = false,
    className,
    children,
    ...rest
  }: DraggableProps<P>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        "nova-draggable",
        dragging && "nova-draggable--dragging",
        disabled && "nova-draggable--disabled",
        className
      )}
      draggable={!disabled}
      aria-grabbed={dragging || undefined}
      data-dragging={dragging || undefined}
      onDragStart={(e) => {
        if (disabled) return;
        setActiveDrag(data, type);
        try {
          e.dataTransfer.setData(
            NOVA_DND_MIME,
            JSON.stringify({ type, hasPayload: data !== undefined })
          );
          e.dataTransfer.setData(
            "text/plain",
            typeof data === "string" ? data : type ?? "nova-dnd"
          );
        } catch {
          // Some browsers throw if setData is restricted; bridge still works.
        }
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
        onDragStart?.(data, e);
      }}
      onDragEnd={(e) => {
        const didDrop = e.dataTransfer.dropEffect !== "none";
        setDragging(false);
        clearActiveDrag();
        onDragEnd?.(data, e, didDrop);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Draggable = forwardRef(DraggableInner) as <P = unknown>(
  props: DraggableProps<P> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
