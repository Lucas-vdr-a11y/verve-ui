import { useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DataTable.css";

export type DataTableAlign = "left" | "center" | "right";
export type SortDirection = "asc" | "desc" | "none";

export interface DataTableColumn<T> {
  /** Unique key — also used to read the value from a row when `render` is absent. */
  key: string;
  /** Column header content. */
  header: React.ReactNode;
  /** Allow sorting by clicking the header. Defaults to `false`. */
  sortable?: boolean;
  /** Horizontal alignment for header + cells. Defaults to `"left"`. */
  align?: DataTableAlign;
  /** Custom cell renderer. Receives the row and its index. */
  render?: (row: T, rowIndex: number) => React.ReactNode;
  /**
   * Custom comparator for sorting. Receives two rows; return <0, 0, >0.
   * Falls back to comparing `row[key]` when omitted.
   */
  sortAccessor?: (row: T) => string | number | boolean | null | undefined;
}

export interface DataTableProps<T>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children"> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Row data. */
  data: T[];
  /** Stable row key. Defaults to the row index. */
  rowKey?: (row: T, rowIndex: number) => string | number;
  /** Enable a leading checkbox column for row selection. */
  selectable?: boolean;
  /** Controlled set of selected row keys. */
  selectedKeys?: Array<string | number>;
  /** Selection change callback (required for controlled selection). */
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Compact row padding. */
  dense?: boolean;
  /** Content shown when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Class applied to the scroll wrapper. */
  containerClassName?: string;
}

interface SortState {
  key: string;
  direction: SortDirection;
}

function defaultAccessor<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

const SortIcon = ({ direction }: { direction: SortDirection }) => (
  <span className="nova-data-table__sort-icon" aria-hidden="true">
    <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false">
      <path
        d="M5 6.5 8 3.5l3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "asc" ? 1 : 0.35}
      />
      <path
        d="M5 9.5 8 12.5l3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "desc" ? 1 : 0.35}
      />
    </svg>
  </span>
);

export function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  dense = false,
  emptyState,
  containerClassName,
  className,
  ...rest
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);

  const getKey = (row: T, index: number): string | number =>
    rowKey ? rowKey(row, index) : index;

  const sortedData = useMemo(() => {
    if (!sort || sort.direction === "none") return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const accessor = col.sortAccessor
      ? col.sortAccessor
      : (row: T) => defaultAccessor(row, col.key) as string | number;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [data, columns, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key, direction: "none" };
      return { key, direction: "asc" };
    });
  };

  const selected = useMemo(
    () => new Set(selectedKeys ?? []),
    [selectedKeys]
  );

  const allKeys = useMemo(
    () => sortedData.map((row, i) => getKey(row, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedData]
  );

  const allSelected =
    allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = allKeys.some((k) => selected.has(k)) && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : allKeys);
  };

  const toggleRow = (key: string | number) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange([...next]);
  };

  const colCount = columns.length + (selectable ? 1 : 0);

  const table = (
    <table
      className={cn(
        "nova-data-table",
        dense && "nova-data-table--dense",
        className
      )}
      {...rest}
    >
      <thead className="nova-data-table__head">
        <tr>
          {selectable && (
            <th
              scope="col"
              className="nova-data-table__select-cell"
            >
              <input
                type="checkbox"
                className="nova-data-table__checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map((col) => {
            const active = sort?.key === col.key && sort.direction !== "none";
            const direction: SortDirection = active
              ? sort!.direction
              : "none";
            const ariaSort = active
              ? direction === "asc"
                ? "ascending"
                : "descending"
              : "none";
            return (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sortable ? ariaSort : undefined}
                className={cn(
                  "nova-data-table__header-cell",
                  `nova-data-table__cell--${col.align ?? "left"}`,
                  col.sortable && "nova-data-table__header-cell--sortable"
                )}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="nova-data-table__sort-button"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span>{col.header}</span>
                    <SortIcon direction={direction} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="nova-data-table__body">
        {sortedData.length === 0 ? (
          <tr>
            <td className="nova-data-table__empty" colSpan={colCount}>
              {emptyState ?? "No data"}
            </td>
          </tr>
        ) : (
          sortedData.map((row, rowIndex) => {
            const key = getKey(row, rowIndex);
            const isSelected = selected.has(key);
            return (
              <tr
                key={key}
                aria-selected={selectable ? isSelected : undefined}
                className={cn(
                  "nova-data-table__row",
                  isSelected && "nova-data-table__row--selected"
                )}
              >
                {selectable && (
                  <td className="nova-data-table__select-cell">
                    <input
                      type="checkbox"
                      className="nova-data-table__checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(key)}
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "nova-data-table__cell",
                      `nova-data-table__cell--${col.align ?? "left"}`
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
  );

  return (
    <div className={cn("nova-data-table__scroll", containerClassName)}>
      {table}
    </div>
  );
}
