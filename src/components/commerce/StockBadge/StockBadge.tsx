import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StockBadge.css";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "preorder";

export type StockBadgeSize = "sm" | "md" | "lg";

export interface StockBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Availability status. */
  status: StockStatus;
  /**
   * Units remaining — shown as "n left" for `low-stock`. Ignored otherwise.
   */
  count?: number;
  /** Override the default text for the status. */
  label?: React.ReactNode;
  /** Show the leading status dot. @default true */
  showDot?: boolean;
  /** Size variant. @default "md" */
  size?: StockBadgeSize;
}

const DEFAULT_LABELS: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
  preorder: "Pre-order",
};

/**
 * StockBadge — availability indicator with a tone + dot. Covers in-stock,
 * low-stock ("n left"), out-of-stock and preorder.
 */
export const StockBadge = forwardRef<HTMLSpanElement, StockBadgeProps>(
  function StockBadge(
    { status, count, label, showDot = true, size = "md", className, ...rest },
    ref,
  ) {
    let text: React.ReactNode = label ?? DEFAULT_LABELS[status];
    if (label === undefined && status === "low-stock" && count !== undefined) {
      text = `${count} left`;
    }

    return (
      <span
        ref={ref}
        className={cn(
          "nova-stock-badge",
          `nova-stock-badge--${status}`,
          `nova-stock-badge--${size}`,
          className,
        )}
        {...rest}
      >
        {showDot && <span className="nova-stock-badge__dot" aria-hidden="true" />}
        <span className="nova-stock-badge__label">{text}</span>
      </span>
    );
  },
);
