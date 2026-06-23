import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { DragHandle } from "../DragHandle";
import "./SortableGrid.css";

/** Minimum shape a grid item must satisfy: a stable `id`. */
export interface SortableGridItemData {
  id: string | number;
}

export interface SortableGridRenderProps {
  /** Whether this item is the one currently being dragged/lifted. */
  isDragging: boolean;
  /**
   * Props for an optional custom drag handle. Spread onto a focusable element
   * (e.g. `<DragHandle {...handleProps} />`) to scope dragging to that element.
   * When omitted (with `useHandle={false}`) the whole cell is the drag surface.
   */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "aria-label": string;
    tabIndex: 0;
  };
}

export interface SortableGridProps<T extends SortableGridItemData>
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children" | "onChange"> {
  /** Controlled list of items, each with a stable `id`. */
  items: T[];
  /** Render the inner content of a cell. */
  renderItem: (item: T, props: SortableGridRenderProps) => React.ReactNode;
  /** Called with the fully reordered array after a move settles. */
  onReorder?: (newOrder: T[], change: { from: number; to: number }) => void;
  /** Number of columns in the grid. Defaults to `4`. */
  columns?: number;
  /** Gap between cells (any CSS length). Defaults to a token-based gap. */
  gap?: string;
  /**
   * When `true`, dragging only starts from an element wired with `handleProps`.
   * When `false` (default), the whole cell is draggable and a handle is shown
   * for affordance only.
   */
  useHandle?: boolean;
  /** Disable all reordering. */
  disabled?: boolean;
}

interface DragState {
  /** Index of the item being dragged in the original array. */
  from: number;
  /** Current target index the item would drop into. */
  to: number;
  /** Pointer id owning the gesture (pointer drags only). */
  pointerId: number | null;
  /** Live pointer position (viewport coords). */
  x: number;
  y: number;
  /** Whether this drag was started via keyboard (no pointer tracking). */
  keyboard: boolean;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * SortableGrid — a controlled 2D grid of reorderable items (photo / app-icon
 * grid) with live reflow. Pointer dragging picks the nearest cell center to the
 * pointer; keyboard reordering moves within the grid: focus a cell, press
 * Space/Enter to lift, arrow keys to move (left/right by one, up/down by a
 * row), Space/Enter to drop, Escape to cancel. SSR-safe; listeners cleaned up.
 */
function SortableGridInner<T extends SortableGridItemData>(
  {
    items,
    renderItem,
    onReorder,
    columns = 4,
    gap,
    useHandle = false,
    disabled = false,
    className,
    style,
    ...rest
  }: SortableGridProps<T>,
  ref: React.ForwardedRef<HTMLUListElement>
) {
  const baseId = useId();
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Map<string | number, HTMLLIElement>>(new Map());
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const setListRef = useCallback(
    (node: HTMLUListElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  /** Pick the index of the cell whose center is nearest the pointer. */
  const computeTarget = useCallback(
    (x: number, y: number): number => {
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const el = itemRefs.current.get(items[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = (cx - x) ** 2 + (cy - y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    },
    [items]
  );

  const commit = useCallback(
    (state: DragState) => {
      if (state.to !== state.from && state.to >= 0) {
        onReorder?.(reorder(items, state.from, state.to), {
          from: state.from,
          to: state.to,
        });
      }
    },
    [items, onReorder]
  );

  // ---- Pointer dragging ----------------------------------------------------
  useEffect(() => {
    if (!drag || drag.pointerId === null || drag.keyboard) return;
    if (typeof window === "undefined") return;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      setDrag((prev) => {
        if (!prev) return prev;
        const target = computeTarget(e.clientX, e.clientY);
        return {
          ...prev,
          x: e.clientX,
          y: e.clientY,
          to: target >= 0 ? target : prev.to,
        };
      });
    };

    const finish = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      const state = dragRef.current;
      if (state) {
        commit(state);
        if (state.to !== state.from && state.to >= 0) {
          setAnnouncement(`Item moved to position ${state.to + 1}.`);
        }
      }
      setDrag(null);
    };

    const cancel = () => setDrag(null);

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [drag, computeTarget, commit]);

  const startPointerDrag = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      setDrag({
        from: index,
        to: index,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        keyboard: false,
      });
      setAnnouncement(`Lifted item at position ${index + 1}.`);
    },
    [disabled]
  );

  // ---- Keyboard reordering -------------------------------------------------
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (disabled) return;
      const active = dragRef.current;
      const lifting = active?.keyboard;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!lifting) {
          setDrag({
            from: index,
            to: index,
            pointerId: null,
            x: 0,
            y: 0,
            keyboard: true,
          });
          setAnnouncement(
            `Lifted item at position ${index + 1}. Use arrow keys to move, Space to drop, Escape to cancel.`
          );
        } else {
          commit(active!);
          setAnnouncement(
            active!.to !== active!.from
              ? `Dropped at position ${active!.to + 1}.`
              : `Dropped. Position unchanged.`
          );
          setDrag(null);
        }
        return;
      }

      if (!lifting) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setDrag(null);
        setAnnouncement("Reordering cancelled.");
        return;
      }

