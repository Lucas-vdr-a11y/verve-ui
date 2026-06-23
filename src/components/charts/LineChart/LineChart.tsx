import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import { buildLinePath, paletteColor } from "../utils";
import "./LineChart.css";

export interface LinePoint {
  x: number;
  y: number;
}

export interface LineSeries {
  /** Series name shown in the legend. */
  name: string;
  /** Data as {x,y} pairs or a bare number[] (index used as x). */
  data: LinePoint[] | number[];
  /** Optional explicit color (any CSS color / token). Overrides palette. */
  color?: string;
}

export interface LineChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** One or more series. */
  series: LineSeries[];
  /** Intrinsic width (viewBox). Default `480`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `260`. */
  height?: number;
  /** Smooth lines with a Catmull-Rom spline. */
  smooth?: boolean;
  /** Draw a dot at each data point. */
  showPoints?: boolean;
  /** Draw horizontal grid lines. Default `true`. */
  showGrid?: boolean;
  /** Number of horizontal grid divisions. Default `4`. */
  gridLines?: number;
  /** Fill the area under each line (turns this into an area chart). */
  area?: boolean;
  /** Render a legend below the plot. Default `true` when multi-series. */
  showLegend?: boolean;
  /** Stroke width in user units. Default `2`. */
  strokeWidth?: number;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/** Normalize a series' data into {x,y} points. */
function normalize(data: LinePoint[] | number[]): LinePoint[] {
  if (data.length === 0) return [];
  if (typeof data[0] === "number") {
    return (data as number[]).map((y, x) => ({ x, y }));
  }
  return data as LinePoint[];
}

/**
 * LineChart — single or multi-series line chart, pure SVG and responsive.
 *
 * Series cycle through the categorical token palette unless given an explicit
 * `color`. Shared rendering also powers {@link AreaChart} via the `area` prop.
 */
export const LineChart = forwardRef<SVGSVGElement, LineChartProps>(
  function LineChart(
    {
      series,
      width = 480,
      height = 260,
      smooth = false,
      showPoints = false,
      showGrid = true,
      gridLines = 4,
      area = false,
      showLegend,
      strokeWidth = 2,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const gid = useId();
    const normalized = series.map((s) => normalize(s.data));

    const legend = showLegend ?? series.length > 1;
    const padX = 10;
    const padTop = 10;
    const padBottom = 10;
    const legendH = legend ? 24 : 0;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom - legendH);

    // Compute combined data domain.
    const allPoints = normalized.flat();
    const xs = allPoints.map((p) => p.x);
    const ys = allPoints.map((p) => p.y);
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 1;
    const minY = ys.length ? Math.min(...ys, 0) : 0;
    const maxY = ys.length ? Math.max(...ys) : 1;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;

    const sx = (x: number) => padX + ((x - minX) / spanX) * plotW;
    const sy = (y: number) =>
      padTop + plotH - ((y - minY) / spanY) * plotH;

    const colorFor = (i: number) => series[i].color ?? paletteColor(i);

    const summary =
      ariaLabel ??
      `Line chart with ${series.length} series: ${series
        .map((s) => s.name)
        .join(", ")}.`;

    return (
      <svg
        ref={ref}
        className={cn("nova-line-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        {showGrid &&
          Array.from({ length: gridLines + 1 }, (_, i) => {
            const y = padTop + (i / gridLines) * plotH;
            return (
              <line
                key={`grid-${i}`}
                className="nova-line-chart__grid"
                x1={padX}
                y1={y}
                x2={padX + plotW}
                y2={y}
              />
            );
          })}

        {normalized.map((pts, i) => {
          const scaled = pts.map((p) => ({ x: sx(p.x), y: sy(p.y) }));
          const linePath = buildLinePath(scaled, smooth);
          const color = colorFor(i);
          const baseY = padTop + plotH;
          const areaPath =
            scaled.length > 1
              ? `${linePath} L ${scaled[scaled.length - 1].x} ${baseY} L ${
                  scaled[0].x
                } ${baseY} Z`
              : "";
          return (
            <g key={`series-${i}`} style={{ color }}>
              {area && areaPath && (
                <>
                  <defs>
                    <linearGradient
                      id={`${gid}-area-${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    className="nova-line-chart__area"
                    d={areaPath}
                    fill={`url(#${gid}-area-${i})`}
                  />
                </>
              )}
              <path
                className="nova-line-chart__line"
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {showPoints &&
                scaled.map((p, j) => (
                  <circle
                    key={`pt-${i}-${j}`}
                    className="nova-line-chart__point"
                    cx={p.x}
                    cy={p.y}
                    r={strokeWidth + 1}
                    fill="currentColor"
                  />
                ))}
            </g>
          );
        })}

        {legend &&
          series.map((s, i) => {
            const itemW = plotW / series.length;
            const lx = padX + i * itemW + 4;
            const ly = height - legendH / 2;
            return (
              <g
                key={`legend-${i}`}
                className="nova-line-chart__legend-item"
                style={{ color: colorFor(i) }}
              >
                <rect
                  x={lx}
                  y={ly - 5}
                  width={10}
                  height={10}
                  rx={2}
                  fill="currentColor"
                />
                <text
                  className="nova-line-chart__legend-text"
                  x={lx + 15}
                  y={ly + 4}
                >
                  {s.name}
                </text>
              </g>
            );
          })}
      </svg>
    );
  }
);
