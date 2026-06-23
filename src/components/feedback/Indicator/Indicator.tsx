import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Indicator.css";

export type IndicatorTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type IndicatorPlacement =
  | "top-end"
  | "top-start"
  | "bottom-end"
  | "bottom-start";

export interface IndicatorProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Color tone. Defaults to `"primary"`. */
  tone?: IndicatorTone;
  /** Animated ping/pulse halo. Defaults to `false`. */
  pulse?: boolean;
  /**
   * Optional numeric/text content shown inside the dot (turns it into a badge).
   * When omitted the indicator is a bare dot.
   */
  content?: React.ReactNode;
  /**
   * Corner placement when wrapping `children`. Defaults to `"top-end"`.
   * Ignored when used standalone (no children).
   */
  placement?: IndicatorPlacement;
  /** Accessible label describing the indicator (e.g. "3 unread"). */
  label?: string;
}

/**
 * Indicator — a small status dot / pulse. Use standalone, or wrap a child
 * (avatar, icon, button) to position a notification dot or count on its corner.
 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(
  function Indicator(
    {
      tone = "primary",
      pulse = false,
      content,
      placement = "top-end",
      label,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const hasContent = content != null && content !== "";
    const dot = (
      <span
        className={cn(
          "nova-indicator__dot",
          `nova-indicator__dot--${tone}`,
          pulse && "nova-indicator__dot--pulse",
          hasContent && "nova-indicator__dot--badge"
        )}
        role={label ? "status" : undefined}
        aria-label={label}
      >
        {pulse && <span className="nova-indicator__ping" aria-hidden="true" />}
        {hasContent && (
          <span className="nova-indicator__content">{content}</span>
        )}
      </span>
    );

    if (children == null) {
      return (
        <span
          ref={ref}
          className={cn("nova-indicator", "nova-indicator--standalone", className)}
          {...rest}
        >
          {dot}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          "nova-indicator",
          `nova-indicator--${placement}`,
          className
        )}
        {...rest}
      >
        {children}
        {dot}
      </span>
    );
  }
);
