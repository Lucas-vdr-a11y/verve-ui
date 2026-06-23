import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { clamp, formatNumber, TONE_VAR, type ChartTone } from "../utils";
import "./Heatmap.css";

export interface HeatmapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 2D matrix of values: `matrix[row][col]`. */
  matrix: number[][];
  /** Column (x-axis) labels. */
  xLabels?: string[];
  /** Row (y-axis) labels. */
  yLabels?: string[];
  /** Tone driving the color ramp. Default `"brand"`. */
  tone?: ChartTone;
  /** Force the value domain `[min, max]`; defaults to the matrix extent. */
  domain?: [number, number];
  /** Cell size in user units. Default `36`. */
  cellSize?: number;
  /** Gap between cells in user units. Default `3`. */
  cellGap?: number;
  /** Corner radius of cells in user units. Default `4`. */
  cellRadius?: number;
  /** Show the numeric value inside each cell. Default `false`. */
  showValues?: boolean;
  /** Show a min→max legend scale. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/** color-mix the tone over the surface by intensity (0–1). */
const cellColor = (toneVar: string, intensity: number): string => {
  const pct = Math.round(clamp(intensity, 0, 1) * 100);
  return `color-mix(in srgb, ${toneVar} ${pct}%, var(--nova-bg-muted))`;
};

/**
 * Heatmap — grid of cells colored by intensity over a single tone token.
 *
 * Intensity is `(value - min) / (max - min)`, rendered via `color-mix` from the
 * surface to the tone. Optional x/y axis labels, per-cell `<title>` tooltips,
 * in-cell values, and a min→max legend scale.
 */
export const Heatmap = forwardRef<HTMLDivElement, HeatmapProps>(function Heatmap(
  {
    matrix,
    xLabels,
    yLabels,
    tone = "brand",
    domain,
    cellSize = 36,
    cellGap = 3,
    cellRadius = 4,
    showValues = false,
    showLegend = true,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const rows = matrix.length;
  const cols = matrix.reduce((m, r) => Math.max(m, r.length), 0);
  const toneVar = TONE_VAR[tone];

  const flat = matrix.flat().filter((v) => Number.isFinite(v));
  const dataMin = flat.length ? Math.min(...flat) : 0;
  const dataMax = flat.length ? Math.max(...flat) : 1;
  const [min, max] = domain ?? [dataMin, dataMax];
  const span = max - min || 1;

  const yPad = yLabels && yLabels.length ? 64 : 0;
  const xPad = xLabels && xLabels.length ? 20 : 0;
  const step = cellSize + cellGap;
  const gridW = cols * step - cellGap;
  const gridH = rows * step - cellGap;
  const width = yPad + Math.max(0, gridW);
  const height = xPad + Math.max(0, gridH);

  const intensityFor = (v: number) => clamp((v - min) / span, 0, 1);

  const summary =
    ariaLabel ??
    `Heatmap with ${rows} rows and ${cols} columns. ` +
      `Values from ${formatNumber(dataMin)} to ${formatNumber(dataMax)}.`;

  const xName = (c: number) => xLabels?.[c] ?? `Col ${c + 1}`;
  const yName = (r: number) => yLabels?.[r] ?? `Row ${r + 1}`;

  return (
    <div ref={ref} className={cn("nova-heatmap", className)} {...rest}>
      <svg
        className="nova-heatmap__svg"
        viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label={summary}
      >
        {yLabels &&
          yLabels.slice(0, rows).map((label, r) => (
            <text
              key={`y-${r}`}
              className="nova-heatmap__y-label"
              x={yPad - 8}
              y={xPad + r * step + cellSize / 2}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}

        {xLabels &&
          xLabels.slice(0, cols).map((label, c) => (
            <text
              key={`x-${c}`}
              className="nova-heatmap__x-label"
              x={yPad + c * step + cellSize / 2}
              y={xPad - 7}
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

        {matrix.map((row, r) =>
          row.map((value, c) => {
            const x = yPad + c * step;
            const y = xPad + r * step;
            const finite = Number.isFinite(value);
            return (
              <g key={`cell-${r}-${c}`} className="nova-heatmap__cell">
                <rect
                  className="nova-heatmap__rect"
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={cellRadius}
                  fill={
                    finite
                      ? cellColor(toneVar, intensityFor(value))
                      : "var(--nova-bg-muted)"
                  }
                >
                  <title>{`${yName(r)} · ${xName(c)}: ${
                    finite ? formatNumber(value) : "—"
                  }`}</title>
                </rect>
                {showValues && finite && (
                  <text
                    className="nova-heatmap__value"
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {formatNumber(value)}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {showLegend && (
        <div className="nova-heatmap__legend" aria-hidden="true">
          <span className="nova-heatmap__legend-min">{formatNumber(min)}</span>
          <span
            className="nova-heatmap__legend-scale"
            style={{
              background: `linear-gradient(to right, ${cellColor(
                toneVar,
                0
              )}, ${cellColor(toneVar, 1)})`,
            }}
          />
          <span className="nova-heatmap__legend-max">{formatNumber(max)}</span>
        </div>
      )}

      <table className="nova-visually-hidden">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col"></th>
            {Array.from({ length: cols }, (_, c) => (
              <th key={`h-${c}`} scope="col">
                {xName(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={`r-${r}`}>
              <th scope="row">{yName(r)}</th>
              {Array.from({ length: cols }, (_, c) => (
                <td key={`c-${c}`}>
                  {Number.isFinite(row[c]) ? row[c] : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
