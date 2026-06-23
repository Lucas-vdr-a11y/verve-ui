import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./KpiCard.css";

export type KpiCardTrendDirection = "up" | "down";

export interface KpiCardDelta {
  /** Trend direction relative to the previous period. */
  direction: KpiCardTrendDirection;
  /** Delta value, e.g. "12%". */
  value: React.ReactNode;
  /**
   * Whether the change is good. Defaults to `up = positive`.
   * Set explicitly when lower is better (e.g. churn, bounce rate).
   */
  positive?: boolean;
}

export interface KpiCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "value"> {
  /** KPI label, e.g. "Active users". */
  label: React.ReactNode;
  /** Big value, e.g. "12,480". */
  value: React.ReactNode;
  /** Delta / trend indicator vs the previous period. */
  delta?: KpiCardDelta;
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Period note, e.g. "vs last 30 days". */
  period?: React.ReactNode;
  /** Series of numbers used to render the inline sparkline. */
  sparkline?: number[];
}

const TrendArrow = ({ direction }: { direction: KpiCardTrendDirection }) => (
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

function Sparkline({
  data,
  positive,
  gradientId,
}: {
  data: number[];
  positive: boolean;
  gradientId: string;
}) {
  const width = 96;
  const height = 32;
  const pad = 2;

  if (data.length === 0) return null;

  if (data.length === 1) {
    const y = height / 2;
    return (
      <svg
        className="nova-kpi-card__spark-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1={pad}
          y1={y}
          x2={width - pad}
          y2={y}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (d - min) / range);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaPath =
    `M${points[0][0].toFixed(2)} ${(height - pad).toFixed(2)} ` +
    points.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") +
    ` L${points[points.length - 1][0].toFixed(2)} ${(height - pad).toFixed(2)} Z`;

  return (
    <svg
      className={cn(
        "nova-kpi-card__spark-svg",
        positive ? "nova-kpi-card__spark-svg--positive" : "nova-kpi-card__spark-svg--negative",
      )}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * KpiCard — dashboard KPI tile with a label, big value, delta vs previous
 * period, an inline SVG sparkline, an icon, and a period note.
 */
export const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(function KpiCard(
  { label, value, delta, icon, period, sparkline, className, ...rest },
  ref,
) {
  const gradientId = useId();

  const isPositive =
    delta && (delta.positive !== undefined ? delta.positive : delta.direction === "up");

  // Sparkline tone follows the delta sentiment when available, else neutral-positive.
  const sparkPositive = delta ? !!isPositive : true;

  return (
    <div ref={ref} className={cn("nova-kpi-card", className)} {...rest}>
      <div className="nova-kpi-card__top">
        <span className="nova-kpi-card__label">{label}</span>
        {icon && (
          <span className="nova-kpi-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="nova-kpi-card__body">
        <div className="nova-kpi-card__value-block">
          <span className="nova-kpi-card__value">{value}</span>
          {delta && (
            <span
              className={cn(
                "nova-kpi-card__delta",
                isPositive
                  ? "nova-kpi-card__delta--positive"
                  : "nova-kpi-card__delta--negative",
              )}
            >
              <span className="nova-kpi-card__delta-icon" aria-hidden="true">
                <TrendArrow direction={delta.direction} />
              </span>
              <span className="nova-kpi-card__sr-only">
                {delta.direction === "up" ? "increased by " : "decreased by "}
              </span>
              <span>{delta.value}</span>
            </span>
          )}
        </div>

        {sparkline && sparkline.length > 0 && (
          <div className="nova-kpi-card__spark" aria-hidden="true">
            <Sparkline data={sparkline} positive={sparkPositive} gradientId={gradientId} />
          </div>
        )}
      </div>

      {period && <p className="nova-kpi-card__period">{period}</p>}
    </div>
  );
});
