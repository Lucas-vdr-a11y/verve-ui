import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  buildLinePath,
  formatNumber,
  toneColor,
  type ChartTone,
} from "../utils";
import "./Histogram.css";

export interface HistogramBin {
  /** Inclusive lower edge of the bin. */
  start: number;
  /** Exclusive upper edge of the bin (inclusive for the last bin). */
  end: number;
  /** Count of values in the bin. */
  count: number;
}

export interface HistogramProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height" | "values"> {
  /** Raw values to auto-bin. Ignored when `bins` is provided. */
  values?: number[];
  /** Precomputed bins; overrides `values`. */
  bins?: HistogramBin[];
  /** Number of bins when auto-binning from `values`. Default `10`. */
  binCount?: number;
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `220`. */
  height?: number;
  /** Bar tone. Default `"brand"`. */
  tone?: ChartTone;
  /** Corner radius of bars in user units. Default `2`. */
  barRadius?: number;
  /** Overlay a smoothed density (frequency) curve. Default `false`. */
  showDensity?: boolean;
  /** Show x-axis edge ticks. Default `true`. */
  showAxis?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/** Auto-bin raw values into `binCount` equal-width bins. */
function autoBin(values: number[], binCount: number): HistogramBin[] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const n = Math.max(1, Math.floor(binCount));
  if (min === max) {
    return [{ start: min, end: max, count: finite.length }];
  }
  const span = max - min;
  const width = span / n;
  const bins: HistogramBin[] = Array.from({ length: n }, (_, i) => ({
    start: min + i * width,
    end: min + (i + 1) * width,
    count: 0,
  }));
  for (const v of finite) {
    let idx = Math.floor((v - min) / width);
    if (idx >= n) idx = n - 1; // include the max in the last bin
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  }
  return bins;
}

/**
 * Histogram — distribution of raw `values` (auto-binned) or precomputed `bins`.
 *
 * Adjacent bar columns sized to the max count, an x-axis with edge ticks, and
 * an optional smoothed density curve. Pure math, responsive via `viewBox`.
 */
export const Histogram = forwardRef<SVGSVGElement, HistogramProps>(
  function Histogram(
    {
      values,
      bins,
      binCount = 10,
      width = 360,
      height = 220,
      tone = "brand",
      barRadius = 2,
      showDensity = false,
      showAxis = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const data: HistogramBin[] = bins ?? autoBin(values ?? [], binCount);

    const padX = 8;
    const padTop = 10;
    const padBottom = showAxis ? 22 : 8;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padTop - padBottom);

    const maxCount = data.length ? Math.max(...data.map((b) => b.count), 0) : 0;
    const safeMax = maxCount || 1;
    const slot = data.length ? plotW / data.length : plotW;
    const barW = slot * 0.92;

    const color = toneColor(tone, "var(--nova-primary)");
    const baseY = padTop + plotH;

    const densityPath =
      showDensity && data.length > 1
        ? buildLinePath(
            data.map((b, i) => ({
              x: padX + i * slot + slot / 2,
              y: baseY - (b.count / safeMax) * plotH,
            })),
            true
          )
        : "";

    const minEdge = data.length ? data[0].start : 0;
    const maxEdge = data.length ? data[data.length - 1].end : 0;
    const midEdge = (minEdge + maxEdge) / 2;

    const summary =
      ariaLabel ??
      `Histogram with ${data.length} bins over range ${formatNumber(
        minEdge
      )} to ${formatNumber(maxEdge)}.`;

    return (
      <svg
        ref={ref}
        className={cn("nova-histogram", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        <line
          className="nova-histogram__axis"
          x1={padX}
          y1={baseY}
          x2={padX + plotW}
          y2={baseY}
        />

        {data.map((b, i) => {
          const h = (b.count / safeMax) * plotH;
          const x = padX + i * slot + (slot - barW) / 2;
          const y = baseY - h;
          return (
            <rect
              key={i}
              className="nova-histogram__bar"
              x={x}
              y={y}
              width={barW}
              height={Math.max(0, h)}
              rx={Math.min(barRadius, barW / 2)}
              fill={color}
            >
              <title>{`[${formatNumber(b.start)}, ${formatNumber(
                b.end
              )}): ${b.count}`}</title>
            </rect>
          );
        })}

        {densityPath && (
          <path className="nova-histogram__density" d={densityPath} />
        )}

        {showAxis && data.length > 0 && (
          <>
            <text
              className="nova-histogram__tick"
              x={padX}
              y={baseY + 14}
              textAnchor="start"
            >
              {formatNumber(minEdge)}
            </text>
            <text
              className="nova-histogram__tick"
              x={padX + plotW / 2}
              y={baseY + 14}
              textAnchor="middle"
            >
              {formatNumber(midEdge)}
            </text>
            <text
              className="nova-histogram__tick"
              x={padX + plotW}
              y={baseY + 14}
              textAnchor="end"
            >
              {formatNumber(maxEdge)}
            </text>
          </>
        )}

        <foreignObject x={0} y={0} width={0} height={0}>
          <table className="nova-visually-hidden">
            <caption>{summary}</caption>
            <thead>
              <tr>
                <th scope="col">Range</th>
                <th scope="col">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b, i) => (
                <tr key={i}>
                  <th scope="row">{`${b.start} – ${b.end}`}</th>
                  <td>{b.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </foreignObject>
      </svg>
    );
  }
);
