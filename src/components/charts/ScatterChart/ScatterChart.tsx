import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  formatNumber,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./ScatterChart.css";

export interface ScatterPoint {
  x: number;
  y: number;
  /** Optional bubble size (radius in user units); overrides series `pointRadius`. */
  r?: number;
  /** Optional per-point label for the tooltip. */
  label?: string;
}

export interface ScatterSeries {
  /** Legend / a11y label. */
  label: string;
  /** Points in this series. */
  points: ScatterPoint[];
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
  /** Default radius for points without their own `r`. Default `4`. */
  pointRadius?: number;
}

export interface ScatterChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** One or more series of points. */
  series: ScatterSeries[];
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `260`. */
  height?: number;
  /** Number of axis ticks per axis. Default `4`. */
  ticks?: number;
  /** Force the X domain `[min, max]`; defaults to data extent. */
  xDomain?: [number, number];
  /** Force the Y domain `[min, max]`; defaults to data extent. */
  yDomain?: [number, number];
  /** Show gridlines. Default `true`. */
  showGrid?: boolean;
  /** Show a legend below the chart. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

const niceExtent = (
  values: number[],
  forced?: [number, number]
): [number, number] => {
  if (forced) return forced;
  if (values.length === 0) return [0, 1];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    // Pad a flat domain so points aren't on the edge.
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  return [min, max];
};

/**
 * ScatterChart — points plotted on linear X/Y axes with ticks and optional
 * bubble sizing via per-point `r`. Multiple series are colored from the palette.
 */
export const ScatterChart = forwardRef<HTMLDivElement, ScatterChartProps>(
  function ScatterChart(
    {
      series,
      width = 360,
      height = 260,
      ticks = 4,
      xDomain,
      yDomain,
      showGrid = true,
      showLegend = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const padLeft = 36;
    const padBottom = 26;
    const padTop = 10;
    const padRight = 12;
    const plotW = Math.max(1, width - padLeft - padRight);
    const plotH = Math.max(1, height - padTop - padBottom);

    const allX = series.flatMap((s) => s.points.map((p) => p.x));
    const allY = series.flatMap((s) => s.points.map((p) => p.y));
    const [xMin, xMax] = niceExtent(allX, xDomain);
    const [yMin, yMax] = niceExtent(allY, yDomain);
    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;

    const sx = (x: number) => padLeft + ((x - xMin) / xSpan) * plotW;
    const sy = (y: number) => padTop + plotH - ((y - yMin) / ySpan) * plotH;

    const colorFor = (s: ScatterSeries, i: number) =>
      s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

    const tickCount = Math.max(1, Math.floor(ticks));
    const xTicks = Array.from(
      { length: tickCount + 1 },
      (_, i) => xMin + (xSpan * i) / tickCount
    );
    const yTicks = Array.from(
      { length: tickCount + 1 },
      (_, i) => yMin + (ySpan * i) / tickCount
    );

    const totalPoints = series.reduce((n, s) => n + s.points.length, 0);
    const summary =
      ariaLabel ??
      `Scatter chart with ${series.length} series and ${totalPoints} points. ` +
        `X from ${formatNumber(xMin)} to ${formatNumber(xMax)}, ` +
        `Y from ${formatNumber(yMin)} to ${formatNumber(yMax)}.`;

    return (
      <div ref={ref} className={cn("nova-scatter-chart", className)} {...rest}>
        <svg
          className="nova-scatter-chart__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={summary}
        >
          {showGrid &&
            yTicks.map((t, i) => (
              <line
                key={`gy-${i}`}
                className="nova-scatter-chart__grid"
                x1={padLeft}
                y1={sy(t)}
                x2={padLeft + plotW}
                y2={sy(t)}
              />
            ))}
          {showGrid &&
            xTicks.map((t, i) => (
              <line
                key={`gx-${i}`}
                className="nova-scatter-chart__grid"
                x1={sx(t)}
                y1={padTop}
                x2={sx(t)}
                y2={padTop + plotH}
              />
            ))}

          {/* Axes */}
          <line
            className="nova-scatter-chart__axis"
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
          />
          <line
            className="nova-scatter-chart__axis"
            x1={padLeft}
            y1={padTop + plotH}
            x2={padLeft + plotW}
            y2={padTop + plotH}
          />

          {yTicks.map((t, i) => (
            <text
              key={`yt-${i}`}
              className="nova-scatter-chart__tick"
              x={padLeft - 6}
              y={sy(t)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatNumber(t)}
            </text>
          ))}
          {xTicks.map((t, i) => (
            <text
              key={`xt-${i}`}
              className="nova-scatter-chart__tick"
              x={sx(t)}
              y={padTop + plotH + 16}
              textAnchor="middle"
            >
              {formatNumber(t)}
            </text>
          ))}

          {series.map((s, si) => {
            const color = colorFor(s, si);
            const baseR = s.pointRadius ?? 4;
            return (
              <g key={`s-${si}`} className="nova-scatter-chart__series">
                {s.points.map((p, pi) => (
                  <circle
                    key={`p-${si}-${pi}`}
                    className="nova-scatter-chart__point"
                    cx={sx(p.x)}
                    cy={sy(p.y)}
                    r={Math.max(0.5, p.r ?? baseR)}
                    fill={color}
                  >
                    <title>
                      {`${p.label ? p.label + " · " : ""}${s.label}: (${formatNumber(
                        p.x
                      )}, ${formatNumber(p.y)})`}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {showLegend && (
          <ul className="nova-scatter-chart__legend">
            {series.map((s, i) => (
              <li
                key={`${s.label}-${i}`}
                className="nova-scatter-chart__legend-item"
              >
                <span
                  className="nova-scatter-chart__swatch"
                  style={{ background: colorFor(s, i) }}
                  aria-hidden="true"
                />
                <span className="nova-scatter-chart__legend-label">
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Series</th>
              <th scope="col">X</th>
              <th scope="col">Y</th>
            </tr>
          </thead>
          <tbody>
            {series.flatMap((s, si) =>
              s.points.map((p, pi) => (
                <tr key={`r-${si}-${pi}`}>
                  <th scope="row">{s.label}</th>
                  <td>{p.x}</td>
                  <td>{p.y}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);
