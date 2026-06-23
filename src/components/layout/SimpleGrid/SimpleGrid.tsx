import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SimpleGrid.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type SimpleGridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface SimpleGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Responsive mode: fit as many equal columns as possible, each at least this
   * wide (any CSS length, e.g. `"16rem"`). Takes precedence over `columns`.
   */
  minChildWidth?: string;
  /**
   * Fixed number of equal-width columns. Used when `minChildWidth` is not set.
   * @default 2
   */
  columns?: number;
  /** Gap between cells, from the `--nova-space-*` scale. @default 4 */
  gap?: SimpleGridGap;
}

/**
 * SimpleGrid — the common-case responsive grid. Give it `minChildWidth` for an
 * auto-fit responsive grid, or `columns` for a fixed equal-width grid. For full
 * control over spans and templates, use `Grid` instead.
 */
export const SimpleGrid = forwardRef<HTMLDivElement, SimpleGridProps>(
  function SimpleGrid(
    { minChildWidth, columns = 2, gap = 4, className, style, ...rest },
    ref,
  ) {
    const template =
      minChildWidth !== undefined
        ? `repeat(auto-fit, minmax(min(${minChildWidth}, 100%), 1fr))`
        : `repeat(${columns}, minmax(0, 1fr))`;

    return (
      <div
        ref={ref}
        className={cn("nova-simple-grid", className)}
        style={
          {
            "--nova-simple-grid-gap": `var(--nova-space-${gap})`,
            "--nova-simple-grid-template": template,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  },
);
