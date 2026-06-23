import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MetricCard.css";

export type MetricTrendDirection = "up" | "down" | "flat";
export type MetricTone = "primary" | "success" | "warning" | "danger" | "info";

export interface MetricTrend {
  /** Direction of change. */
  direction: MetricTrendDirection;
  /** Delta text, e.g. `"12%"`. */
  value: React.ReactNode;
  /**
   * Whether the change is good. Defaults to `up = positive`, `down = negative`.
   * Set explicitly when lower is better (e.g. bounce rate).
   */
  positive?: boolean;
  /** Visually-hidden screen-reader prefix, e.g. "increased by". */
  label?: string;
}

export interface MetricCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Metric label, e.g. "Active users". */
  label: React.ReactNode;
  /** Primary metric value. */
  value: React.ReactNode;
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Optional trend indicator. */
  trend?: MetricTrend;
  /** Mini bar chart data — relative magnitudes. */
  data?: number[];
  /** Bar/accent tone. Defaults to `"primary"`. */
  tone?: MetricTone;
}

const TrendIcon = ({ direction }: { direction: MetricTrendDirection }) => {
  if (direction === "flat") {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  const d =
    direction === "up"
      ? "M8 13V3M8 3l-4 4M8 3l4 4"
      : "M8 3v10M8 13l-4-4M8 13l4-4";
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    { label, value, icon, trend, data, tone = "primary", className, ...rest },
    ref
  ) {
    const isPositive =
      trend &&
      (trend.positive !== undefined
        ? trend.positive
        : trend.direction === "up");

    const max = data && data.length ? Math.max(...data, 1) : 1;

    return (
      <div
        ref={ref}
        className={cn("nova-metric-card", `nova-metric-card--${tone}`, className)}
        {...rest}
      >
        <div className="nova-metric-card__header">
          <span className="nova-metric-card__label">{label}</span>
          {icon && (
            <span className="nova-metric-card__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <div className="nova-metric-card__value-row">
          <span className="nova-metric-card__value">{value}</span>
          {trend && (
            <span
              className={cn(
                "nova-metric-card__trend",
                trend.direction === "flat"
                  ? "nova-metric-card__trend--flat"
                  : isPositive
                  ? "nova-metric-card__trend--positive"
                  : "nova-metric-card__trend--negative"
              )}
            >
              <span className="nova-metric-card__trend-icon" aria-hidden="true">
                <TrendIcon direction={trend.direction} />
              </span>
              {trend.label && (
                <span className="nova-metric-card__sr-only">{trend.label} </span>
              )}
              <span>{trend.value}</span>
            </span>
          )}
        </div>

        {data && data.length > 0 && (
          <div className="nova-metric-card__spark" aria-hidden="true">
            {data.map((n, i) => (
              <span
                key={i}
                className="nova-metric-card__bar"
                style={{
                  height: `${Math.max((Math.max(n, 0) / max) * 100, 4)}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
