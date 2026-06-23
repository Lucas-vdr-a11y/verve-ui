import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./KanbanDnd.css";

/** Minimum shape a card must satisfy: a stable `id`. */
export interface KanbanCardData {
  id: string | number;
}

/** A column owns a title and an ordered list of cards. */
export interface KanbanColumnData<T extends KanbanCardData> {
  id: string | number;
  title: string;
  items: T[];
}

/** Where a card currently sits / would land. */
export interface KanbanLocation {
  columnId: string | number;
  index: number;
}

export interface KanbanCardRenderProps {
  /** Whether this card is the one currently being dragged/lifted. */
  isDragging: boolean;
  /**
   * Props for the drag affordance. Spread onto a focusable element to scope
   * dragging to a handle; when omitted, the whole card is the drag surface.
   */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "aria-label": string;
    tabIndex: 0;
  };
}

export interface KanbanDndProps<T extends KanbanCardData>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled columns, each with stable `id` and its cards. */
  columns: KanbanColumnData<T>[];
  /** Render a single card's content. */
  renderCard: (card: T, props: KanbanCardRenderProps) => React.ReactNode;
  /** Optional custom column header renderer. Defaults to the title text. */
  renderColumnHeader?: (column: KanbanColumnData<T>) => React.ReactNode;
  /** Called with the next full column set after any move settles. */
  onChange?: (next: KanbanColumnData<T>[]) => void;
  /** Called with the moved card and its from/to locations. */
  onCardMove?: (
    card: T,
    change: { from: KanbanLocation; to: KanbanLocation }
  ) => void;
  /** Disable all dragging. */
  disabled?: boolean;
}

interface DragState {
  card: KanbanCardData;
  /** Origin location (in the original `columns`). */
  fromColumn: string | number;
  fromIndex: number;
  /** Live target location. */
  toColumn: string | number;
  toIndex: number;
  pointerId: number | null;
  x: number;
  y: number;
  keyboard: boolean;
}

function findCard<T extends KanbanCardData>(
  columns: KanbanColumnData<T>[],
  cardId: string | number
): { columnId: string | number; index: number; card: T } | null {
  for (const col of columns) {
    const index = col.items.findIndex((c) => c.id === cardId);
    if (index !== -1)
      return { columnId: col.id, index, card: col.items[index] };
  }
  return null;
}

/** Produce the next column set by moving a card between locations. */
function applyMove<T extends KanbanCardData>(
  columns: KanbanColumnData<T>[],
  from: KanbanLocation,
  to: KanbanLocation
): KanbanColumnData<T>[] {
  const next = columns.map((c) => ({ ...c, items: c.items.slice() }));
  const src = next.find((c) => c.id === from.columnId);
  const dst = next.find((c) => c.id === to.columnId);
  if (!src || !dst) return columns;
  const [moved] = src.items.splice(from.index, 1);
  if (!moved) return columns;
  let insert = to.index;
  if (src === dst && from.index < to.index) insert -= 1;
  insert = Math.max(0, Math.min(dst.items.length, insert));
  dst.items.splice(insert, 0, moved);
  return next;
}

/**
 * KanbanDnd — a draggable Kanban board. Cards can be reordered within a column
 * and moved between columns with a live drop placeholder; the hovered column is
 * highlighted. Pointer-based, with full keyboard support: focus a card, press
 * Space/Enter to pick up, arrow keys to move (Up/Down within a column,
 * Left/Right across columns), Space/Enter to drop, Escape to cancel. SSR-safe;
 * listeners cleaned up.
 */
