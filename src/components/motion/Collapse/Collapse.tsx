import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Collapse.css";

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the content is expanded. */
  open: boolean;
  /**
   * Axis to animate. `"height"` (default) collapses vertically; `"width"`
   * horizontally; `"both"` animates both.
   */
  axis?: "height" | "width" | "both";
  /** Hide content from assistive tech and tab order while collapsed. Defaults `true`. */
  hideWhenClosed?: boolean;
  children?: React.ReactNode;
}

/**
 * Animated expand/collapse for an `open` prop. Uses the CSS grid `0fr`/`1fr`
 * trick so it works without measuring the DOM — fully SSR-safe and requires no
 * JavaScript timing. Honors reduced motion via tokens + a media-query guard.
 *
 * The single direct child is the content wrapper; it must contain the content.
 */
export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  function Collapse(
    {
      open,
      axis = "height",
      hideWhenClosed = true,
      className,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-collapse", `nova-collapse--${axis}`, className)}
        data-state={open ? "open" : "closed"}
        {...rest}
      >
        <div
          className="nova-collapse__inner"
          aria-hidden={hideWhenClosed && !open ? true : undefined}
        >
          <div className="nova-collapse__content">{children}</div>
        </div>
      </div>
    );
  }
);
