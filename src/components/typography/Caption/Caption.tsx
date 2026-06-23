import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Caption.css";

export type CaptionElement = "span" | "p" | "figcaption" | "label" | "div";
export type CaptionTone = "muted" | "subtle" | "default";

export interface CaptionProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `"span"`. */
  as?: CaptionElement;
  /** Color tone. Defaults to `"muted"`. */
  tone?: CaptionTone;
  /** Render in uppercase with wider tracking. */
  uppercase?: boolean;
}

/**
 * Caption — small caption / label text for figures, form fields and metadata.
 * Optional uppercase + tracking treatment for eyebrow-style labels.
 */
export const Caption = forwardRef<HTMLElement, CaptionProps>(function Caption(
  { as = "span", tone = "muted", uppercase = false, className, ...rest },
  ref
) {
  return createElement(as, {
    ref,
    className: cn(
      "nova-caption",
      `nova-caption--${tone}`,
      uppercase && "nova-caption--uppercase",
      className
    ),
    ...rest,
  });
});
