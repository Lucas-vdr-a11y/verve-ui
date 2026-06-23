import {
  forwardRef,
  useEffect,
  useRef,
  Children,
  isValidElement,
} from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedList.css";

export interface AnimatedListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * Where new children enter and the stacking order. `"top"` pushes new items
   * in at the top (live activity / notifications). `"bottom"` appends. Defaults
   * `"top"`.
   */
  origin?: "top" | "bottom";
  /** Delay between successive items animating in, ms. Defaults `90`. */
  stagger?: number;
  /** Cap the number of rendered items, trimming from the far end. Defaults unlimited. */
  max?: number;
  children?: React.ReactNode;
}

/**
 * Renders its children as a list where each item springs in (slide + fade). On
 * first paint the whole list staggers in; afterwards only newly-added children
 * replay the entrance, so it doubles as a live, streaming feed — set
 * `origin="top"` to have fresh items push in at the top.
 *
 * New items are detected by key against the previous render. The stagger delay
 * is fed to CSS via a custom property. Reduced motion is respected in CSS.
 */
export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(
  function AnimatedList(
    { origin = "top", stagger = 90, max, className, children, style, ...rest },
    ref
  ) {
    const items = Children.toArray(children).filter(isValidElement);
    const ordered = origin === "top" ? [...items].reverse() : items;
    const trimmed =
      typeof max === "number" && ordered.length > max
        ? origin === "top"
          ? ordered.slice(0, max)
          : ordered.slice(ordered.length - max)
        : ordered;

    // Keys present in the previous committed render. Empty on first render so
    // every item is treated as "new" and the whole list staggers in once.
    const prevKeys = useRef<Set<React.Key> | null>(null);
    const isFirst = prevKeys.current === null;

    useEffect(() => {
      prevKeys.current = new Set(
        trimmed.map((child, i) => child.key ?? i)
      );
    });

    return (
      <ul
        ref={ref}
        className={cn("nova-anim-list", `nova-anim-list--${origin}`, className)}
        style={
          {
            "--nova-anim-list-stagger": `${stagger}ms`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {trimmed.map((child, i) => {
          const key = child.key ?? i;
          const isNew = isFirst || !prevKeys.current?.has(key);
          return (
            <li
              key={key}
              className={cn(
                "nova-anim-list__item",
                isNew && "nova-anim-list__item--enter"
              )}
              style={
                {
                  "--nova-anim-list-i": isFirst ? i : 0,
                } as React.CSSProperties
              }
            >
              {child}
            </li>
          );
        })}
      </ul>
    );
  }
);
