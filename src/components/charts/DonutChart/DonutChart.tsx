import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import {
  arcPath,
  formatNumber,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./DonutChart.css";

export interface DonutSegment {
  /** Segment label (legend + a11y table). */
  label: string;
  /** Segment value (>= 0). */
  value: number;
  /** Optional tone; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface DonutChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Segments to render. */
  segments: DonutSegment[];
  /** SVG size (square) in user units. Default `200`. */
  size?: number;
  /**
   * Ring thickness as a fraction of the radius (0–1). `1` collapses the hole
   * into a full pie. Default `0.4`.
   */
  thickness?: number;
  /** Gap between segments in degrees. Default `0`. */
  padAngle?: number;
  /** Content rendered in the donut center (ignored when a full pie). */
  centerLabel?: ReactNode;
  /** Show a legend beside/below the chart. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * DonutChart — donut or pie chart computed from segment values.
 *
 * Pure SVG arc math; configurable `thickness` switches between donut and pie.
 * Accessible: the SVG is `role="img"` with a summary label, and a
 * visually-hidden data table mirrors the values for assistive tech.
 */
export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  function DonutChart(
    {
      segments,
      size = 200,
      thickness = 0.4,
      padAngle = 0,
      centerLabel,
      showLegend = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const cx = size / 2;
    const cy = size / 2;
    const outer = size / 2 - 1;
    const t = Math.min(1, Math.max(0, thickness));
    const inner = outer * (1 - t);

    const colorFor = (s: DonutSegment, i: number) =>
      s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

    let cursor = 0;
    const arcs = segments.map((s, i) => {
      const frac = total > 0 ? Math.max(0, s.value) / total : 0;
      const start = cursor * 360 + padAngle / 2;
      const end = (cursor + frac) * 360 - padAngle / 2;
      cursor += frac;
      const d =
        end > start ? arcPath(cx, cy, outer, inner, start, end) : "";
      return { d, color: colorFor(s, i), segment: s, frac };
    });

    const summary =
      ariaLabel ??
      `Donut chart, total ${formatNumber(total)}. ` +
        segments
          .map(
            (s) =>
              `${s.label}: ${formatNumber(s.value)} (${
                total > 0 ? Math.round((s.value / total) * 100) : 0
              }%)`
          )
          .join(", ");

    return (
      <div
        ref={ref}
        className={cn("nova-donut-chart", className)}
        {...rest}
      >
        <div className="nova-donut-chart__figure">
          <svg
            className="nova-donut-chart__svg"
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={summary}
          >
            {arcs.map(
              (a, i) =>
                a.d && (
                  <path
                    key={i}
                    className="nova-donut-chart__arc"
                    d={a.d}
                    fill={a.color}
                  >
                    <title>{`${a.segment.label}: ${formatNumber(
                      a.segment.value
                    )}`}</title>
                  </path>
                )
            )}
          </svg>
          {centerLabel != null && inner > 0 && (
            <div className="nova-donut-chart__center" aria-hidden="true">
              {centerLabel}
            </div>
          )}
        </div>

        {showLegend && (
          <ul className="nova-donut-chart__legend">
            {segments.map((s, i) => (
              <li key={`${s.label}-${i}`} className="nova-donut-chart__legend-item">
                <span
                  className="nova-donut-chart__swatch"
                  style={{ background: colorFor(s, i) }}
                  aria-hidden="true"
                />
                <span className="nova-donut-chart__legend-label">{s.label}</span>
                <span className="nova-donut-chart__legend-value">
                  {formatNumber(s.value)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Visually-hidden data table for assistive tech. */}
        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s, i) => (
              <tr key={`row-${i}`}>
                <th scope="row">{s.label}</th>
                <td>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
