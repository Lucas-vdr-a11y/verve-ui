import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StatGroup.css";

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show vertical dividers between items. Defaults to `true`. */
  dividers?: boolean;
  /**
   * Minimum width (CSS length) each item can shrink to before wrapping.
   * Defaults to `"12rem"`.
   */
  minItemWidth?: string;
}

/**
 * Lays out multiple Stat-like cards in a responsive row with optional dividers.
 * Wrap any number of `<Stat>` (or compatible) children.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(
  function StatGroup(
    { dividers = true, minItemWidth = "12rem", className, style, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "nova-stat-group",
          dividers && "nova-stat-group--dividers",
          className
        )}
        style={
          {
            "--nova-stat-group-min": minItemWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  }
);
