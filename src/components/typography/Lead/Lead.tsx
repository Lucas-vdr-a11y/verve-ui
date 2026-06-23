import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Lead.css";

export type LeadSize = "sm" | "md" | "lg";

export interface LeadProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Element to render. Defaults to `"p"`. */
  as?: "p" | "div";
  /** Size on the lead scale. Defaults to `"md"`. */
  size?: LeadSize;
}

/**
 * Lead — large intro paragraph that sits below a heading. Muted-strong tone,
 * relaxed leading, designed to set up the body copy that follows.
 */
export const Lead = forwardRef<HTMLParagraphElement, LeadProps>(function Lead(
  { as = "p", size = "md", className, ...rest },
  ref
) {
  return createElement(as, {
    ref,
    className: cn("nova-lead", `nova-lead--${size}`, className),
    ...rest,
  });
});
