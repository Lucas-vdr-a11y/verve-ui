import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ResizableTable.css";

export type ResizableTableAlign = "left" | "center" | "right";

export interface ResizableTableColumn<T> {
  /** Unique key — also used to read the value from a row when `render` is absent. */
  key: string;
  /** Column header content. */
  header: React.ReactNode;
  /** Horizontal alignment for header + cells. Defaults to `"left"`. */
  align?: ResizableTableAlign;
  /** Initial column width in px. Defaults to `160`. */
  width?: number;
  /** Minimum width in px when resizing. Falls back to the table `minColumnWidth`. */
  minWidth?: number;
  /** Disable the resize handle for this column. */
  resizable?: boolean;
  /** Custom cell renderer. */
  render?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface ResizableTableProps<T>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children"> {
  /** Column definitions. */
  columns: ResizableTableColumn<T>[];
  /** Row data. */
  data: T[];
  /** Stable row key. Defaults to the row index. */
  rowKey?: (row: T, rowIndex: number) => string | number;
  /** Global minimum column width in px. Defaults to `60`. */
  minColumnWidth?: number;
  /** Controlled widths keyed by column key. */
  widths?: Record<string, number>;
  /** Width change callback (fires during/after a drag). */
  onWidthsChange?: (widths: Record<string, number>) => void;
  /** Compact row padding. */
  dense?: boolean;
  /** Content shown when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Class applied to the scroll wrapper. */
  containerClassName?: string;
}

function defaultAccessor<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

interface DragState {
  key: string;
  startX: number;
  startWidth: number;
  min: number;
}

export function ResizableTable<T>({
  columns,
  data,
  rowKey,
  minColumnWidth = 60,
  widths,
  onWidthsChange,
  dense = false,
  emptyState,
  containerClassName,
  className,
  ...rest
}: ResizableTableProps<T>) {
  const isControlled = widths !== undefined;

  const buildInitial = useCallback((): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const col of columns) out[col.key] = col.width ?? 160;
    return out;
  }, [columns]);

  const [internalWidths, setInternalWidths] = useState<Record<string, number>>(
    buildInitial
  );

  // Keep internal widths in sync if columns are added/removed (uncontrolled).
  useEffect(() => {
    if (isControlled) return;
    setInternalWidths((prev) => {
      const next: Record<string, number> = {};
      let changed = false;
      for (const col of columns) {
        if (prev[col.key] !== undefined) {
          next[col.key] = prev[col.key];
        } else {
          next[col.key] = col.width ?? 160;
          changed = true;
        }
      }
      if (Object.keys(prev).length !== Object.keys(next).length) changed = true;
      return changed ? next : prev;
    });
  }, [columns, isControlled]);

  const currentWidths = isControlled ? widths : internalWidths;

  const applyWidth = (key: string, width: number) => {
    const next = { ...currentWidths, [key]: width };
    if (!isControlled) setInternalWidths(next);
    onWidthsChange?.(next);
  };

  const dragRef = useRef<DragState | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Pointer move/up handlers live in an effect so listeners are cleaned up and
  // we never touch the DOM during render (SSR-safe).
  useEffect(() => {
    if (!activeKey) return;

    const handleMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = e.clientX - drag.startX;
      const width = Math.max(drag.min, Math.round(drag.startWidth + delta));
      applyWidth(drag.key, width);
    };

    const handleUp = () => {
      dragRef.current = null;
      setActiveKey(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, currentWidths, isControlled]);

  const startResize = (e: React.PointerEvent, col: ResizableTableColumn<T>) => {
    e.preventDefault();
    const min = col.minWidth ?? minColumnWidth;
    dragRef.current = {
      key: col.key,
      startX: e.clientX,
      startWidth: currentWidths[col.key] ?? col.width ?? 160,
      min,
    };
    setActiveKey(col.key);
  };

  // Keyboard resize for accessibility.
  const handleHandleKeyDown = (
    e: React.KeyboardEvent,
    col: ResizableTableColumn<T>
  ) => {
    const min = col.minWidth ?? minColumnWidth;
    const cur = currentWidths[col.key] ?? col.width ?? 160;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      applyWidth(col.key, Math.max(min, cur - 10));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      applyWidth(col.key, cur + 10);
    }
  };

  const colCount = columns.length;

  return (
    <div className={cn("nova-resizable-table__scroll", containerClassName)}>
      <table
        className={cn(
          "nova-resizable-table",
          dense && "nova-resizable-table--dense",
          activeKey && "nova-resizable-table--resizing",
          className
        )}
        {...rest}
      >
        <colgroup>
          {columns.map((col) => (
            <col
              key={col.key}
              style={{ width: `${currentWidths[col.key] ?? col.width ?? 160}px` }}
            />
          ))}
        </colgroup>
        <thead className="nova-resizable-table__head">
          <tr>
            {columns.map((col) => {
              const canResize = col.resizable !== false;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "nova-resizable-table__header-cell",
                    `nova-resizable-table__cell--${col.align ?? "left"}`
                  )}
                >
                  <span className="nova-resizable-table__header-label">
                    {col.header}
                  </span>
                  {canResize && (
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Resize column"
                      tabIndex={0}
                      className={cn(
                        "nova-resizable-table__handle",
                        activeKey === col.key &&
                          "nova-resizable-table__handle--active"
                      )}
                      onPointerDown={(e) => startResize(e, col)}
                      onKeyDown={(e) => handleHandleKeyDown(e, col)}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="nova-resizable-table__body">
          {data.length === 0 ? (
            <tr>
              <td className="nova-resizable-table__empty" colSpan={colCount}>
                {emptyState ?? "No data"}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = rowKey ? rowKey(row, rowIndex) : rowIndex;
              return (
                <tr key={key} className="nova-resizable-table__row">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "nova-resizable-table__cell",
                        `nova-resizable-table__cell--${col.align ?? "left"}`
                      )}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : (defaultAccessor(row, col.key) as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
