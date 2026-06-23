import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { formatNumber, paletteColor, toneColor, type ChartTone } from "../utils";
import "./BoxPlot.css";

export interface BoxPlotSeries {
  /** Series label shown on the category axis. */
  label: string;
  /** Raw numeric values; statistics are computed from these. */
  values: number[];
  /** Optional tone; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface BoxPlotProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** One or more series of numbers. */
  series: BoxPlotSeries[];
  /** Layout orientation. Default `"vertical"`. */
  orientation?: "vertical" | "horizontal";
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `240`. */
  height?: number;
  /** Force value axis min; defaults to the data min (incl. outliers). */
  min?: number;
  /** Force value axis max; defaults to the data max (incl. outliers). */
  max?: number;
  /** Show category labels. Default `true`. */
  showLabels?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

/** Linear-interpolated quantile of a sorted ascending array. */
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Compute box-and-whisker stats with 1.5·IQR outlier fences. */
function computeStats(values: number[]): BoxStats {
  const finite = values.filter((v) => Number.isFinite(v));
  const sorted = [...finite].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
  }
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  const whiskerMin = inRange.length ? inRange[0] : sorted[0];
  const whiskerMax = inRange.length ? inRange[inRange.length - 1] : sorted[sorted.length - 1];
  return { min: whiskerMin, q1, median, q3, max: whiskerMax, outliers };
}

/**
 * BoxPlot — one or more box-and-whisker plots computed from raw value series.
 *
 * Computes min/Q1/median/Q3/max (Tukey whiskers) plus 1.5·IQR outliers per
 * series. Vertical or horizontal layout, tones, and a shared value axis.
 */
