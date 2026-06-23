import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  arcPath,
  formatNumber,
  paletteColor,
  polarToCartesian,
  toneColor,
  type ChartTone,
} from "../utils";
import "./PieChart.css";

export interface PieSegment {
  /** Segment label (slice label, legend, a11y table). */
  label: string;
  /** Segment value (>= 0). */
  value: number;
  /** Optional tone; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface PieChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Segments to render. */
  segments: PieSegment[];
  /** SVG size (square) in user units. Default `220`. */
  size?: number;
  /** Gap between slices in degrees. Default `0`. */
  padAngle?: number;
  /**
   * Label placement. `"inside"` puts the percentage on the slice,
   * `"leader"` draws a leader line out to a label, `"none"` hides slice labels.
   * Default `"leader"`.
   */
  labels?: "inside" | "leader" | "none";
  /** Show the percentage alongside leader labels. Default `true`. */
  showPercent?: boolean;
  /** Show a legend beside/below the chart. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * PieChart — a full (no-hole) labelled pie computed from segment values.
 *
 * Pure SVG arc math. Slice labels render inside the slice or via leader lines
 * outside the pie. Accessible: `role="img"` summary plus a visually-hidden
 * data table.
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  function PieChart(
    {
      segments,
      size = 220,
      padAngle = 0,
      labels = "leader",
      showPercent = true,
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
    // Leave headroom for leader labels when used.
    const outer = labels === "leader" ? size / 2 - 34 : size / 2 - 2;

    const colorFor = (s: PieSegment, i: number) =>
      s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

    let cursor = 0;
    const arcs = segments.map((s, i) => {
      const frac = total > 0 ? Math.max(0, s.value) / total : 0;
      const start = cursor * 360 + padAngle / 2;
      const end = (cursor + frac) * 360 - padAngle / 2;
      const mid = (start + end) / 2;
      cursor += frac;
      const d = end > start ? arcPath(cx, cy, outer, 0, start, end) : "";
      return { d, color: colorFor(s, i), segment: s, frac, mid };
    });

    const pct = (frac: number) => Math.round(frac * 100);

    const summary =
      ariaLabel ??
      `Pie chart, total ${formatNumber(total)}. ` +
        arcs
          .map((a) => `${a.segment.label}: ${formatNumber(a.segment.value)} (${pct(a.frac)}%)`)
          .join(", ");

    return (
      <div ref={ref} className={cn("nova-pie-chart", className)} {...rest}>
        <div className="nova-pie-chart__figure" style={{ width: size }}>
          <svg
            className="nova-pie-chart__svg"
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={summary}
          >
            {arcs.map(
              (a, i) =>
                a.d && (
                  <path
                    key={i}
                    className="nova-pie-chart__slice"
                    d={a.d}
                    fill={a.color}
                  >
                    <title>{`${a.segment.label}: ${formatNumber(
                      a.segment.value
                    )} (${pct(a.frac)}%)`}</title>
                  </path>
                )
            )}

            {labels === "inside" &&
              arcs.map((a, i) => {
                // Hide labels for tiny slivers to avoid clutter.
                if (!a.d || a.frac < 0.05) return null;
                const p = polarToCartesian(cx, cy, outer * 0.62, a.mid);
                return (
                  <text
                    key={`lbl-${i}`}
                    className="nova-pie-chart__inside-label"
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {pct(a.frac)}%
                  </text>
                );
              })}

            {labels === "leader" &&
              arcs.map((a, i) => {
                if (!a.d || a.frac <= 0) return null;
                const start = polarToCartesian(cx, cy, outer, a.mid);
                const bend = polarToCartesian(cx, cy, outer + 12, a.mid);
                const right = bend.x >= cx;
                const endX = right ? size - 6 : 6;
                const anchor = right ? "end" : "start";
                return (
                  <g key={`leader-${i}`} className="nova-pie-chart__leader">
                    <polyline
                      className="nova-pie-chart__leader-line"
                      points={`${start.x},${start.y} ${bend.x},${bend.y} ${endX},${bend.y}`}
                      stroke={a.color}
                    />
                    <text
                      className="nova-pie-chart__leader-label"
                      x={endX}
                      y={bend.y - 2}
                      textAnchor={anchor}
                    >
                      {a.segment.label}
                      {showPercent ? ` ${pct(a.frac)}%` : ""}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {showLegend && (
          <ul className="nova-pie-chart__legend">
            {arcs.map((a, i) => (
              <li
                key={`${a.segment.label}-${i}`}
                className="nova-pie-chart__legend-item"
              >
                <span
                  className="nova-pie-chart__swatch"
                  style={{ background: a.color }}
                  aria-hidden="true"
                />
                <span className="nova-pie-chart__legend-label">
                  {a.segment.label}
                </span>
                <span className="nova-pie-chart__legend-value">
                  {pct(a.frac)}%
                </span>
              </li>
            ))}
          </ul>
        )}

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
