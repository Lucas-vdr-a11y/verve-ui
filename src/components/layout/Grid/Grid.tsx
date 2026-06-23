import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Grid.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of equal-width columns. Ignored when `autoFit` is set.
   * @default 12
   */
  columns?: number;
  /** Gap between cells, from the `--nova-space-*` scale. @default 4 */
  gap?: GridGap;
  /**
   * Auto-responsive mode: fill as many columns as fit, each at least
   * `minColWidth` wide. When `true`, `columns` is ignored.
   * @default false
   */
  autoFit?: boolean;
  /** Minimum column width used by `autoFit` (any CSS length). @default "16rem" */
  minColWidth?: string;
}

/**
 * Grid — a thin CSS Grid wrapper. Either a fixed column count, or a responsive
 * `autoFit` mode that wraps columns based on `minColWidth`.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    columns = 12,
    gap = 4,
    autoFit = false,
    minColWidth = "16rem",
    className,
    style,
    ...rest
  },
  ref,
) {
  const template = autoFit
    ? `repeat(auto-fit, minmax(min(${minColWidth}, 100%), 1fr))`
    : `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div
      ref={ref}
      className={cn("nova-grid", className)}
      style={{
        "--nova-grid-gap": `var(--nova-space-${gap})`,
        "--nova-grid-template": template,
        ...style,
      } as React.CSSProperties}
      {...rest}
    />
  );
});
