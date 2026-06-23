import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Truncate.css";

export interface TruncateProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Element to render. Defaults to `"span"`. */
  as?: "span" | "p" | "div";
  /**
   * Number of lines before truncating. `1` (default) uses single-line
   * ellipsis; `> 1` clamps to that many lines.
   */
  lines?: number;
  /**
   * Native `title` attribute shown on hover with the full text. Pass the
   * full string here so the truncated content stays accessible.
   */
  title?: string;
}

/**
 * Truncate — single- or multi-line truncation wrapper. Set `lines` for the
 * clamp count and `title` to expose the full text on hover.
 */
export const Truncate = forwardRef<HTMLElement, TruncateProps>(function Truncate(
  { as = "span", lines = 1, title, className, style, ...rest },
  ref
) {
  const multiline = lines > 1;

  return createElement(as, {
    ref,
    title,
    className: cn(
      "nova-truncate",
      multiline ? "nova-truncate--clamp" : "nova-truncate--single",
      className
    ),
    style: multiline
      ? ({ ["--nova-truncate-lines"]: lines, ...style } as React.CSSProperties)
      : style,
    ...rest,
  });
});
