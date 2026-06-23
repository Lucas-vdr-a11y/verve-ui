import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TextList.css";

export type TextListMarker = "disc" | "decimal" | "check" | "dash" | "none";
export type TextListSpacing = "tight" | "normal" | "relaxed";

export interface TextListProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered (`ol`) or unordered (`ul`) list. Defaults to `"ul"`. */
  as?: "ul" | "ol";
  /**
   * Marker style. Defaults to `"disc"` for `ul` and `"decimal"` for `ol`.
   * `check` / `dash` render custom token-styled markers.
   */
  marker?: TextListMarker;
  /** Vertical spacing between items. Defaults to `"normal"`. */
  spacing?: TextListSpacing;
}

/**
 * TextList — styled ordered / unordered list for typography contexts.
 * Named distinctly from the data-display `List` to avoid collisions.
 */
export const TextList = forwardRef<HTMLElement, TextListProps>(function TextList(
  { as = "ul", marker, spacing = "normal", className, ...rest },
  ref
) {
  const resolvedMarker = marker ?? (as === "ol" ? "decimal" : "disc");

  return createElement(as, {
    ref,
    className: cn(
      "nova-text-list",
      `nova-text-list--marker-${resolvedMarker}`,
      `nova-text-list--spacing-${spacing}`,
      className
    ),
    ...rest,
  });
});

export interface TextListItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {}

/** TextListItem — list item for use inside `TextList`. */
export const TextListItem = forwardRef<HTMLLIElement, TextListItemProps>(
  function TextListItem({ className, ...rest }, ref) {
    return (
      <li ref={ref} className={cn("nova-text-list__item", className)} {...rest} />
    );
  }
);
