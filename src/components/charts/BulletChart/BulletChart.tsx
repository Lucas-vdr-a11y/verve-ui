import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { clamp, formatNumber, toneColor, type ChartTone } from "../utils";
import "./BulletChart.css";

export interface BulletBand {
  /** Upper bound of this qualitative band (bands are read in ascending order). */
  to: number;
  /** Optional label for the band (a11y/title). */
  label?: string;
}

export interface BulletChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height" | "target"> {
  /** The measured value (the bar). */
  value: number;
  /** The target marker. */
  target?: number;
  /** Scale maximum. Defaults to the largest of bands/value/target. */
  max?: number;
  /** Scale minimum. Default `0`. */
  min?: number;
  /**
   * Qualitative ranges (poor → good), each with an upper bound `to`. Rendered
   * back-to-front as graded background bands. Default three even bands.
   */
  ranges?: BulletBand[];
  /** Tone for the measure bar. Default `"brand"`. */
  tone?: ChartTone;
  /** Optional title label rendered to the left / above. */
  title?: string;
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `48`. */
  height?: number;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * BulletChart — compact KPI bullet graph: a measure bar over graded qualitative
 * range bands with a target marker. Horizontal, pure SVG, responsive.
 */
export const BulletChart = forwardRef<SVGSVGElement, BulletChartProps>(
  function BulletChart(
    {
      value,
      target,
      max,
      min = 0,
      ranges,
      tone = "brand",
      title,
      width = 360,
      height = 48,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const bands =
      ranges && ranges.length > 0
        ? [...ranges].sort((a, b) => a.to - b.to)
        : null;

    const autoMax =
      max ??
      Math.max(
        value,
        target ?? 0,
        bands ? bands[bands.length - 1].to : value
      );
    const hi = autoMax || 1;
    const lo = Math.min(min, value, target ?? min);
    const span = hi - lo || 1;

    const padX = 8;
    const labelW = title ? 80 : 0;
    const plotX = padX + labelW;
    const plotW = Math.max(1, width - plotX - padX);
    const trackH = Math.min(height * 0.45, 18);
    const trackY = (height - trackH) / 2;
    const measureH = trackH * 0.5;
    const measureY = (height - measureH) / 2;

    const sx = (v: number) => plotX + ((clamp(v, lo, hi) - lo) / span) * plotW;

    // Graded band opacities: lightest (poor) → strongest (good).
    const effectiveBands = bands ?? [
      { to: lo + span / 3 },
      { to: lo + (span * 2) / 3 },
      { to: hi },
    ];

    const barColor = toneColor(tone, "var(--nova-primary)");

    const summary =
      ariaLabel ??
      `${title ? title + ": " : ""}value ${formatNumber(value)}${
        target != null ? `, target ${formatNumber(target)}` : ""
      }, scale ${formatNumber(lo)} to ${formatNumber(hi)}.`;

    return (
      <svg
        ref={ref}
        className={cn("nova-bullet-chart", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        {...rest}
      >
        {title && (
          <text
            className="nova-bullet-chart__title"
            x={padX}
            y={height / 2}
            dominantBaseline="central"
          >
            {title}
          </text>
        )}

        {effectiveBands.map((band, i) => {
          const from = i === 0 ? lo : effectiveBands[i - 1].to;
          const x = sx(from);
          const w = Math.max(0, sx(band.to) - x);
          const shade = (i + 1) / effectiveBands.length;
          return (
            <rect
              key={`band-${i}`}
              className="nova-bullet-chart__band"
              x={x}
              y={trackY}
              width={w}
              height={trackH}
              rx={2}
              style={{ opacity: 0.18 + shade * 0.32 }}
            >
              <title>
                {band.label ?? `Range up to ${formatNumber(band.to)}`}
              </title>
            </rect>
          );
        })}

        <rect
          className="nova-bullet-chart__measure"
          x={sx(lo)}
          y={measureY}
          width={Math.max(0, sx(value) - sx(lo))}
          height={measureH}
          rx={Math.min(2, measureH / 2)}
          fill={barColor}
        >
          <title>{`Value: ${formatNumber(value)}`}</title>
        </rect>

        {target != null && (
          <line
            className="nova-bullet-chart__target"
            x1={sx(target)}
            y1={trackY - 3}
            x2={sx(target)}
            y2={trackY + trackH + 3}
          >
            <title>{`Target: ${formatNumber(target)}`}</title>
          </line>
        )}
      </svg>
    );
  }
);
