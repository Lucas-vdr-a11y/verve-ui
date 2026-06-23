import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Ribbon.css";

export type RibbonTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type RibbonPlacement = "top-end" | "top-start";

export interface RibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text/content shown on the ribbon (e.g. "New", "Sale"). */
  text: React.ReactNode;
  /** Corner to anchor the ribbon to. Defaults to `"top-end"`. */
  placement?: RibbonPlacement;
  /** Color tone. Defaults to `"primary"`. */
  tone?: RibbonTone;
}

/**
 * Ribbon — a diagonal corner ribbon overlaying a container. Wraps its children
 * with `position: relative` and pins a tone-colored banner across one corner.
 */
export const Ribbon = forwardRef<HTMLDivElement, RibbonProps>(function Ribbon(
  { text, placement = "top-end", tone = "primary", className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-ribbon",
        `nova-ribbon--${placement}`,
        `nova-ribbon--${tone}`,
        className
      )}
      {...rest}
    >
      {children}
      <span className="nova-ribbon__band">
        <span className="nova-ribbon__text">{text}</span>
      </span>
    </div>
  );
});
