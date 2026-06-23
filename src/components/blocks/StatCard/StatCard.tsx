import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StatCard.css";

export type StatCardTrendDirection = "up" | "down";

export interface StatCardDelta {
  /** Trend direction. */
  direction: StatCardTrendDirection;
  /** Delta value, e.g. "12%". */
  value: React.ReactNode;
  /**
   * Whether the change is good. Defaults to `up = positive`.
   * Set explicitly when lower is better (e.g. churn).
   */
  positive?: boolean;
}

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** KPI label, e.g. "Monthly revenue". */
  label: React.ReactNode;
  /** Big value, e.g. "$48.2k". */
  value: React.ReactNode;
  /** Delta / trend indicator. */
  delta?: StatCardDelta;
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Optional mini description below the value. */
  description?: React.ReactNode;
}

const TrendArrow = ({ direction }: { direction: StatCardTrendDirection }) => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d={direction === "up" ? "M8 13V3M8 3l-4 4M8 3l4 4" : "M8 3v10M8 13l-4-4M8 13l4-4"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * StatCard — dashboard KPI tile: label, big value, optional delta/trend,
 * icon and mini description.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard(
    { label, value, delta, icon, description, className, ...rest },
    ref,
  ) {
    const isPositive =
      delta &&
      (delta.positive !== undefined ? delta.positive : delta.direction === "up");

    return (
      <div ref={ref} className={cn("nova-stat-card", className)} {...rest}>
        <div className="nova-stat-card__top">
          <span className="nova-stat-card__label">{label}</span>
          {icon && (
            <span className="nova-stat-card__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <div className="nova-stat-card__value-row">
          <span className="nova-stat-card__value">{value}</span>
          {delta && (
            <span
              className={cn(
                "nova-stat-card__delta",
                isPositive
                  ? "nova-stat-card__delta--positive"
                  : "nova-stat-card__delta--negative",
              )}
            >
              <span className="nova-stat-card__delta-icon" aria-hidden="true">
                <TrendArrow direction={delta.direction} />
              </span>
              <span className="nova-stat-card__sr-only">
                {delta.direction === "up" ? "increased by " : "decreased by "}
              </span>
              <span>{delta.value}</span>
            </span>
          )}
        </div>

        {description && (
          <p className="nova-stat-card__description">{description}</p>
        )}
      </div>
    );
  },
);
