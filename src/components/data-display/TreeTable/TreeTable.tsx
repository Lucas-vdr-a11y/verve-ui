import { useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TreeTable.css";

export type TreeTableAlign = "left" | "center" | "right";
export type TreeSortDirection = "asc" | "desc" | "none";

export interface TreeTableColumn<T> {
  /** Unique key — also used to read the value from a row when `render` is absent. */
  key: string;
  /** Column header content. */
  header: React.ReactNode;
  /** Allow sorting by clicking the header. Defaults to `false`. */
  sortable?: boolean;
  /** Horizontal alignment for header + cells. Defaults to `"left"`. */
  align?: TreeTableAlign;
  /** Custom cell renderer. Receives the row and its tree depth. */
  render?: (row: T, depth: number) => React.ReactNode;
  /** Custom comparator value. Falls back to `row[key]`. */
  sortAccessor?: (row: T) => string | number | boolean | null | undefined;
}

export interface TreeTableProps<T>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children"> {
  /** Column definitions. The first column hosts the expand/collapse affordance. */
  columns: TreeTableColumn<T>[];
  /** Top-level row data. */
  data: T[];
  /** Returns the children of a row, or undefined/empty if it is a leaf. */
  getChildren?: (row: T) => T[] | undefined;
  /** Stable row key. Required for predictable expansion. Defaults to row path. */
  rowKey?: (row: T) => string | number;
  /** Controlled set of expanded row keys. */
  expandedKeys?: Array<string | number>;
  /** Default expanded keys for uncontrolled usage. */
  defaultExpandedKeys?: Array<string | number>;
  /** Expansion change callback. */
  onExpandedChange?: (keys: Array<string | number>) => void;
  /** Indentation per depth level. Defaults to `1.25rem`. */
  indent?: string;
  /** Compact row padding. */
  dense?: boolean;
  /** Content shown when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Class applied to the scroll wrapper. */
  containerClassName?: string;
}

interface SortState {
  key: string;
  direction: TreeSortDirection;
}

interface FlatRow<T> {
  row: T;
  key: string | number;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

function defaultAccessor<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={cn(
      "nova-tree-table__chevron",
      open && "nova-tree-table__chevron--open"
    )}
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M6 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function TreeTable<T>({
  columns,
  data,
  getChildren,
  rowKey,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  indent = "1.25rem",
  dense = false,
  emptyState,
  containerClassName,
  className,
  ...rest
}: TreeTableProps<T>) {
  const isControlled = expandedKeys !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<
    Array<string | number>
  >(defaultExpandedKeys ?? []);
  const [sort, setSort] = useState<SortState | null>(null);

  const expandedSet = useMemo(
    () => new Set(isControlled ? expandedKeys : internalExpanded),
    [isControlled, expandedKeys, internalExpanded]
  );

  const setExpanded = (next: Array<string | number>) => {
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const toggleExpand = (key: string | number) => {
    const next = new Set(expandedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded([...next]);
  };

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key, direction: "none" };
      return { key, direction: "asc" };
    });
  };

  const sortSiblings = (rows: T[]): T[] => {
    if (!sort || sort.direction === "none") return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const accessor = col.sortAccessor
      ? col.sortAccessor
      : (row: T) => defaultAccessor(row, col.key) as string | number;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  };

  const flatRows = useMemo(() => {
    const out: FlatRow<T>[] = [];
    const walk = (rows: T[], depth: number, pathPrefix: string) => {
      sortSiblings(rows).forEach((row, i) => {
        const fallbackKey = `${pathPrefix}${i}`;
        const key = rowKey ? rowKey(row) : fallbackKey;
        const children = getChildren?.(row);
        const hasChildren = !!children && children.length > 0;
        const expanded = hasChildren && expandedSet.has(key);
        out.push({ row, key, depth, hasChildren, expanded });
        if (expanded && children) walk(children, depth + 1, `${fallbackKey}.`);
      });
    };
    walk(data, 0, "");
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, getChildren, rowKey, expandedSet, sort]);

  const colCount = columns.length;

  return (
    <div className={cn("nova-tree-table__scroll", containerClassName)}>
      <table
        className={cn(
          "nova-tree-table",
          dense && "nova-tree-table--dense",
          className
        )}
        {...rest}
      >
        <thead className="nova-tree-table__head">
          <tr>
            {columns.map((col) => {
              const active =
                sort?.key === col.key && sort.direction !== "none";
              const direction: TreeSortDirection = active
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
                    "nova-tree-table__header-cell",
                    `nova-tree-table__cell--${col.align ?? "left"}`,
                    col.sortable && "nova-tree-table__header-cell--sortable"
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="nova-tree-table__sort-button"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span>{col.header}</span>
                      <span
                        className="nova-tree-table__sort-icon"
                        aria-hidden="true"
                      >
                        {direction === "asc"
                          ? "▲"
                          : direction === "desc"
                          ? "▼"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="nova-tree-table__body">
          {flatRows.length === 0 ? (
            <tr>
              <td className="nova-tree-table__empty" colSpan={colCount}>
                {emptyState ?? "No data"}
              </td>
            </tr>
          ) : (
            flatRows.map((fr) => (
              <tr
                key={fr.key}
                className="nova-tree-table__row"
                aria-expanded={fr.hasChildren ? fr.expanded : undefined}
              >
                {columns.map((col, colIndex) => {
                  const isFirst = colIndex === 0;
                  const content = col.render
                    ? col.render(fr.row, fr.depth)
                    : (defaultAccessor(fr.row, col.key) as React.ReactNode);
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "nova-tree-table__cell",
                        `nova-tree-table__cell--${col.align ?? "left"}`
                      )}
                    >
                      {isFirst ? (
                        <span
                          className="nova-tree-table__tree-cell"
                          style={{
                            paddingInlineStart: `calc(${indent} * ${fr.depth})`,
                          }}
                        >
                          {fr.hasChildren ? (
                            <button
                              type="button"
                              className="nova-tree-table__toggle"
                              onClick={() => toggleExpand(fr.key)}
                              aria-label={
                                fr.expanded ? "Collapse row" : "Expand row"
                              }
                            >
                              <Chevron open={fr.expanded} />
                            </button>
                          ) : (
                            <span
                              className="nova-tree-table__toggle-spacer"
                              aria-hidden="true"
                            />
                          )}
                          <span className="nova-tree-table__tree-content">
                            {content}
                          </span>
                        </span>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
