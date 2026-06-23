import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import { buildLinePath, toneColor, type ChartTone } from "../utils";
import "./ComboChart.css";

export interface ComboDatum {
  /** Category label shown under the slot. */
  label: string;
  /** Bar value, plotted on the primary (left) axis. */
  bar: number;
  /** Line value, plotted on the secondary (right) axis. */
  line: number;
}

export interface ComboChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** Combined bar + line data, one entry per category. */
  data: ComboDatum[];
  /** Name of the bar series (legend). Default `"Bars"`. */
  barName?: string;
  /** Name of the line series (legend). Default `"Line"`. */
  lineName?: string;
  /** Tone for the bars. Default `"brand"`. */
  barTone?: ChartTone;
  /** Tone for the line. Default `"warning"`. */
  lineTone?: ChartTone;
  /** Intrinsic width (viewBox). Default `480`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `280`. */
  height?: number;
  /** Corner radius of bars in user units. Default `4`. */
  barRadius?: number;
  /** Gap between bars as a fraction of slot width (0–0.9). Default `0.4`. */
  gap?: number;
  /** Smooth the overlay line. Default `false`. */
  smooth?: boolean;
  /** Draw a dot at each line point. Default `true`. */
  showPoints?: boolean;
  /** Horizontal grid divisions. Default `4`. */
  gridLines?: number;
  /** Force a max for the bar (primary) axis. */
  maxBar?: number;
  /** Force a max for the line (secondary) axis. */
  maxLine?: number;
  /** Show category labels under each slot. Default `true`. */
  showLabels?: boolean;
  /** Render a legend below the plot. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * ComboChart — bars (primary axis) with a line overlay (secondary axis) on a
 * shared category axis. Pure SVG, two independent y-scales, responsive via
 * `viewBox`. Useful for e.g. revenue bars + margin% line.
 */
export const ComboChart = forwardRef<SVGSVGElement, ComboChartProps>(
  function ComboChart(
    {
      data,
      barName = "Bars",
      lineName = "Line",
      barTone = "brand",
      lineTone = "warning",
      width = 480,
      height = 280,
      barRadius = 4,
      gap = 0.4,
      smooth = false,
      showPoints = true,
      gridLines = 4,
      maxBar,
      maxLine,
      showLabels = true,
      showLegend = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const gid = useId();
    const padX = 12;
    const padTop = 12;
    const legendH = showLegend ? 24 : 0;
    const padBottom = (showLabels ? 22 : 8) + legendH;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom);

    const barColor = toneColor(barTone, "var(--nova-primary)");
    const lineColor = toneColor(lineTone, "var(--nova-warning)");

    const barMax =
      maxBar ?? (data.length ? Math.max(...data.map((d) => d.bar), 0) : 1);
    const safeBarMax = barMax || 1;
    const lineMax =
      maxLine ?? (data.length ? Math.max(...data.map((d) => d.line), 0) : 1);
    const safeLineMax = lineMax || 1;

    const slot = data.length ? plotW / data.length : plotW;
    const clampedGap = Math.min(0.9, Math.max(0, gap));
    const barW = slot * (1 - clampedGap);

    const baseY = padTop + plotH;
    const linePts = data.map((d, i) => ({
      x: padX + i * slot + slot / 2,
      y: baseY - (Math.max(0, d.line) / safeLineMax) * plotH,
    }));
    const linePath = buildLinePath(linePts, smooth);

    const summary =
      ariaLabel ??
      `Combination chart. ${barName} (bars) and ${lineName} (line) across ` +
        `${data.length} categories: ` +
        data
          .map((d) => `${d.label} ${d.bar} / ${d.line}`)
          .join(", ");

    return (
      <svg
        ref={ref}
        className={cn("nova-combo-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = padTop + (i / gridLines) * plotH;
          return (
            <line
              key={`grid-${i}`}
              className="nova-combo-chart__grid"
              x1={padX}
              y1={y}
              x2={padX + plotW}
              y2={y}
            />
          );
        })}

        {data.map((d, i) => {
          const h = (Math.max(0, d.bar) / safeBarMax) * plotH;
          const x = padX + i * slot + (slot - barW) / 2;
          const y = baseY - h;
          const cx = padX + i * slot + slot / 2;
          return (
            <g key={`${d.label}-${i}`} className="nova-combo-chart__group">
              <rect
                className="nova-combo-chart__bar"
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx={Math.min(barRadius, barW / 2)}
                fill={barColor}
              >
                <title>{`${d.label} — ${barName}: ${d.bar}`}</title>
              </rect>
              {showLabels && (
                <text
                  className="nova-combo-chart__label"
                  x={cx}
                  y={baseY + 15}
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        <line
          className="nova-combo-chart__baseline"
          x1={padX}
          y1={baseY}
          x2={padX + plotW}
          y2={baseY}
        />

        <g style={{ color: lineColor }}>
          <path
            className="nova-combo-chart__line"
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {showPoints &&
            linePts.map((p, i) => (
              <circle
                key={`pt-${i}`}
                className="nova-combo-chart__point"
                cx={p.x}
                cy={p.y}
                r={3}
                fill="currentColor"
              >
                <title>{`${data[i].label} — ${lineName}: ${data[i].line}`}</title>
              </circle>
            ))}
        </g>

        {showLegend && (
          <g className="nova-combo-chart__legend">
            <g style={{ color: barColor }}>
              <rect
                x={padX}
                y={height - legendH / 2 - 5}
                width={10}
                height={10}
                rx={2}
                fill="currentColor"
              />
              <text
                className="nova-combo-chart__legend-text"
                x={padX + 15}
                y={height - legendH / 2 + 4}
              >
                {barName}
              </text>
            </g>
            <g style={{ color: lineColor }}>
              <rect
                x={padX + plotW / 2}
                y={height - legendH / 2 - 5}
                width={10}
                height={10}
                rx={2}
                fill="currentColor"
              />
              <text
                className="nova-combo-chart__legend-text"
                x={padX + plotW / 2 + 15}
                y={height - legendH / 2 + 4}
              >
                {lineName}
              </text>
            </g>
          </g>
        )}

        <desc id={`${gid}-desc`}>{summary}</desc>
      </svg>
    );
  }
);
