import { Children, forwardRef, isValidElement } from "react";
import { cn } from "../../../utils/cn";
import "./Stagger.css";

export type StaggerDirection = "up" | "down" | "left" | "right" | "none";

export interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Trigger the entrance. When omitted the children animate in on mount; when
   * provided, they animate in once it becomes `true` (and reset to hidden when
   * `false`).
   */
  in?: boolean;
  /** Delay added per child, in ms. Defaults `60`. */
  gap?: number;
  /** Delay before the first child animates, in ms. Defaults `0`. */
  delay?: number;
  /** Direction each child travels in from. Defaults `"up"`. */
  direction?: StaggerDirection;
  /** Travel distance for the slide portion. Defaults `"0.75rem"`. */
  distance?: number | string;
  children?: React.ReactNode;
}

/**
 * Animates its children in with a staggered, incremental delay. Each child is
 * wrapped in an item element whose CSS animation is delayed by `index * gap`.
 * Triggers on mount, or on an `in` prop when supplied. Reduced motion is handled
 * by the stylesheet (animations disabled, items shown immediately).
 */
export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  function Stagger(
    {
      in: inProp,
      gap = 60,
      delay = 0,
      direction = "up",
      distance = "0.75rem",
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    // No `in` prop => animate on mount (treated as always "in").
    const active = inProp ?? true;
    const dist = typeof distance === "number" ? `${distance}px` : distance;
    const items = Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn("nova-stagger", `nova-stagger--${direction}`, className)}
        data-active={active ? "" : undefined}
        style={
          { "--nova-stagger-distance": dist, ...style } as React.CSSProperties
        }
        {...rest}
      >
        {items.map((child, i) => {
          const key = isValidElement(child) && child.key != null ? child.key : i;
          return (
            <div
              key={key}
              className="nova-stagger__item"
              style={
                {
                  "--nova-stagger-delay": `${delay + i * gap}ms`,
                } as React.CSSProperties
              }
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }
);
