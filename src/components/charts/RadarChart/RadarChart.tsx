import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  formatNumber,
  paletteColor,
  polarToCartesian,
  toneColor,
  type ChartTone,
} from "../utils";
import "./RadarChart.css";

export interface RadarSeries {
  /** Legend / a11y label. */
  label: string;
  /** One value per axis, in the same order as `axes`. */
  values: number[];
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface RadarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Axis labels around the polygon (clockwise from top). */
  axes: string[];
  /** One or more series plotted over the axes. */
  series: RadarSeries[];
  /** SVG size (square) in user units. Default `260`. */
  size?: number;
  /** Max value mapped to the outer ring; defaults to the largest value. */
  max?: number;
  /** Number of concentric grid rings. Default `4`. */
  rings?: number;
  /** Fill opacity for series polygons (0–1). Default `0.2`. */
  fillOpacity?: number;
  /** Show axis labels. Default `true`. */
  showAxisLabels?: boolean;
  /** Show a legend below the chart. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * RadarChart — spider/radar polygons over a set of shared axes.
 *
 * Each series becomes a filled polygon (with translucent fill + solid stroke);
 * concentric grid rings and radial spokes provide scale. Pure trig, SSR-safe.
 */
export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  function RadarChart(
    {
      axes,
      series,
      size = 260,
      max,
      rings = 4,
      fillOpacity = 0.2,
      showAxisLabels = true,
      showLegend = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const cx = size / 2;
    const cy = size / 2;
    const pad = showAxisLabels ? 34 : 8;
    const radius = Math.max(1, size / 2 - pad);
    const axisCount = axes.length;

    const allValues = series.flatMap((s) => s.values);
    const computedMax = allValues.length ? Math.max(...allValues, 0) : 1;
    const safeMax = (max ?? computedMax) || 1;

    const colorFor = (s: RadarSeries, i: number) =>
      s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

    const angleFor = (i: number) =>
      axisCount > 0 ? (i / axisCount) * 360 : 0;

    const pointFor = (axisIndex: number, value: number) => {
      const r = (Math.max(0, value) / safeMax) * radius;
      return polarToCartesian(cx, cy, r, angleFor(axisIndex));
    };

    const ringCount = Math.max(1, Math.floor(rings));
    const ringPolys = Array.from({ length: ringCount }, (_, k) => {
      const rr = (radius * (k + 1)) / ringCount;
      return axes
        .map((_, i) => {
          const p = polarToCartesian(cx, cy, rr, angleFor(i));
          return `${p.x},${p.y}`;
        })
        .join(" ");
    });

    const spokes = axes.map((_, i) => polarToCartesian(cx, cy, radius, angleFor(i)));

    const seriesPolys = series.map((s, si) => ({
      s,
      si,
      color: colorFor(s, si),
      points: axes
        .map((_, i) => {
          const p = pointFor(i, s.values[i] ?? 0);
          return `${p.x},${p.y}`;
        })
        .join(" "),
    }));

    const labelPts = axes.map((_, i) =>
      polarToCartesian(cx, cy, radius + 16, angleFor(i))
    );

    const summary =
      ariaLabel ??
      `Radar chart over ${axisCount} axes (${axes.join(", ")}) with ${
        series.length
      } series: ${series.map((s) => s.label).join(", ")}.`;

    const anchorFor = (x: number): "start" | "middle" | "end" => {
      if (x < cx - 1) return "end";
      if (x > cx + 1) return "start";
      return "middle";
    };

    return (
      <div ref={ref} className={cn("nova-radar-chart", className)} {...rest}>
        <svg
          className="nova-radar-chart__svg"
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={summary}
        >
          {ringPolys.map((pts, k) => (
            <polygon
              key={`ring-${k}`}
              className="nova-radar-chart__ring"
              points={pts}
            />
          ))}
          {spokes.map((p, i) => (
            <line
              key={`spoke-${i}`}
              className="nova-radar-chart__spoke"
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
            />
          ))}
          {seriesPolys.map((sp) => (
            <polygon
              key={`series-${sp.si}`}
              className="nova-radar-chart__area"
              points={sp.points}
              fill={sp.color}
              fillOpacity={Math.min(1, Math.max(0, fillOpacity))}
              stroke={sp.color}
            >
              <title>{sp.s.label}</title>
            </polygon>
          ))}
          {showAxisLabels &&
            axes.map((axis, i) => (
              <text
                key={`axis-${i}`}
                className="nova-radar-chart__axis-label"
                x={labelPts[i].x}
                y={labelPts[i].y}
                textAnchor={anchorFor(labelPts[i].x)}
                dominantBaseline="middle"
              >
                {axis}
              </text>
            ))}
        </svg>

        {showLegend && (
          <ul className="nova-radar-chart__legend">
            {series.map((s, i) => (
              <li key={`${s.label}-${i}`} className="nova-radar-chart__legend-item">
                <span
                  className="nova-radar-chart__swatch"
                  style={{ background: colorFor(s, i) }}
                  aria-hidden="true"
                />
                <span className="nova-radar-chart__legend-label">{s.label}</span>
              </li>
            ))}
          </ul>
        )}

        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Series</th>
              {axes.map((axis, i) => (
                <th key={`h-${i}`} scope="col">
                  {axis}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s, si) => (
              <tr key={`row-${si}`}>
                <th scope="row">{s.label}</th>
                {axes.map((_, i) => (
                  <td key={`c-${i}`}>{formatNumber(s.values[i] ?? 0)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
