import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Prose.css";

export type ProseSize = "sm" | "md" | "lg";

export interface ProseProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render the container as. Defaults to `"div"`. */
  as?: "div" | "article" | "section";
  /** Overall type scale for the rendered rich text. Defaults to `"md"`. */
  size?: ProseSize;
}

/**
 * Prose — rich-text / markdown container. Styles raw HTML children
 * (headings, paragraphs, lists, blockquotes, code, tables, images, …) with
 * good vertical rhythm using only semantic + typographic tokens.
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { as = "div", size = "md", className, ...rest },
  ref
) {
  return createElement(as, {
    ref,
    className: cn("nova-prose", `nova-prose--${size}`, className),
    ...rest,
  });
});
