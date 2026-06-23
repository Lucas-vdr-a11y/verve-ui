import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { formatNumber, toneColor, type ChartTone } from "../utils";
import "./BarChart.css";

export interface BarDatum {
  /** Category label shown under the bar. */
  label: string;
  /** Bar value (>= 0 recommended). */
  value: number;
  /** Optional per-bar tone override. */
  tone?: ChartTone;
}

export interface BarChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** Bars to render. */
  data: BarDatum[];
  /** Default tone for bars without their own. Default `"brand"`. */
  tone?: ChartTone;
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `220`. */
  height?: number;
  /** Corner radius of bars in user units. Default `4`. */
  barRadius?: number;
  /** Gap between bars as a fraction of slot width (0–0.9). Default `0.35`. */
  gap?: number;
  /** Show category labels under each bar. Default `true`. */
  showLabels?: boolean;
  /** Show value labels above each bar. Default `false`. */
  showValues?: boolean;
  /** Force a max for the value axis; defaults to the largest datum. */
  maxValue?: number;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * BarChart — vertical bars sized to the max value, responsive via `viewBox`.
 *
 * Tokens-only theming; hover highlight handled in CSS. Bars cycle their
 * own tone or fall back to the chart `tone`.
 */
export const BarChart = forwardRef<SVGSVGElement, BarChartProps>(
  function BarChart(
    {
      data,
      tone = "brand",
      width = 360,
      height = 220,
      barRadius = 4,
      gap = 0.35,
      showLabels = true,
      showValues = false,
      maxValue,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const padX = 8;
    const padTop = showValues ? 18 : 8;
    const padBottom = showLabels ? 22 : 8;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom);

    const max =
      maxValue ?? (data.length ? Math.max(...data.map((d) => d.value), 0) : 1);
    const safeMax = max || 1;

    const slot = data.length ? plotW / data.length : plotW;
    const clampedGap = Math.min(0.9, Math.max(0, gap));
    const barW = slot * (1 - clampedGap);

    const summary =
      ariaLabel ??
      `Bar chart with ${data.length} bars. ` +
        data.map((d) => `${d.label}: ${d.value}`).join(", ");

    return (
      <svg
        ref={ref}
        className={cn("nova-bar-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        {/* Baseline */}
        <line
          className="nova-bar-chart__baseline"
          x1={padX}
          y1={padTop + plotH}
          x2={padX + plotW}
          y2={padTop + plotH}
        />
        {data.map((d, i) => {
          const h = (Math.max(0, d.value) / safeMax) * plotH;
          const x = padX + i * slot + (slot - barW) / 2;
          const y = padTop + plotH - h;
          const color = toneColor(d.tone ?? tone, "var(--nova-primary)");
          const cx = x + barW / 2;
          return (
            <g
              key={`${d.label}-${i}`}
              className="nova-bar-chart__group"
            >
              <rect
                className="nova-bar-chart__bar"
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx={Math.min(barRadius, barW / 2)}
                fill={color}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              {showValues && (
                <text
                  className="nova-bar-chart__value"
                  x={cx}
                  y={y - 5}
                  textAnchor="middle"
                >
                  {formatNumber(d.value)}
                </text>
              )}
              {showLabels && (
                <text
                  className="nova-bar-chart__label"
                  x={cx}
                  y={padTop + plotH + 15}
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }
);
