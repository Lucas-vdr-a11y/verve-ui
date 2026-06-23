import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { formatNumber, paletteColor, toneColor, type ChartTone } from "../utils";
import "./StackedBarChart.css";

export interface StackedBarSeries {
  /** Object key in each row that holds this series' numeric value. */
  key: string;
  /** Legend / a11y label. Falls back to `key`. */
  label?: string;
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface StackedBarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Rows of data; each row is one category (one stacked bar). */
  data: Array<Record<string, number | string>>;
  /** Series definitions, stacked bottom-to-top in array order. */
  series: StackedBarSeries[];
  /** Row key whose value is used as the category label. Default `"label"`. */
  categoryKey?: string;
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `240`. */
  height?: number;
  /** Corner radius of the top of each bar. Default `4`. */
  barRadius?: number;
  /** Gap between bars as a fraction of slot width (0–0.9). Default `0.35`. */
  gap?: number;
  /** Normalize each bar to 100% (proportional mode). Default `false`. */
  stacked100?: boolean;
  /** Show category labels under each bar. Default `true`. */
  showLabels?: boolean;
  /** Show total value above each bar. Default `false`. */
  showValues?: boolean;
  /** Show a legend below the chart. Default `true`. */
  showLegend?: boolean;
  /** Force a max for the value axis; defaults to the largest stack total. */
  maxValue?: number;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

const num = (v: number | string | undefined): number =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

/**
 * StackedBarChart — vertical bars built from multiple stacked series.
 *
 * Each row contributes one bar; series are stacked in array order using the
 * categorical palette (or per-series tone/color). `stacked100` normalizes every
 * bar to its own total for proportional comparison.
 */
export const StackedBarChart = forwardRef<HTMLDivElement, StackedBarChartProps>(
  function StackedBarChart(
    {
      data,
      series,
      categoryKey = "label",
      width = 360,
      height = 240,
      barRadius = 4,
      gap = 0.35,
      stacked100 = false,
      showLabels = true,
      showValues = false,
      showLegend = true,
      maxValue,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const padX = 8;
    const padTop = showValues ? 18 : 8;
    const padBottom = showLabels ? 22 : 8;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom);

    const colorFor = (s: StackedBarSeries, i: number) =>
      s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

    const totals = data.map((row) =>
      series.reduce((sum, s) => sum + Math.max(0, num(row[s.key])), 0)
    );

    const computedMax = totals.length ? Math.max(...totals, 0) : 1;
    const max = stacked100 ? 1 : maxValue ?? computedMax;
    const safeMax = max || 1;

    const slot = data.length ? plotW / data.length : plotW;
    const clampedGap = Math.min(0.9, Math.max(0, gap));
    const barW = slot * (1 - clampedGap);

    const labelOf = (row: Record<string, number | string>): string =>
      String(row[categoryKey] ?? "");

    const summary =
      ariaLabel ??
      `Stacked bar chart with ${data.length} bars and ${series.length} series. ` +
        data
          .map((row, i) => `${labelOf(row)}: ${formatNumber(totals[i])}`)
          .join(", ");

    return (
      <div
        ref={ref}
        className={cn("nova-stacked-bar-chart", className)}
        {...rest}
      >
        <svg
          className="nova-stacked-bar-chart__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={summary}
        >
          <line
            className="nova-stacked-bar-chart__baseline"
            x1={padX}
            y1={padTop + plotH}
            x2={padX + plotW}
            y2={padTop + plotH}
          />
          {data.map((row, i) => {
            const total = totals[i];
            const scale = stacked100 ? (total > 0 ? 1 / total : 0) : 1 / safeMax;
            const x = padX + i * slot + (slot - barW) / 2;
            const cx = x + barW / 2;

            // Build segments bottom-up.
            let acc = 0;
            const segs = series.map((s, si) => {
              const v = Math.max(0, num(row[s.key]));
              const frac = v * scale; // fraction of plot height
              const segH = frac * plotH;
              const y0 = padTop + plotH - acc * plotH; // bottom of this segment
              acc += frac;
              const y = y0 - segH;
              return { s, si, v, segH, y };
            });

            // Round only the topmost non-empty segment.
            let topIdx = -1;
            for (let k = segs.length - 1; k >= 0; k--) {
              if (segs[k].segH > 0.01) {
                topIdx = k;
                break;
              }
            }

            return (
              <g
                key={`${labelOf(row)}-${i}`}
                className="nova-stacked-bar-chart__group"
              >
                {segs.map((seg) =>
                  seg.segH > 0.01 ? (
                    <rect
                      key={seg.s.key}
                      className="nova-stacked-bar-chart__seg"
                      x={x}
                      y={seg.y}
                      width={barW}
                      height={seg.segH}
                      rx={
                        seg.si === topIdx
                          ? Math.min(barRadius, barW / 2)
                          : 0
                      }
                      fill={colorFor(seg.s, seg.si)}
                    >
                      <title>{`${labelOf(row)} · ${
                        seg.s.label ?? seg.s.key
                      }: ${formatNumber(seg.v)}`}</title>
                    </rect>
                  ) : null
                )}
                {showValues && total > 0 && (
                  <text
                    className="nova-stacked-bar-chart__value"
                    x={cx}
                    y={padTop + plotH - acc * plotH - 5}
                    textAnchor="middle"
                  >
                    {stacked100 ? "100%" : formatNumber(total)}
                  </text>
                )}
                {showLabels && (
                  <text
                    className="nova-stacked-bar-chart__label"
                    x={cx}
                    y={padTop + plotH + 15}
                    textAnchor="middle"
                  >
                    {labelOf(row)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {showLegend && (
          <ul className="nova-stacked-bar-chart__legend">
            {series.map((s, i) => (
              <li
                key={s.key}
                className="nova-stacked-bar-chart__legend-item"
              >
                <span
                  className="nova-stacked-bar-chart__swatch"
                  style={{ background: colorFor(s, i) }}
                  aria-hidden="true"
                />
                <span className="nova-stacked-bar-chart__legend-label">
                  {s.label ?? s.key}
                </span>
              </li>
            ))}
          </ul>
        )}

        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label ?? s.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={`row-${i}`}>
                <th scope="row">{labelOf(row)}</th>
                {series.map((s) => (
                  <td key={s.key}>{num(row[s.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
