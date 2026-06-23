import { useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./EditableTable.css";

export type EditableTableAlign = "left" | "center" | "right";
export type EditableCellType = "text" | "number" | "select";

export interface EditableSelectOption {
  label: string;
  value: string;
}

export interface EditableTableColumn<T> {
  /** Unique key — also used to read/write the value on a row when no accessors are given. */
  key: string;
  /** Column header content. */
  header: React.ReactNode;
  /** Editor type for this column. Defaults to `"text"`. */
  type?: EditableCellType;
  /** Whether cells in this column can be edited. Defaults to `true`. */
  editable?: boolean;
  /** Horizontal alignment. Defaults to `"left"`. */
  align?: EditableTableAlign;
  /** Options for `type: "select"`. */
  options?: EditableSelectOption[];
  /** Read the raw value from a row. Defaults to `row[key]`. */
  accessor?: (row: T) => string | number | null | undefined;
  /** Display renderer for the non-editing state. */
  render?: (row: T, rowIndex: number) => React.ReactNode;
  /**
   * Validate a candidate value. Return an error string to reject (and keep
   * editing), or null/undefined to accept.
   */
  validate?: (value: string, row: T) => string | null | undefined;
}

export interface EditableTableProps<T>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children"> {
  /** Column definitions. */
  columns: EditableTableColumn<T>[];
  /** Row data. */
  data: T[];
  /** Stable row key. Defaults to the row index. */
  rowKey?: (row: T, rowIndex: number) => string | number;
  /** Called when a single cell commits a new value. */
  onCellChange?: (params: {
    row: T;
    rowIndex: number;
    columnKey: string;
    value: string;
  }) => void;
  /** Called with the next row after a cell commit (row-level convenience). */
  onRowChange?: (row: T, rowIndex: number) => void;
  /** Show an "Add row" button below the table. */
  onAddRow?: () => void;
  /** Show a remove button per row when provided. */
  onRemoveRow?: (row: T, rowIndex: number) => void;
  /** Compact row padding. */
  dense?: boolean;
  /** Content shown when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Class applied to the scroll wrapper. */
  containerClassName?: string;
}

interface EditingState {
  rowIndex: number;
  columnKey: string;
}

function defaultAccessor<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function readValue<T>(col: EditableTableColumn<T>, row: T): string {
  const raw = col.accessor
    ? col.accessor(row)
    : (defaultAccessor(row, col.key) as string | number | null | undefined);
  return raw == null ? "" : String(raw);
}

