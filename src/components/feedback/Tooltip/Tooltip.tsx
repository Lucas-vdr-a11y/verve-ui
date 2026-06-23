import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./Tooltip.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Content shown inside the tooltip bubble. */
  content: React.ReactNode;
  /** Where the bubble appears relative to the child. Defaults to `"top"`. */
  placement?: TooltipPlacement;
  /** The trigger element. Tooltip shows on its hover/focus. */
  children: React.ReactNode;
}

/**
 * Pure-CSS positioned tooltip. Wraps a trigger and reveals `content` on
 * hover or keyboard focus. The bubble is always rendered (so it can be
 * referenced via `aria-describedby`) and toggled with CSS visibility — no
 * portals, no JS positioning, SSR-safe.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  function Tooltip(
    { content, placement = "top", children, className, ...rest },
    ref
  ) {
    const id = useId();

    return (
      <span
        ref={ref}
        className={cn("nova-tooltip", `nova-tooltip--${placement}`, className)}
        {...rest}
      >
        <span className="nova-tooltip__trigger" aria-describedby={id}>
          {children}
        </span>
        <span
          id={id}
          role="tooltip"
          className="nova-tooltip__bubble"
          aria-hidden="true"
        >
          {content}
          <span className="nova-tooltip__arrow" aria-hidden="true" />
        </span>
      </span>
    );
  }
);
