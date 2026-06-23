import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SkipLink.css";

export interface SkipLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /**
   * Target element id to jump to (without the leading `#`), e.g. `"main"`.
   * Rendered as `href="#main"`.
   */
  href: string;
}

/**
 * "Skip to content" link — visually hidden until focused, then revealed at the
 * top-left of the viewport. Place as the first focusable element in the DOM so
 * keyboard / screen-reader users can bypass repeated navigation.
 *
 * The `href` is the bare target id (e.g. `"main"` → `href="#main"`). Children
 * default to `"Skip to content"`.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink({ href, className, children, ...rest }, ref) {
    const target = href.startsWith("#") ? href : `#${href}`;
    return (
      <a
        ref={ref}
        href={target}
        className={cn("nova-skip-link", className)}
        {...rest}
      >
        {children ?? "Skip to content"}
      </a>
    );
  }
);
