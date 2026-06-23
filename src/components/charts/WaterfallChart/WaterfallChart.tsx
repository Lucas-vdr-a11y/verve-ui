import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { formatNumber, toneColor, type ChartTone } from "../utils";
import "./WaterfallChart.css";

export interface WaterfallStep {
  /** Category label shown under the bar. */
  label: string;
  /**
   * Step value. For a delta step this is added to the running total; positive
   * rises, negative falls. For a `total` step it is the absolute level the
   * running total is reset/anchored to.
   */
  value: number;
  /**
   * When `true`, this step is an absolute total/subtotal anchored from the
   * baseline (e.g. start or end). Default `false` (a delta).
   */
  total?: boolean;
}

export interface WaterfallChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** Ordered steps forming the waterfall. */
  data: WaterfallStep[];
  /** Tone for positive deltas. Default `"success"`. */
  riseTone?: ChartTone;
  /** Tone for negative deltas. Default `"danger"`. */
  fallTone?: ChartTone;
  /** Tone for total/subtotal bars. Default `"brand"`. */
  totalTone?: ChartTone;
  /** Intrinsic width (viewBox). Default `480`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `280`. */
  height?: number;
  /** Corner radius of bars in user units. Default `3`. */
  barRadius?: number;
  /** Gap between bars as a fraction of slot width (0–0.9). Default `0.4`. */
  gap?: number;
  /** Draw connector lines between consecutive steps. Default `true`. */
  connectors?: boolean;
  /** Show category labels under each bar. Default `true`. */
  showLabels?: boolean;
  /** Show value labels on each bar. Default `false`. */
  showValues?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

interface ResolvedStep {
  step: WaterfallStep;
  start: number;
  end: number;
  delta: number;
  isTotal: boolean;
}

/**
 * WaterfallChart — running-total waterfall. Delta steps float between the
 * previous and new running total (success for rises, danger for falls); total
 * steps anchor from the baseline. Optional connectors link consecutive bars.
 */
export const WaterfallChart = forwardRef<SVGSVGElement, WaterfallChartProps>(
  function WaterfallChart(
    {
      data,
      riseTone = "success",
      fallTone = "danger",
      totalTone = "brand",
      width = 480,
      height = 280,
      barRadius = 3,
      gap = 0.4,
      connectors = true,
      showLabels = true,
      showValues = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    // Resolve each step's [start, end] running-total bounds.
    let running = 0;
    const resolved: ResolvedStep[] = data.map((step) => {
      if (step.total) {
        const r: ResolvedStep = {
          step,
          start: 0,
          end: step.value,
          delta: step.value - running,
          isTotal: true,
        };
        running = step.value;
        return r;
      }
      const start = running;
      const end = running + step.value;
      running = end;
      return { step, start, end, delta: step.value, isTotal: false };
    });

    const padX = 12;
    const padTop = showValues ? 22 : 12;
    const padBottom = showLabels ? 24 : 12;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom);

    const lows = resolved.map((r) => Math.min(r.start, r.end));
    const highs = resolved.map((r) => Math.max(r.start, r.end));
    const dataMin = Math.min(0, ...lows);
    const dataMax = Math.max(0, ...highs);
    const span = dataMax - dataMin || 1;

    const sy = (v: number) => padTop + plotH - ((v - dataMin) / span) * plotH;
    const zeroY = sy(0);

    const slot = resolved.length ? plotW / resolved.length : plotW;
    const clampedGap = Math.min(0.9, Math.max(0, gap));
    const barW = slot * (1 - clampedGap);

    const riseColor = toneColor(riseTone, "var(--nova-success)");
    const fallColor = toneColor(fallTone, "var(--nova-danger)");
    const totalColor = toneColor(totalTone, "var(--nova-primary)");

    const summary =
      ariaLabel ??
      `Waterfall chart with ${data.length} steps. ` +
        resolved
          .map(
            (r) =>
              `${r.step.label}: ${r.isTotal ? "total " : ""}${formatNumber(
                r.isTotal ? r.end : r.delta
              )}`
          )
          .join(", ");

    return (
      <svg
        ref={ref}
        className={cn("nova-waterfall-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        <line
          className="nova-waterfall-chart__baseline"
          x1={padX}
          y1={zeroY}
          x2={padX + plotW}
          y2={zeroY}
        />

        {resolved.map((r, i) => {
          const x = padX + i * slot + (slot - barW) / 2;
          const top = Math.min(sy(r.start), sy(r.end));
          const h = Math.abs(sy(r.start) - sy(r.end));
          const cx = padX + i * slot + slot / 2;
          const color = r.isTotal
            ? totalColor
            : r.delta >= 0
            ? riseColor
            : fallColor;
          const displayVal = r.isTotal ? r.end : r.delta;
          const valueY = top - 6;
          return (
            <g key={`${r.step.label}-${i}`} className="nova-waterfall-chart__group">
              {connectors && i < resolved.length - 1 && (
                <line
                  className="nova-waterfall-chart__connector"
                  x1={x + barW}
                  y1={sy(r.end)}
                  x2={padX + (i + 1) * slot + (slot - barW) / 2}
                  y2={sy(r.end)}
                />
              )}
              <rect
                className="nova-waterfall-chart__bar"
                x={x}
                y={top}
                width={barW}
                height={Math.max(1, h)}
                rx={Math.min(barRadius, barW / 2)}
                fill={color}
              >
                <title>{`${r.step.label}: ${
                  r.isTotal ? formatNumber(r.end) : (r.delta >= 0 ? "+" : "") + formatNumber(r.delta)
                }`}</title>
              </rect>
              {showValues && (
                <text
                  className="nova-waterfall-chart__value"
                  x={cx}
                  y={valueY}
                  textAnchor="middle"
                >
                  {(displayVal >= 0 && !r.isTotal ? "+" : "") +
                    formatNumber(displayVal)}
                </text>
              )}
              {showLabels && (
                <text
                  className="nova-waterfall-chart__label"
                  x={cx}
                  y={padTop + plotH + 16}
                  textAnchor="middle"
                >
                  {r.step.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }
);
