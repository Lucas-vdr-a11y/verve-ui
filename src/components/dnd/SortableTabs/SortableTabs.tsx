import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./SortableTabs.css";

/** A single tab descriptor. */
export interface SortableTabItem {
  /** Stable id; also used as the controlled active `value`. */
  id: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Disable selecting this tab (it can still be reordered around). */
  disabled?: boolean;
}

export interface SortableTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled tab order. Each item has a stable `id`. */
  tabs: SortableTabItem[];
  /** Currently active tab id. */
  value: string;
  /** Called when the active tab changes (click / arrow navigation). */
  onChange?: (value: string) => void;
  /** Called with the reordered tabs after a drag settles. */
  onReorder?: (newOrder: SortableTabItem[], change: { from: number; to: number }) => void;
  /** Disable reordering (selection still works). */
  disabled?: boolean;
}

interface DragState {
  from: number;
  to: number;
  pointerId: number;
  /** Pointer X offset within the dragged tab at lift time. */
  offset: number;
  x: number;
  width: number;
  /** Whether the pointer has moved enough to count as a drag. */
  moved: boolean;
  /** Pointer X at lift, to apply a small movement threshold. */
  startX: number;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const DRAG_THRESHOLD = 4;

/**
 * SortableTabs — a horizontal tab strip whose tabs can be reordered by
 * dragging, combined with standard tab selection. Click or use arrow keys to
 * activate a tab; press-drag a tab to reorder it (a moving gap shows the drop
 * target). Keyboard reorder: focus a tab, hold no modifier and use
 * Ctrl/Cmd+Arrow to move it. SSR-safe; pointer listeners cleaned up.
 */
export const SortableTabs = forwardRef<HTMLDivElement, SortableTabsProps>(
  function SortableTabs(
    {
      tabs,
      value,
      onChange,
      onReorder,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const baseId = useId();
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [drag, setDrag] = useState<DragState | null>(null);
    const [announcement, setAnnouncement] = useState("");
    const dragRef = useRef<DragState | null>(null);
    dragRef.current = drag;

    const computeTarget = useCallback(
      (state: DragState): number => {
        const center = state.x - state.offset + state.width / 2;
        let target = tabs.length - 1;
        for (let i = 0; i < tabs.length; i++) {
          const el = tabRefs.current.get(tabs[i].id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (center < rect.left + rect.width / 2) {
            target = i;
            break;
          }
        }
        return target;
      },
      [tabs]
    );

    const commit = useCallback(
      (state: DragState) => {
        if (state.moved && state.to !== state.from) {
          onReorder?.(reorder(tabs, state.from, state.to), {
            from: state.from,
            to: state.to,
          });
        }
      },
      [tabs, onReorder]
    );

    // ---- Pointer dragging --------------------------------------------------
    useEffect(() => {
      if (!drag) return;
      if (typeof window === "undefined") return;

      const handleMove = (e: PointerEvent) => {
        if (e.pointerId !== drag.pointerId) return;
        setDrag((prev) => {
          if (!prev) return prev;
          const moved =
            prev.moved || Math.abs(e.clientX - prev.startX) > DRAG_THRESHOLD;
          const next = { ...prev, x: e.clientX, moved };
          next.to = moved ? computeTarget(next) : prev.to;
          return next;
        });
      };

      const finish = (e: PointerEvent) => {
        if (e.pointerId !== drag.pointerId) return;
        const state = dragRef.current;
        if (state) {
          commit(state);
          if (state.moved && state.to !== state.from) {
            setAnnouncement(`Tab moved to position ${state.to + 1}.`);
          }
        }
        setDrag(null);
      };

      const cancel = () => setDrag(null);

      window.addEventListener("pointermove", handleMove);
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
        const el = tabRefs.current.get(tabs[index].id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setDrag({
          from: index,
          to: index,
          pointerId: e.pointerId,
          offset: e.clientX - rect.left,
          x: e.clientX,
          startX: e.clientX,
          width: rect.width,
          moved: false,
        });
      },
      [disabled, tabs]
    );

    const moveByKeyboard = useCallback(
      (index: number, delta: number) => {
        const to = Math.max(0, Math.min(tabs.length - 1, index + delta));
        if (to === index) return;
        onReorder?.(reorder(tabs, index, to), { from: index, to });
        setAnnouncement(`Tab moved to position ${to + 1} of ${tabs.length}.`);
      },
      [tabs, onReorder]
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent) => {
        const isReorderMod = e.ctrlKey || e.metaKey;

        if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && isReorderMod) {
          if (disabled) return;
          e.preventDefault();
          moveByKeyboard(index, e.key === "ArrowRight" ? 1 : -1);
          return;
        }

        // Roving selection when no reorder modifier is held.
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const dir = e.key === "ArrowRight" ? 1 : -1;
          let i = index;
          for (let step = 0; step < tabs.length; step++) {
            i = (i + dir + tabs.length) % tabs.length;
            if (!tabs[i].disabled) break;
          }
          const target = tabs[i];
          if (target && !target.disabled) {
            tabRefs.current.get(target.id)?.focus();
            onChange?.(target.id);
          }
          return;
        }

        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          const order = e.key === "Home" ? tabs : tabs.slice().reverse();
          const target = order.find((t) => !t.disabled);
          if (target) {
            tabRefs.current.get(target.id)?.focus();
            onChange?.(target.id);
          }
        }
      },
      [disabled, tabs, moveByKeyboard, onChange]
    );

    const displayOrder = drag
      ? reorder(
          tabs.map((t) => t.id),
          drag.from,
          drag.to
        )
      : tabs.map((t) => t.id);

    const byId = new Map(tabs.map((t) => [t.id, t]));

    return (
      <div
        ref={ref}
        className={cn(
          "nova-sortable-tabs",
          disabled && "nova-sortable-tabs--disabled",
          drag?.moved && "nova-sortable-tabs--dragging",
          className
        )}
        {...rest}
      >
        <div className="nova-sortable-tabs__list" role="tablist">
          {displayOrder.map((id, displayIndex) => {
            const tab = byId.get(id)!;
            const originalIndex = tabs.findIndex((t) => t.id === id);
            const isActive = tab.id === value;
            const isDragging = drag?.moved && drag.from === originalIndex;

            return (
              <button
                key={id}
                ref={(node) => {
                  if (node) tabRefs.current.set(id, node);
                  else tabRefs.current.delete(id);
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${id}`}
                aria-selected={isActive}
                aria-roledescription="sortable tab"
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                data-dragging={isDragging || undefined}
                className={cn(
                  "nova-sortable-tabs__tab",
                  "nova-focusable",
                  isActive && "nova-sortable-tabs__tab--active",
                  isDragging && "nova-sortable-tabs__tab--dragging"
                )}
                onPointerDown={(e) => startPointerDrag(originalIndex, e)}
                onKeyDown={(e) => handleKeyDown(originalIndex, e)}
                onClick={() => {
                  // Suppress the click that ends a reorder drag.
                  if (dragRef.current?.moved) return;
                  if (!tab.disabled) onChange?.(tab.id);
                }}
                title={`Tab ${displayIndex + 1} of ${tabs.length}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div
          id={`${baseId}-live`}
          className="nova-visually-hidden"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
      </div>
    );
  }
);