      let delta = 0;
      if (e.key === "ArrowRight") delta = 1;
      else if (e.key === "ArrowLeft") delta = -1;
      else if (e.key === "ArrowDown") delta = columns;
      else if (e.key === "ArrowUp") delta = -columns;
      if (delta === 0) return;

      e.preventDefault();
      setDrag((prev) => {
        if (!prev) return prev;
        const to = Math.max(0, Math.min(items.length - 1, prev.to + delta));
        if (to !== prev.to) {
          setAnnouncement(`Moved to position ${to + 1} of ${items.length}.`);
        }
        return { ...prev, to };
      });
    },
    [disabled, columns, items.length, commit]
  );

  // Order shown during a drag: the dragged id is removed and re-inserted at `to`.
  const displayOrder =
    drag && drag.to >= 0
      ? reorder(
          items.map((it) => it.id),
          drag.from,
          drag.to
        )
      : items.map((it) => it.id);

  const byId = new Map(items.map((it) => [it.id, it]));

  return (
    <ul
      ref={setListRef}
      className={cn(
        "nova-sortable-grid",
        disabled && "nova-sortable-grid--disabled",
        drag && "nova-sortable-grid--dragging",
        className
      )}
      role="list"
      style={{
        ...style,
        ["--nova-sortable-grid-columns" as string]: String(columns),
        ...(gap ? { ["--nova-sortable-grid-gap" as string]: gap } : null),
      }}
      {...rest}
    >
      {displayOrder.map((id, displayIndex) => {
        const item = byId.get(id)!;
        const originalIndex = items.findIndex((it) => it.id === id);
        const isDragging = drag?.from === originalIndex;

        const handleProps: SortableGridRenderProps["handleProps"] = {
          onPointerDown: (e) => startPointerDrag(originalIndex, e),
          onKeyDown: (e) => handleKeyDown(originalIndex, e),
          "aria-label": `Drag to reorder, item ${displayIndex + 1} of ${items.length}`,
          tabIndex: 0,
        };

        return (
          <li
            key={id}
            ref={(node) => {
              if (node) itemRefs.current.set(id, node);
              else itemRefs.current.delete(id);
            }}
            className={cn(
              "nova-sortable-grid__item",
              isDragging && "nova-sortable-grid__item--dragging"
            )}
            data-dragging={isDragging || undefined}
            aria-roledescription="sortable grid item"
            aria-grabbed={isDragging || undefined}
            {...(!useHandle
              ? {
                  onPointerDown: (e: React.PointerEvent) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button, a, input, textarea, select"))
                      return;
                    startPointerDrag(originalIndex, e);
                  },
                  onKeyDown: (e: React.KeyboardEvent) =>
                    handleKeyDown(originalIndex, e),
                  tabIndex: 0,
                }
              : {})}
          >
            {useHandle ? (
              renderItem(item, { isDragging: !!isDragging, handleProps })
            ) : (
              <>
                <DragHandle
                  className="nova-sortable-grid__handle"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <div className="nova-sortable-grid__content">
                  {renderItem(item, { isDragging: !!isDragging, handleProps })}
                </div>
              </>
            )}
          </li>
        );
      })}
      <li
        id={`${baseId}-live`}
        className="nova-visually-hidden"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {announcement}
      </li>
    </ul>
  );
}

/**
 * Generic `forwardRef` wrapper. The cast preserves the generic item type for
 * consumers while satisfying `forwardRef`'s non-generic signature.
 */
export const SortableGrid = forwardRef(SortableGridInner) as <
  T extends SortableGridItemData,
>(
  props: SortableGridProps<T> & { ref?: React.ForwardedRef<HTMLUListElement> }
) => React.ReactElement;
