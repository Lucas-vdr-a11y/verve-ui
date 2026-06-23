import { Children, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Masonry.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type MasonryGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

/**
 * Number of columns. Either a fixed count, or a responsive map keyed by a
 * minimum viewport breakpoint: `base` (default), `sm`, `md`, `lg`, `xl`.
 */
export type MasonryColumns =
  | number
  | {
      base?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column count, fixed or responsive. @default 3 */
  columns?: MasonryColumns;
  /** Gap between items, from the `--nova-space-*` scale. @default 4 */
  gap?: MasonryGap;
}

/**
 * Masonry — a CSS-columns masonry layout. Children flow top-to-bottom then wrap
 * into the next column, packing items of varying height with no row gaps.
 * `columns` accepts a fixed number or a responsive breakpoint map. Pure CSS —
 * no measurement, fully SSR-safe.
 */
export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(
  function Masonry(
    { columns = 3, gap = 4, className, style, children, ...rest },
    ref,
  ) {
    const responsive =
      typeof columns === "number" ? { base: columns } : columns;

    const vars: Record<string, string | number> = {
      "--nova-masonry-gap": `var(--nova-space-${gap})`,
    };
    if (responsive.base != null) vars["--nova-masonry-cols"] = responsive.base;
    if (responsive.sm != null) vars["--nova-masonry-cols-sm"] = responsive.sm;
    if (responsive.md != null) vars["--nova-masonry-cols-md"] = responsive.md;
    if (responsive.lg != null) vars["--nova-masonry-cols-lg"] = responsive.lg;
    if (responsive.xl != null) vars["--nova-masonry-cols-xl"] = responsive.xl;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-masonry",
          responsive.sm != null && "nova-masonry--sm",
          responsive.md != null && "nova-masonry--md",
          responsive.lg != null && "nova-masonry--lg",
          responsive.xl != null && "nova-masonry--xl",
          className,
        )}
        style={{ ...vars, ...style } as React.CSSProperties}
        {...rest}
      >
        {Children.map(children, (child, i) =>
          child == null ? null : (
            <div className="nova-masonry__item" key={i}>
              {child}
            </div>
          ),
        )}
      </div>
    );
  },
);
