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
import "./Sortable.css";

/** Minimum shape a sortable item must satisfy: a stable `id`. */
export interface SortableItemData {
  id: string | number;
}

export interface SortableRenderProps {
  /** Whether this item is the one currently being dragged/lifted. */
  isDragging: boolean;
  /**
   * Props for an optional custom drag handle. Spread onto a focusable element
   * (e.g. `<DragHandle {...handleProps} />`) to scope dragging to that element.
   * When omitted on the item, the whole item becomes the drag surface.
   */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "aria-label": string;
    tabIndex: 0;
  };
}

export interface SortableProps<T extends SortableItemData>
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children" | "onChange"> {
  /** Controlled list of items, each with a stable `id`. */
  items: T[];
  /** Render the inner content of an item. */
  renderItem: (item: T, props: SortableRenderProps) => React.ReactNode;
  /** Called with the fully reordered array after a move settles. */
  onReorder?: (newOrder: T[], change: { from: number; to: number }) => void;
  /** Layout direction. Defaults to `"vertical"`. */
  orientation?: "vertical" | "horizontal";
  /**
   * When `true`, dragging only starts from an element wired with
   * `handleProps` (typically a `<DragHandle />`). When `false` (default), the
   * whole item is draggable and a handle is rendered for affordance only.
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
  /** Pointer offset within the dragged element at lift time. */
  offset: number;
  /** Live pointer position along the main axis (viewport coords). */
  pos: number;
  /** Pixel size of the dragged element along the main axis. */
  size: number;
  /** Whether this drag was started via keyboard (no floating clone). */
  keyboard: boolean;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Sortable — a controlled, reorderable list with pointer-based dragging (a
 * moving gap shows the drop target), optional drag handles, and full keyboard
 * reordering: focus a handle, press Space/Enter to lift, arrow keys to move,
 * Space/Enter to drop, Escape to cancel. SSR-safe.
 */
function SortableInner<T extends SortableItemData>(
  {
    items,
    renderItem,
    onReorder,
    orientation = "vertical",
    useHandle = false,
    disabled = false,
    className,
    ...rest
  }: SortableProps<T>,
  ref: React.ForwardedRef<HTMLUListElement>
) {
  const horizontal = orientation === "horizontal";
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

  const mainAxisPos = useCallback(
    (e: { clientX: number; clientY: number }) =>
      horizontal ? e.clientX : e.clientY,
    [horizontal]
  );

  /** Compute target index from the live pointer position. */
  const computeTarget = useCallback(
    (state: DragState): number => {
      const list = listRef.current;
      if (!list) return state.to;
      const center = state.pos - state.offset + state.size / 2;
      let target = items.length - 1;
      for (let i = 0; i < items.length; i++) {
        const el = itemRefs.current.get(items[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const mid = horizontal
          ? rect.left + rect.width / 2
          : rect.top + rect.height / 2;
        if (center < mid) {
          target = i;
          break;
        }
      }
      return target;
    },
    [items, horizontal]
  );

  const commit = useCallback(
    (state: DragState) => {
      if (state.to !== state.from) {
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
        const pos = mainAxisPos(e);
        const next = { ...prev, pos };
        next.to = computeTarget(next);
        return next;
      });
    };

    const finish = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      const state = dragRef.current;
      if (state) {
        commit(state);
        if (state.to !== state.from) {
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
  }, [drag, mainAxisPos, computeTarget, commit]);

  const startPointerDrag = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      const el = itemRefs.current.get(items[index].id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pos = mainAxisPos(e);
      const start = horizontal ? rect.left : rect.top;
      const size = horizontal ? rect.width : rect.height;
      e.preventDefault();
      setDrag({
        from: index,
        to: index,
        pointerId: e.pointerId,
        offset: pos - start,
        pos,
        size,
        keyboard: false,
      });
      setAnnouncement(`Lifted item at position ${index + 1}.`);
    },
    [disabled, items, horizontal, mainAxisPos]
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
            offset: 0,
            pos: 0,
            size: 0,
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

      const forward = horizontal ? "ArrowRight" : "ArrowDown";
      const backward = horizontal ? "ArrowLeft" : "ArrowUp";
      if (e.key === forward || e.key === backward) {
        e.preventDefault();
        const delta = e.key === forward ? 1 : -1;
        setDrag((prev) => {
          if (!prev) return prev;
          const to = Math.max(0, Math.min(items.length - 1, prev.to + delta));
          if (to !== prev.to) {
            setAnnouncement(`Moved to position ${to + 1} of ${items.length}.`);
          }
          return { ...prev, to };
        });
      }
    },
    [disabled, horizontal, items.length, commit]
  );

  // Order shown during a drag: the dragged id is removed and re-inserted at `to`.
  const displayOrder = drag
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
        "nova-sortable",
        `nova-sortable--${orientation}`,
        disabled && "nova-sortable--disabled",
        drag && "nova-sortable--dragging",
        className
      )}
      role="list"
      aria-orientation={orientation}
      {...rest}
    >
      {displayOrder.map((id, displayIndex) => {
        const item = byId.get(id)!;
        const originalIndex = items.findIndex((it) => it.id === id);
        const isDragging = drag?.from === originalIndex;

        const handleProps: SortableRenderProps["handleProps"] = {
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
              "nova-sortable__item",
              isDragging && "nova-sortable__item--dragging"
            )}
            data-dragging={isDragging || undefined}
            aria-roledescription="sortable item"
            // aria-grabbed is deprecated but still announced by some AT; pair
            // with the live region below for robust feedback.
            aria-grabbed={isDragging || undefined}
            {...(!useHandle
              ? {
                  onPointerDown: (e: React.PointerEvent) => {
                    // Ignore drags that start on interactive controls.
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
              <div className="nova-sortable__row">
                <DragHandle
                  className="nova-sortable__handle"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <div className="nova-sortable__content">
                  {renderItem(item, { isDragging: !!isDragging, handleProps })}
                </div>
              </div>
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
export const Sortable = forwardRef(SortableInner) as <T extends SortableItemData>(
  props: SortableProps<T> & { ref?: React.ForwardedRef<HTMLUListElement> }
) => React.ReactElement;
