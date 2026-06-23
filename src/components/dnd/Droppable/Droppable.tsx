import { forwardRef, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { getActiveDrag } from "../Draggable/dndBridge";
import "./Droppable.css";

export interface DroppableProps<P = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  /** Called with the dropped payload when an accepted item is released. */
  onDrop?: (data: P | undefined, e: React.DragEvent) => void;
  /**
   * Predicate deciding whether a dragged item may drop here. Receives the live
   * payload and its `type`. Defaults to accepting everything.
   */
  accept?: (data: unknown, type: string | undefined) => boolean;
  /** Called when an accepted item enters the zone. */
  onDragEnterZone?: (e: React.DragEvent) => void;
  /** Called when a dragged item leaves the zone. */
  onDragLeaveZone?: (e: React.DragEvent) => void;
  /** Disable the drop target. */
  disabled?: boolean;
}

/**
 * Droppable — a drop-target zone that highlights while a compatible item is
 * dragged over it and invokes `onDrop` with the payload on release. Handles the
 * dragenter/over/leave dance (including `preventDefault` so the browser permits
 * the drop) and supports an `accept` predicate. SSR-safe.
 */
function DroppableInner<P = unknown>(
  {
    onDrop,
    accept,
    onDragEnterZone,
    onDragLeaveZone,
    disabled = false,
    className,
    children,
    ...rest
  }: DroppableProps<P>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [over, setOver] = useState<"none" | "accept" | "reject">("none");
  // Tracks nested dragenter/leave so child elements don't flicker the state.
  const depth = useRef(0);

  const canAccept = (): boolean => {
    if (disabled) return false;
    if (!accept) return true;
    const { payload, type } = getActiveDrag();
    return accept(payload, type);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "nova-droppable",
        over === "accept" && "nova-droppable--over",
        over === "reject" && "nova-droppable--reject",
        disabled && "nova-droppable--disabled",
        className
      )}
      aria-dropeffect={disabled ? undefined : "move"}
      data-over={over !== "none" ? over : undefined}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        if (depth.current === 1) {
          const accepted = canAccept();
          setOver(accepted ? "accept" : "reject");
          if (accepted) onDragEnterZone?.(e);
        }
      }}
      onDragOver={(e) => {
        // Must preventDefault on dragover for the drop event to fire.
        if (over === "reject" || disabled) {
          e.dataTransfer.dropEffect = "none";
          return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={(e) => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) {
          setOver("none");
          onDragLeaveZone?.(e);
        }
      }}
      onDrop={(e) => {
        depth.current = 0;
        setOver("none");
        if (disabled || !canAccept()) return;
        e.preventDefault();
        const { payload } = getActiveDrag();
        onDrop?.(payload as P | undefined, e);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Droppable = forwardRef(DroppableInner) as <P = unknown>(
  props: DroppableProps<P> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
