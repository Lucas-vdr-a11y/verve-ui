import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Stat.css";

export type StatTrendDirection = "up" | "down";

export interface StatTrend {
  /** Direction of change. */
  direction: StatTrendDirection;
  /** Delta text, e.g. `"12%"` or `"+340"`. */
  value: React.ReactNode;
  /**
   * Whether the direction is good. Defaults to `up = positive`.
   * Set explicitly to color "down" as positive (e.g. lower bounce rate).
   */
  positive?: boolean;
  /** Visually-hidden description for screen readers, e.g. "increased by". */
  label?: string;
}

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric label, e.g. "Monthly revenue". */
  label: React.ReactNode;
  /** The primary metric value. */
  value: React.ReactNode;
  /** Secondary supporting text shown under the value. */
  helpText?: React.ReactNode;
  /** Optional trend indicator. */
  trend?: StatTrend;
  /** Leading icon slot. */
  icon?: React.ReactNode;
}

const ArrowUp = (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M8 13V3M8 3l-4 4M8 3l4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowDown = (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M8 3v10M8 13l-4-4M8 13l4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, helpText, trend, icon, className, ...rest },
  ref
) {
  const isPositive =
    trend &&
    (trend.positive !== undefined
      ? trend.positive
      : trend.direction === "up");

  return (
    <div ref={ref} className={cn("nova-stat", className)} {...rest}>
      {icon && (
        <span className="nova-stat__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="nova-stat__body">
        <span className="nova-stat__label">{label}</span>
        <div className="nova-stat__value-row">
          <span className="nova-stat__value">{value}</span>
          {trend && (
            <span
              className={cn(
                "nova-stat__trend",
                isPositive
                  ? "nova-stat__trend--positive"
                  : "nova-stat__trend--negative"
              )}
            >
              <span className="nova-stat__trend-icon" aria-hidden="true">
                {trend.direction === "up" ? ArrowUp : ArrowDown}
              </span>
              {trend.label && (
                <span className="nova-stat__sr-only">{trend.label} </span>
              )}
              <span className="nova-stat__trend-value">{trend.value}</span>
            </span>
          )}
        </div>
        {helpText && <span className="nova-stat__help">{helpText}</span>}
      </div>
    </div>
  );
});
