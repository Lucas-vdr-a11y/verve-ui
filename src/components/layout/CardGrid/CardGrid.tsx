import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CardGrid.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type CardGridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Minimum width of each card. The grid auto-fits as many columns of at least
   * this width as fit, then stretches them to fill the row. Accepts a CSS
   * length; numbers are treated as `px`. @default "16rem"
   */
  minCardWidth?: number | string;
  /** Gap between cards, from the `--nova-space-*` scale. @default 4 */
  gap?: CardGridGap;
  /**
   * Equalise card heights so every card in a row matches the tallest.
   * @default true
   */
  equalHeight?: boolean;
  /**
   * Use `auto-fill` instead of `auto-fit`. `auto-fill` preserves empty column
   * tracks (cards keep their min width); `auto-fit` collapses them (cards grow
   * to fill). @default false
   */
  fill?: boolean;
}

/**
 * CardGrid — a responsive auto-fit grid tuned for cards. Set a `minCardWidth`
 * and it lays out as many equal columns as fit, with consistent `gap` and
 * optional equal heights. No masonry; rows align cleanly.
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  function CardGrid(
    {
      minCardWidth = "16rem",
      gap = 4,
      equalHeight = true,
      fill = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const minWidth =
      typeof minCardWidth === "number" ? `${minCardWidth}px` : minCardWidth;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-card-grid",
          equalHeight && "nova-card-grid--equal",
          className,
        )}
        style={
          {
            "--nova-card-grid-min": minWidth,
            "--nova-card-grid-gap": `var(--nova-space-${gap})`,
            "--nova-card-grid-fit": fill ? "auto-fill" : "auto-fit",
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  },
);
