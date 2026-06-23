import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Table.css";

export type TableAlign = "left" | "center" | "right";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Zebra-stripe body rows. */
  striped?: boolean;
  /** Highlight rows on hover. */
  hoverable?: boolean;
  /** Compact row padding. */
  dense?: boolean;
  /** Make the header stick to the top of a scrolling container. */
  stickyHeader?: boolean;
  /**
   * Wrap the table in a horizontally-scrollable container. Defaults to `true`.
   * Required for `stickyHeader` to behave inside an overflow context.
   */
  scrollContainer?: boolean;
  /** Class applied to the scroll wrapper (when `scrollContainer`). */
  containerClassName?: string;
}

const TableBase = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    striped = false,
    hoverable = false,
    dense = false,
    stickyHeader = false,
    scrollContainer = true,
    containerClassName,
    className,
    children,
    ...rest
  },
  ref
) {
  const table = (
    <table
      ref={ref}
      className={cn(
        "nova-table",
        striped && "nova-table--striped",
        hoverable && "nova-table--hoverable",
        dense && "nova-table--dense",
        stickyHeader && "nova-table--sticky-header",
        className
      )}
      {...rest}
    >
      {children}
    </table>
  );

  if (!scrollContainer) return table;

  return (
    <div className={cn("nova-table__scroll", containerClassName)}>{table}</div>
  );
});

export interface TableSectionProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHead = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableHead({ className, ...rest }, ref) {
    return (
      <thead ref={ref} className={cn("nova-table__head", className)} {...rest} />
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableBody({ className, ...rest }, ref) {
    return (
      <tbody ref={ref} className={cn("nova-table__body", className)} {...rest} />
    );
  }
);

export const TableFoot = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableFoot({ className, ...rest }, ref) {
    return (
      <tfoot ref={ref} className={cn("nova-table__foot", className)} {...rest} />
    );
  }
);

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row as selected (adds aria-selected + styling). */
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ selected, className, ...rest }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          "nova-table__row",
          selected && "nova-table__row--selected",
          className
        )}
        aria-selected={selected || undefined}
        {...rest}
      />
    );
  }
);

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Horizontal alignment for this cell. Defaults to `"left"`. */
  align?: TableAlign;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ align = "left", className, ...rest }, ref) {
    return (
      <td
        ref={ref}
        className={cn("nova-table__cell", `nova-table__cell--${align}`, className)}
        {...rest}
      />
    );
  }
);

export interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Horizontal alignment for this column. Defaults to `"left"`. */
  align?: TableAlign;
}

export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(function TableHeaderCell(
  { align = "left", scope = "col", className, ...rest },
  ref
) {
  return (
    <th
      ref={ref}
      scope={scope}
      className={cn(
        "nova-table__header-cell",
        `nova-table__cell--${align}`,
        className
      )}
      {...rest}
    />
  );
});

type TableComponent = typeof TableBase & {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Foot: typeof TableFoot;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  HeaderCell: typeof TableHeaderCell;
};

const Table = TableBase as TableComponent;
Table.Head = TableHead;
Table.Body = TableBody;
Table.Foot = TableFoot;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;

export { Table };