export function EditableTable<T>({
  columns,
  data,
  rowKey,
  onCellChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
  dense = false,
  emptyState,
  containerClassName,
  className,
  ...rest
}: EditableTableProps<T>) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement & HTMLSelectElement>(null);

  const getKey = (row: T, index: number): string | number =>
    rowKey ? rowKey(row, index) : index;

  const editableColumns = columns.map((c) => c.editable !== false);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editing]);

  const startEdit = (rowIndex: number, col: EditableTableColumn<T>) => {
    if (col.editable === false) return;
    setEditing({ rowIndex, columnKey: col.key });
    setDraft(readValue(col, data[rowIndex]));
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setError(null);
  };

  /** Commit current draft. Returns true on success. */
  const commit = (): boolean => {
    if (!editing) return false;
    const col = columns.find((c) => c.key === editing.columnKey);
    const row = data[editing.rowIndex];
    if (!col || row === undefined) {
      setEditing(null);
      return false;
    }
    const validationError = col.validate?.(draft, row);
    if (validationError) {
      setError(validationError);
      return false;
    }
    onCellChange?.({
      row,
      rowIndex: editing.rowIndex,
      columnKey: col.key,
      value: draft,
    });
    if (onRowChange) {
      const nextRow = {
        ...(row as Record<string, unknown>),
        [col.key]: col.type === "number" ? Number(draft) : draft,
      } as T;
      onRowChange(nextRow, editing.rowIndex);
    }
    setEditing(null);
    setError(null);
    return true;
  };

  /** Move focus to the next/previous editable cell, committing first. */
  const moveToCell = (direction: 1 | -1) => {
    if (!editing) return;
    if (!commit()) return;
    const flat: Array<{ rowIndex: number; col: EditableTableColumn<T> }> = [];
    data.forEach((_, rIdx) => {
      columns.forEach((c, cIdx) => {
        if (editableColumns[cIdx]) flat.push({ rowIndex: rIdx, col: c });
      });
    });
    const currentPos = flat.findIndex(
      (f) => f.rowIndex === editing.rowIndex && f.col.key === editing.columnKey
    );
    const nextPos = currentPos + direction;
    if (nextPos < 0 || nextPos >= flat.length) return;
    const target = flat[nextPos];
    startEdit(target.rowIndex, target.col);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      moveToCell(e.shiftKey ? -1 : 1);
    }
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    col: EditableTableColumn<T>
  ) => {
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEdit(rowIndex, col);
    }
  };

  const colCount = columns.length + (onRemoveRow ? 1 : 0);

  return (
    <div className={cn("nova-editable-table__scroll", containerClassName)}>
      <table
        className={cn(
          "nova-editable-table",
          dense && "nova-editable-table--dense",
          className
        )}
        {...rest}
      >
        <thead className="nova-editable-table__head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "nova-editable-table__header-cell",
                  `nova-editable-table__cell--${col.align ?? "left"}`
                )}
              >
                {col.header}
              </th>
            ))}
            {onRemoveRow && (
              <th
                scope="col"
                className="nova-editable-table__header-cell nova-editable-table__actions-cell"
              >
                <span className="nova-editable-table__sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="nova-editable-table__body">
          {data.length === 0 ? (
            <tr>
              <td className="nova-editable-table__empty" colSpan={colCount}>
                {emptyState ?? "No data"}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = getKey(row, rowIndex);
              return (
                <tr key={key} className="nova-editable-table__row">
                  {columns.map((col) => {
                    const isEditing =
                      editing?.rowIndex === rowIndex &&
                      editing.columnKey === col.key;
                    const canEdit = col.editable !== false;
                    const display = col.render
                      ? col.render(row, rowIndex)
                      : readValue(col, row);
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "nova-editable-table__cell",
                          `nova-editable-table__cell--${col.align ?? "left"}`,
                          canEdit && "nova-editable-table__cell--editable",
                          isEditing && "nova-editable-table__cell--editing",
                          isEditing &&
                            error &&
                            "nova-editable-table__cell--invalid"
                        )}
                        tabIndex={canEdit && !isEditing ? 0 : undefined}
                        role={canEdit ? "button" : undefined}
                        aria-label={
                          canEdit && !isEditing ? "Edit cell" : undefined
                        }
                        onClick={
                          canEdit && !isEditing
                            ? () => startEdit(rowIndex, col)
                            : undefined
                        }
                        onKeyDown={
                          canEdit && !isEditing
                            ? (e) => handleCellKeyDown(e, rowIndex, col)
                            : undefined
                        }
                      >
                        {isEditing ? (
                          <div className="nova-editable-table__editor">
                            {col.type === "select" ? (
                              <select
                                ref={inputRef}
                                className="nova-editable-table__input"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={commit}
                                aria-invalid={!!error}
                              >
                                {(col.options ?? []).map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                ref={inputRef}
                                type={
                                  col.type === "number" ? "number" : "text"
                                }
                                className="nova-editable-table__input"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={commit}
                                aria-invalid={!!error}
                              />
                            )}
                            {error && (
                              <span
                                className="nova-editable-table__error"
                                role="alert"
                              >
                                {error}
                              </span>
                            )}
                          </div>
                        ) : (
                          display
                        )}
                      </td>
                    );
                  })}
                  {onRemoveRow && (
                    <td className="nova-editable-table__cell nova-editable-table__actions-cell">
                      <button
                        type="button"
                        className="nova-editable-table__remove"
                        onClick={() => onRemoveRow(row, rowIndex)}
                        aria-label="Remove row"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          width="1em"
                          height="1em"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            d="M4 4l8 8M12 4l-8 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {onAddRow && (
        <div className="nova-editable-table__footer">
          <button
            type="button"
            className="nova-editable-table__add"
            onClick={onAddRow}
          >
            <span aria-hidden="true">+</span> Add row
          </button>
        </div>
      )}
    </div>
  );
}
