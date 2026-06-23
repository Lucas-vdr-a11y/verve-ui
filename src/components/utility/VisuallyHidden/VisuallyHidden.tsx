import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";

export type VisuallyHiddenElement = "span" | "div" | "p" | "label";

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `"span"`. */
  as?: VisuallyHiddenElement;
}

/**
 * Hides content visually while keeping it available to assistive technology.
 *
 * Wraps the shared `.nova-visually-hidden` utility (defined in base.css) as a
 * polymorphic component. Use for screen-reader-only labels, skip links, live
 * region text, etc.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden({ as = "span", className, ...rest }, ref) {
    return createElement(as, {
      ref,
      className: cn("nova-visually-hidden", className),
      ...rest,
    });
  }
);
