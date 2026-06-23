import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ComparisonTable.css";

export type ComparisonAlign = "left" | "center" | "right";

/** A cell value: boolean renders a check/cross, otherwise the node is shown. */
export type ComparisonValue = boolean | string | number | React.ReactNode;

export interface ComparisonColumn {
  /** Unique column id. */
  id: string;
  /** Column heading (plan / product name). */
  title: React.ReactNode;
  /** Optional sub-label under the title (e.g. price). */
  subtitle?: React.ReactNode;
  /** Visually emphasize this column. */
  highlighted?: boolean;
  /** Horizontal alignment for this column's cells. Defaults to `"center"`. */
  align?: ComparisonAlign;
}

export interface ComparisonRow {
  /** Unique row id. */
  id: string;
  /** Feature label shown in the sticky first column. */
  feature: React.ReactNode;
  /** Optional helper text under the feature label. */
  hint?: React.ReactNode;
  /** Cell value per column, keyed by column id. */
  values: Record<string, ComparisonValue>;
}

export interface ComparisonTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Column definitions (the plans / products being compared). */
  columns: ComparisonColumn[];
  /** Row definitions (the features). */
  rows: ComparisonRow[];
  /** Heading shown above the feature column. */
  featureHeading?: React.ReactNode;
  /** Keep the header row stuck to the top while scrolling. Defaults to `true`. */
  stickyHeader?: boolean;
  /** Class applied to the scroll wrapper. */
  containerClassName?: string;
}

const CheckMark = () => (
  <svg
    className="nova-comparison__icon nova-comparison__icon--yes"
    viewBox="0 0 16 16"
    width="1.15em"
    height="1.15em"
    role="img"
    aria-label="Yes"
  >
    <path
      d="M3.5 8.5l3 3 6-6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossMark = () => (
  <svg
    className="nova-comparison__icon nova-comparison__icon--no"
    viewBox="0 0 16 16"
    width="1.05em"
    height="1.05em"
    role="img"
    aria-label="No"
  >
    <path
      d="M4.5 4.5l7 7M11.5 4.5l-7 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

function renderCell(value: ComparisonValue): React.ReactNode {
  if (value === true) return <CheckMark />;
  if (value === false) return <CrossMark />;
  return value;
}

/**
 * ComparisonTable — a feature-comparison matrix (features × plans). Supports
 * boolean (check / cross), text, or node cell values, a highlighted column, and
 * a sticky first column + header.
 */
export const ComparisonTable = forwardRef<
  HTMLDivElement,
  ComparisonTableProps
>(function ComparisonTable(
  {
    columns,
    rows,
    featureHeading,
    stickyHeader = true,
    containerClassName,
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("nova-comparison__scroll", containerClassName)}
      {...rest}
    >
      <table
        className={cn(
          "nova-comparison",
          stickyHeader && "nova-comparison--sticky-header",
          className
        )}
      >
        <thead className="nova-comparison__head">
          <tr>
            <th
              scope="col"
              className="nova-comparison__corner nova-comparison__feature-col"
            >
              {featureHeading}
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                aria-current={col.highlighted ? "true" : undefined}
                className={cn(
                  "nova-comparison__col-header",
                  `nova-comparison__cell--${col.align ?? "center"}`,
                  col.highlighted && "nova-comparison__col-header--highlighted"
                )}
              >
                <span className="nova-comparison__col-title">{col.title}</span>
                {col.subtitle != null && (
                  <span className="nova-comparison__col-subtitle">
                    {col.subtitle}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="nova-comparison__body">
          {rows.map((row) => (
            <tr key={row.id} className="nova-comparison__row">
              <th
                scope="row"
                className="nova-comparison__feature-col nova-comparison__feature"
              >
                <span className="nova-comparison__feature-label">
                  {row.feature}
                </span>
                {row.hint != null && (
                  <span className="nova-comparison__feature-hint">
                    {row.hint}
                  </span>
                )}
              </th>
              {columns.map((col) => (
                <td
                  key={col.id}
                  aria-current={col.highlighted ? "true" : undefined}
                  className={cn(
                    "nova-comparison__cell",
                    `nova-comparison__cell--${col.align ?? "center"}`,
                    col.highlighted && "nova-comparison__cell--highlighted"
                  )}
                >
                  {renderCell(row.values[col.id])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
