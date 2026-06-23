import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import {
  arcPath,
  clamp,
  formatNumber,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./RadialBarChart.css";

export interface RadialBarItem {
  /** Item label (legend + a11y table). */
  label: string;
  /** Current value. */
  value: number;
  /** Optional per-item max; otherwise the chart `max` is used. */
  max?: number;
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface RadialBarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Items, one concentric ring each (outermost first). */
  items: RadialBarItem[];
  /** Default max used when an item has no own `max`. Default `100`. */
  max?: number;
  /** SVG size (square) in user units. Default `220`. */
  size?: number;
  /** Ring thickness in user units. Default `14`. */
  ringWidth?: number;
  /** Gap between rings in user units. Default `6`. */
  ringGap?: number;
  /** Sweep angle in degrees (e.g. 270 for a gauge-like gap). Default `360`. */
  sweep?: number;
  /** Start angle in degrees (0 = 12 o'clock). Default `0`. */
  startAngle?: number;
  /** Content rendered in the center. */
  centerLabel?: ReactNode;
  /** Show a legend beside/below the chart. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * RadialBarChart — concentric radial bars, one ring per item, each filled to
 * `value / max` along the sweep. Pure SVG arc math; supports partial sweeps for
 * a gauge-like layout and a center label.
 */
export const RadialBarChart = forwardRef<HTMLDivElement, RadialBarChartProps>(
  function RadialBarChart(
    {
      items,
      max = 100,
      size = 220,
      ringWidth = 14,
      ringGap = 6,
      sweep = 360,
      startAngle = 0,
      centerLabel,
      showLegend = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const cx = size / 2;
    const cy = size / 2;
    const safeSweep = clamp(sweep, 1, 360);
    const isFull = safeSweep >= 360;

    const colorFor = (item: RadialBarItem, i: number) =>
      item.color ??
      (item.tone ? toneColor(item.tone, paletteColor(i)) : paletteColor(i));

    const outerStart = size / 2 - 1;
    const rings = items.map((item, i) => {
      const outer = outerStart - i * (ringWidth + ringGap);
      const inner = outer - ringWidth;
      const itemMax = item.max ?? max;
      const frac = itemMax > 0 ? clamp(item.value / itemMax, 0, 1) : 0;
      const end = startAngle + safeSweep * frac;
      // Track (full sweep) — for full circle avoid an exact 360 closed ring seam.
      const trackEnd = startAngle + (isFull ? 359.999 : safeSweep);
      return {
        item,
        i,
        outer: Math.max(0, outer),
        inner: Math.max(0, inner),
        frac,
        valuePath:
          frac > 0 && outer > 0 && inner > 0
            ? arcPath(cx, cy, outer, inner, startAngle, end)
            : "",
        trackPath:
          outer > 0 && inner > 0
            ? arcPath(cx, cy, outer, inner, startAngle, trackEnd)
            : "",
        color: colorFor(item, i),
        pct: Math.round(frac * 100),
      };
    });

    const summary =
      ariaLabel ??
      `Radial bar chart with ${items.length} rings. ` +
        rings
          .map((r) => `${r.item.label}: ${formatNumber(r.item.value)} (${r.pct}%)`)
          .join(", ");

    return (
      <div
        ref={ref}
        className={cn("nova-radial-bar-chart", className)}
        {...rest}
      >
        <div className="nova-radial-bar-chart__figure">
          <svg
            className="nova-radial-bar-chart__svg"
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={summary}
          >
            {rings.map((r) => (
              <g key={`${r.item.label}-${r.i}`}>
                {r.trackPath && (
                  <path
                    className="nova-radial-bar-chart__track"
                    d={r.trackPath}
                  />
                )}
                {r.valuePath && (
                  <path
                    className="nova-radial-bar-chart__bar"
                    d={r.valuePath}
                    fill={r.color}
                  >
                    <title>{`${r.item.label}: ${formatNumber(
                      r.item.value
                    )} (${r.pct}%)`}</title>
                  </path>
                )}
              </g>
            ))}
          </svg>
          {centerLabel != null && (
            <div
              className="nova-radial-bar-chart__center"
              aria-hidden="true"
            >
              {centerLabel}
            </div>
          )}
        </div>

        {showLegend && (
          <ul className="nova-radial-bar-chart__legend">
            {rings.map((r) => (
              <li
                key={`${r.item.label}-${r.i}`}
                className="nova-radial-bar-chart__legend-item"
              >
                <span
                  className="nova-radial-bar-chart__swatch"
                  style={{ background: r.color }}
                  aria-hidden="true"
                />
                <span className="nova-radial-bar-chart__legend-label">
                  {r.item.label}
                </span>
                <span className="nova-radial-bar-chart__legend-value">
                  {r.pct}%
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
              <th scope="col">Max</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={`row-${i}`}>
                <th scope="row">{item.label}</th>
                <td>{item.value}</td>
                <td>{item.max ?? max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