export const BoxPlot = forwardRef<SVGSVGElement, BoxPlotProps>(function BoxPlot(
  {
    series,
    orientation = "vertical",
    width = 360,
    height = 240,
    min,
    max,
    showLabels = true,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const stats = series.map((s) => computeStats(s.values));

  const allValues = stats.flatMap((st) => [st.min, st.max, ...st.outliers]);
  const dataMin = min ?? (allValues.length ? Math.min(...allValues) : 0);
  const dataMaxRaw = max ?? (allValues.length ? Math.max(...allValues) : 1);
  const dataMax = dataMaxRaw === dataMin ? dataMin + 1 : dataMaxRaw;
  const span = dataMax - dataMin || 1;

  const vertical = orientation === "vertical";
  const padValue = 12; // padding along the value axis
  const padCat = showLabels ? 22 : 8;

  // Plot rectangle in value (v) and category (c) directions.
  const valueExtent = (vertical ? height : width) - padValue * 2 - (vertical ? padCat : 0);
  const catExtent = (vertical ? width : height) - (vertical ? 0 : padCat) - 8;
  const catStart = vertical ? 0 : 0;

  const colorFor = (s: BoxPlotSeries, i: number) =>
    s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

  // Map a value to a pixel coordinate along the value axis.
  const vPos = (v: number) => {
    const frac = (v - dataMin) / span;
    return vertical
      ? padValue + (1 - frac) * valueExtent // y grows downward
      : padValue + frac * valueExtent; // x grows rightward
  };

  const slot = series.length ? catExtent / series.length : catExtent;
  const boxThickness = Math.min(48, slot * 0.55);

  const summary =
    ariaLabel ??
    `Box plot of ${series.length} series. ` +
      series
        .map(
          (s, i) =>
            `${s.label}: median ${formatNumber(stats[i].median)}, ` +
            `Q1 ${formatNumber(stats[i].q1)}, Q3 ${formatNumber(stats[i].q3)}.`
        )
        .join(" ");

  return (
    <svg
      ref={ref}
      className={cn(
        "nova-box-plot",
        `nova-box-plot--${orientation}`,
        className
      )}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={summary}
      {...rest}
    >
      {series.map((s, i) => {
        const st = stats[i];
        const color = colorFor(s, i);
        const cCenter = catStart + i * slot + slot / 2;
        const half = boxThickness / 2;

        const vMin = vPos(st.min);
        const vQ1 = vPos(st.q1);
        const vMed = vPos(st.median);
        const vQ3 = vPos(st.q3);
        const vMax = vPos(st.max);

        const boxLow = Math.min(vQ1, vQ3);
        const boxLen = Math.abs(vQ3 - vQ1);

        const labelPos = vertical ? height - 6 : 0;

        return (
          <g key={`${s.label}-${i}`} className="nova-box-plot__group">
            <title>
              {`${s.label} — min ${formatNumber(st.min)}, Q1 ${formatNumber(
                st.q1
              )}, median ${formatNumber(st.median)}, Q3 ${formatNumber(
                st.q3
              )}, max ${formatNumber(st.max)}`}
            </title>

            {vertical ? (
              <>
                {/* Whisker line */}
                <line
                  className="nova-box-plot__whisker"
                  x1={cCenter}
                  y1={vMin}
                  x2={cCenter}
                  y2={vMax}
                  stroke={color}
                />
                {/* Whisker caps */}
                <line
                  className="nova-box-plot__cap"
                  x1={cCenter - half * 0.6}
                  y1={vMin}
                  x2={cCenter + half * 0.6}
                  y2={vMin}
                  stroke={color}
                />
                <line
                  className="nova-box-plot__cap"
                  x1={cCenter - half * 0.6}
                  y1={vMax}
                  x2={cCenter + half * 0.6}
                  y2={vMax}
                  stroke={color}
                />
                {/* Box */}
                <rect
                  className="nova-box-plot__box"
                  x={cCenter - half}
                  y={boxLow}
                  width={boxThickness}
                  height={Math.max(1, boxLen)}
                  fill={color}
                  stroke={color}
                />
                {/* Median */}
                <line
                  className="nova-box-plot__median"
                  x1={cCenter - half}
                  y1={vMed}
                  x2={cCenter + half}
                  y2={vMed}
                />
                {/* Outliers */}
                {st.outliers.map((o, oi) => (
                  <circle
                    key={oi}
                    className="nova-box-plot__outlier"
                    cx={cCenter}
                    cy={vPos(o)}
                    r={2.5}
                    stroke={color}
                  />
                ))}
                {showLabels && (
                  <text
                    className="nova-box-plot__label"
                    x={cCenter}
                    y={labelPos}
                    textAnchor="middle"
                  >
                    {s.label}
                  </text>
                )}
              </>
            ) : (
              <>
                <line
                  className="nova-box-plot__whisker"
                  x1={vMin}
                  y1={cCenter}
                  x2={vMax}
                  y2={cCenter}
                  stroke={color}
                />
                <line
                  className="nova-box-plot__cap"
                  x1={vMin}
                  y1={cCenter - half * 0.6}
                  x2={vMin}
                  y2={cCenter + half * 0.6}
                  stroke={color}
                />
                <line
                  className="nova-box-plot__cap"
                  x1={vMax}
                  y1={cCenter - half * 0.6}
                  x2={vMax}
                  y2={cCenter + half * 0.6}
                  stroke={color}
                />
                <rect
                  className="nova-box-plot__box"
                  x={boxLow}
                  y={cCenter - half}
                  width={Math.max(1, boxLen)}
                  height={boxThickness}
                  fill={color}
                  stroke={color}
                />
                <line
                  className="nova-box-plot__median"
                  x1={vMed}
                  y1={cCenter - half}
                  x2={vMed}
                  y2={cCenter + half}
                />
                {st.outliers.map((o, oi) => (
                  <circle
                    key={oi}
                    className="nova-box-plot__outlier"
                    cx={vPos(o)}
                    cy={cCenter}
                    r={2.5}
                    stroke={color}
                  />
                ))}
                {showLabels && (
                  <text
                    className="nova-box-plot__label nova-box-plot__label--h"
                    x={2}
                    y={cCenter}
                    textAnchor="start"
                    dominantBaseline="central"
                  >
                    {s.label}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}

      <foreignObject x={0} y={0} width={0} height={0}>
        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Series</th>
              <th scope="col">Min</th>
              <th scope="col">Q1</th>
              <th scope="col">Median</th>
              <th scope="col">Q3</th>
              <th scope="col">Max</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s, i) => (
              <tr key={i}>
                <th scope="row">{s.label}</th>
                <td>{stats[i].min}</td>
                <td>{stats[i].q1}</td>
                <td>{stats[i].median}</td>
                <td>{stats[i].q3}</td>
                <td>{stats[i].max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </foreignObject>
    </svg>
  );
});
