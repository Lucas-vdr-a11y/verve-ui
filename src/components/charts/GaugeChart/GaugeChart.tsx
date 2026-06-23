import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import {
  arcPath,
  clamp,
  formatNumber,
  polarToCartesian,
  toneColor,
  type ChartTone,
} from "../utils";
import "./GaugeChart.css";

export interface GaugeThreshold {
  /** Value at or above which `tone` applies. */
  at: number;
  /** Tone for the arc fill when the value reaches this threshold. */
  tone: ChartTone;
}

export interface GaugeChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** Current value. */
  value: number;
  /** Minimum of the scale. Default `0`. */
  min?: number;
  /** Maximum of the scale. Default `100`. */
  max?: number;
  /** SVG width (viewBox). Default `220`. */
  width?: number;
  /** Arc thickness in user units. Default `18`. */
  thickness?: number;
  /** Base tone for the fill arc. Default `"brand"`. */
  tone?: ChartTone;
  /**
   * Thresholds (ascending by `at`). The highest threshold whose `at` is
   * <= value wins, overriding `tone`.
   */
  thresholds?: GaugeThreshold[];
  /** Draw a needle pointing at the value instead of only an arc fill. */
  showNeedle?: boolean;
  /** Show the numeric value in the center. Default `true`. */
  showValue?: boolean;
  /** Custom center content; overrides the default value label. */
  centerLabel?: ReactNode;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/** Resolve the active tone from thresholds, falling back to `tone`. */
function resolveTone(
  value: number,
  base: ChartTone,
  thresholds?: GaugeThreshold[]
): ChartTone {
  if (!thresholds || thresholds.length === 0) return base;
  let active = base;
  for (const th of [...thresholds].sort((a, b) => a.at - b.at)) {
    if (value >= th.at) active = th.tone;
  }
  return active;
}

/**
 * GaugeChart — a 180° semicircular gauge with arc fill and optional needle.
 *
 * Pure SVG arc math, responsive via `viewBox`. Tone can switch on value via
 * `thresholds`. The center shows the value (or custom content).
 */
export const GaugeChart = forwardRef<SVGSVGElement, GaugeChartProps>(
  function GaugeChart(
    {
      value,
      min = 0,
      max = 100,
      width = 220,
      thickness = 18,
      tone = "brand",
      thresholds,
      showNeedle = false,
      showValue = true,
      centerLabel,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const span = max - min || 1;
    const frac = clamp((value - min) / span, 0, 1);

    // Semicircle: left (-90° from top) to right (+90° from top).
    const startAngle = -90;
    const endAngle = 90;
    const valueAngle = startAngle + frac * (endAngle - startAngle);

    const pad = 6;
    const radius = width / 2 - pad;
    const cx = width / 2;
    const cy = radius + pad; // baseline at the diameter
    const height = cy + pad;
    const inner = radius - thickness;

    const trackPath = arcPath(cx, cy, radius, inner, startAngle, endAngle);
    const fillPath =
      frac > 0 ? arcPath(cx, cy, radius, inner, startAngle, valueAngle) : "";

    const activeTone = resolveTone(value, tone, thresholds);
    const fillColor = toneColor(activeTone, "var(--nova-primary)");

    const needle = polarToCartesian(cx, cy, inner - 2, valueAngle);

    const summary =
      ariaLabel ?? `Gauge, ${formatNumber(value)} of ${formatNumber(max)}.`;

    return (
      <svg
        ref={ref}
        className={cn("nova-gauge-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        {...rest}
      >
        <path className="nova-gauge-chart__track" d={trackPath} />
        {fillPath && (
          <path
            className="nova-gauge-chart__fill"
            d={fillPath}
            fill={fillColor}
          />
        )}

        {showNeedle && (
          <>
            <line
              className="nova-gauge-chart__needle"
              x1={cx}
              y1={cy}
              x2={needle.x}
              y2={needle.y}
              stroke={fillColor}
            />
            <circle
              className="nova-gauge-chart__hub"
              cx={cx}
              cy={cy}
              r={thickness / 3}
              fill={fillColor}
            />
          </>
        )}

        {centerLabel != null ? (
          <foreignObject
            x={0}
            y={cy - radius / 2}
            width={width}
            height={radius / 2}
          >
            <div className="nova-gauge-chart__center">{centerLabel}</div>
          </foreignObject>
        ) : (
          showValue && (
            <text
              className="nova-gauge-chart__value"
              x={cx}
              y={cy - thickness}
              textAnchor="middle"
            >
              {formatNumber(value)}
            </text>
          )
        )}
      </svg>
    );
  }
);
