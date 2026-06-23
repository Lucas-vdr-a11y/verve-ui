import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Statistic.css";

export type StatisticTrend = "up" | "down" | "neutral";

export interface StatisticProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "prefix" | "title"> {
  /** The hero number (or any node). */
  value: React.ReactNode;
  /** Caption shown above or below the value. */
  label?: React.ReactNode;
  /** Rendered immediately before the value (e.g. `$`). */
  prefix?: React.ReactNode;
  /** Rendered immediately after the value (e.g. `%`, `k`). */
  suffix?: React.ReactNode;
  /** Trend direction — drives the arrow + color. */
  trend?: StatisticTrend;
  /** Trend text/number shown beside the arrow (e.g. `12%`). */
  trendValue?: React.ReactNode;
  /** Inline sparkline slot, rendered to the right of the value. */
  sparkline?: React.ReactNode;
  /** Size of the hero number. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Place the label below the value instead of above. Defaults to `false`. */
  labelBelow?: boolean;
}

const TrendArrow = ({ trend }: { trend: StatisticTrend }) => {
  if (trend === "neutral") {
    return (
      <svg viewBox="0 0 12 12" width="1em" height="1em" aria-hidden="true">
        <path d="M2 6h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const up = trend === "up";
  return (
    <svg viewBox="0 0 12 12" width="1em" height="1em" aria-hidden="true">
      <path d={up ? "M6 2.5 10 8H2z" : "M6 9.5 2 4h8z"} fill="currentColor" />
    </svg>
  );
};

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  function Statistic(
    {
      value,
      label,
      prefix,
      suffix,
      trend,
      trendValue,
      sparkline,
      size = "md",
      labelBelow = false,
      className,
      ...rest
    },
    ref
  ) {
    const labelNode = label != null && (
      <div className="nova-statistic__label">{label}</div>
    );

    return (
      <div
        ref={ref}
        className={cn("nova-statistic", `nova-statistic--${size}`, className)}
        {...rest}
      >
        {!labelBelow && labelNode}
        <div className="nova-statistic__body">
          <div className="nova-statistic__value">
            {prefix != null && (
              <span className="nova-statistic__affix nova-statistic__affix--prefix">
                {prefix}
              </span>
            )}
            <span className="nova-statistic__number">{value}</span>
            {suffix != null && (
              <span className="nova-statistic__affix nova-statistic__affix--suffix">
                {suffix}
              </span>
            )}
          </div>
          {sparkline != null && (
            <div className="nova-statistic__sparkline" aria-hidden="true">
              {sparkline}
            </div>
          )}
        </div>
        {(trend || trendValue != null) && (
          <div
            className={cn(
              "nova-statistic__trend",
              trend && `nova-statistic__trend--${trend}`
            )}
          >
            {trend && <TrendArrow trend={trend} />}
            {trendValue != null && (
              <span className="nova-statistic__trend-value">{trendValue}</span>
            )}
          </div>
        )}
        {labelBelow && labelNode}
      </div>
    );
  }
);