function KanbanDndInner<T extends KanbanCardData>(
  {
    columns,
    renderCard,
    renderColumnHeader,
    onChange,
    onCardMove,
    disabled = false,
    className,
    ...rest
  }: KanbanDndProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const baseId = useId();
  const colRefs = useRef<Map<string | number, HTMLElement>>(new Map());
  const cardRefs = useRef<Map<string | number, HTMLElement>>(new Map());
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  /** Resolve the drop location from a live pointer position. */
  const computeTarget = useCallback(
    (x: number, y: number, state: DragState): { col: string | number; index: number } => {
      const cols = columnsRef.current;
      // Find hovered column (fallback to current target column).
      let colId: string | number = state.toColumn;
      for (const col of cols) {
        const el = colRefs.current.get(col.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          colId = col.id;
          break;
        }
      }
      const column = cols.find((c) => c.id === colId);
      if (!column) return { col: colId, index: state.toIndex };

      // Determine insertion index by comparing against card midpoints,
      // skipping the dragged card itself.
      let index = 0;
      for (const card of column.items) {
        if (card.id === state.card.id) continue;
        const el = cardRefs.current.get(card.id);
        if (!el) {
          index++;
          continue;
        }
        const r = el.getBoundingClientRect();
        if (y > r.top + r.height / 2) index++;
        else break;
      }
      return { col: colId, index };
    },
    []
  );

  const commit = useCallback(
    (state: DragState) => {
      const from: KanbanLocation = {
        columnId: state.fromColumn,
        index: state.fromIndex,
      };
      const to: KanbanLocation = {
        columnId: state.toColumn,
        index: state.toIndex,
      };
      const sameSpot =
        from.columnId === to.columnId &&
        (from.index === to.index || from.index === to.index - 1);
      if (sameSpot) return;
      const next = applyMove(columnsRef.current, from, to);
      if (next !== columnsRef.current) {
        onChange?.(next);
        onCardMove?.(state.card as T, { from, to });
      }
    },
    [onChange, onCardMove]
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
        const t = computeTarget(e.clientX, e.clientY, prev);
        return { ...prev, x: e.clientX, y: e.clientY, toColumn: t.col, toIndex: t.index };
      });
    };

    const finish = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      const state = dragRef.current;
      if (state) {
        commit(state);
        setAnnouncement("Card dropped.");
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
    (card: T, columnId: string | number, index: number, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      setDrag({
        card,
        fromColumn: columnId,
        fromIndex: index,
        toColumn: columnId,
        toIndex: index,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        keyboard: false,
      });
      setAnnouncement(`Picked up card from ${String(columnId)}.`);
    },
    [disabled]
  );

  // ---- Keyboard move -------------------------------------------------------
  const handleKeyDown = useCallback(
    (card: T, columnId: string | number, index: number, e: React.KeyboardEvent) => {
      if (disabled) return;
      const active = dragRef.current;
      const lifting = active?.keyboard;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!lifting) {
          setDrag({
            card,
            fromColumn: columnId,
            fromIndex: index,
            toColumn: columnId,
            toIndex: index,
            pointerId: null,
            x: 0,
            y: 0,
            keyboard: true,
          });
          setAnnouncement(
            "Card picked up. Arrow keys move it; Left/Right change column, Up/Down change position. Space to drop, Escape to cancel."
          );
        } else {
          commit(active!);
          setAnnouncement("Card dropped.");
          setDrag(null);
        }
        return;
      }

      if (!lifting) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setDrag(null);
        setAnnouncement("Move cancelled.");
        return;
      }

      const cols = columnsRef.current;
      const colOrder = cols.map((c) => c.id);

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setDrag((prev) => {
          if (!prev) return prev;
          const col = cols.find((c) => c.id === prev.toColumn);
          const count = col ? col.items.length : 0;
          // Insertion slots in the same column the card already occupies.
          const max = prev.toColumn === prev.fromColumn ? count - 1 : count;
          const to = Math.max(0, Math.min(max, prev.toIndex + delta));
          if (to !== prev.toIndex)
            setAnnouncement(`Position ${to + 1} in this column.`);
          return { ...prev, toIndex: to };
        });
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        setDrag((prev) => {
          if (!prev) return prev;
          const curr = colOrder.indexOf(prev.toColumn);
          const nextCol = Math.max(0, Math.min(colOrder.length - 1, curr + delta));
          const targetColId = colOrder[nextCol];
          if (targetColId === prev.toColumn) return prev;
          const col = cols.find((c) => c.id === targetColId);
          const count = col ? col.items.length : 0;
          const idx = Math.min(prev.toIndex, count);
          setAnnouncement(`Moved to column ${col?.title ?? String(targetColId)}.`);
          return { ...prev, toColumn: targetColId, toIndex: idx };
        });
        return;
      }
    },
    [disabled, commit]
  );

  return (
    <div
      ref={ref}
      className={cn(
        "nova-kanban",
        disabled && "nova-kanban--disabled",
        drag && "nova-kanban--dragging",
        className
      )}
      {...rest}
    >
      {columns.map((column) => {
        const isTargetCol = drag?.toColumn === column.id;
        // Render the card list, splicing a placeholder at the live target index
        // for the column being hovered. The dragged card is rendered in place
        // but visually marked.
        const placeholderIndex = isTargetCol ? drag!.toIndex : -1;

        const cells: React.ReactNode[] = [];
        column.items.forEach((card, index) => {
          if (index === placeholderIndex) {
            cells.push(
              <li
                key={`__ph-${column.id}`}
                className="nova-kanban__placeholder"
                aria-hidden="true"
              />
            );
          }
          const isDragging = drag?.card.id === card.id;
          const handleProps: KanbanCardRenderProps["handleProps"] = {
            onPointerDown: (e) => startPointerDrag(card, column.id, index, e),
            onKeyDown: (e) => handleKeyDown(card, column.id, index, e),
            "aria-label": `Drag card, position ${index + 1} of ${column.items.length} in ${column.title}`,
            tabIndex: 0,
          };
          cells.push(
            <li
              key={card.id}
              ref={(node) => {
                if (node) cardRefs.current.set(card.id, node);
                else cardRefs.current.delete(card.id);
              }}
              className={cn(
                "nova-kanban__card",
                isDragging && "nova-kanban__card--dragging"
              )}
              data-dragging={isDragging || undefined}
              aria-roledescription="draggable card"
              aria-grabbed={isDragging || undefined}
              onPointerDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("button, a, input, textarea, select")) return;
                startPointerDrag(card, column.id, index, e);
              }}
              onKeyDown={(e) => handleKeyDown(card, column.id, index, e)}
              tabIndex={0}
            >
              {renderCard(card, { isDragging: !!isDragging, handleProps })}
            </li>
          );
        });
        // Placeholder at end of column.
        if (placeholderIndex >= column.items.length) {
          cells.push(
            <li
              key={`__ph-end-${column.id}`}
              className="nova-kanban__placeholder"
              aria-hidden="true"
            />
          );
        }

        return (
          <section
            key={column.id}
            ref={(node) => {
              if (node) colRefs.current.set(column.id, node);
              else colRefs.current.delete(column.id);
            }}
            className={cn(
              "nova-kanban__column",
              isTargetCol && drag && "nova-kanban__column--target"
            )}
            aria-label={column.title}
          >
            <header className="nova-kanban__column-header">
              {renderColumnHeader ? (
                renderColumnHeader(column)
              ) : (
                <>
                  <span className="nova-kanban__column-title">
                    {column.title}
                  </span>
                  <span className="nova-kanban__column-count">
                    {column.items.length}
                  </span>
                </>
              )}
            </header>
            <ul className="nova-kanban__list" role="list">
              {cells}
            </ul>
          </section>
        );
      })}
      <div
        id={`${baseId}-live`}
        className="nova-visually-hidden"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {announcement}
      </div>
    </div>
  );
}

/**
 * Generic `forwardRef` wrapper. The cast preserves the generic card type for
 * consumers while satisfying `forwardRef`'s non-generic signature.
 */
export const KanbanDnd = forwardRef(KanbanDndInner) as <T extends KanbanCardData>(
  props: KanbanDndProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export { findCard };
