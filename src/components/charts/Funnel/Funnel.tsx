import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  formatNumber,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./Funnel.css";

export interface FunnelStage {
  /** Stage label. */
  label: string;
  /** Stage value (>= 0). */
  value: number;
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface FunnelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Stages from top (widest) to bottom. */
  stages: FunnelStage[];
  /** Intrinsic width (viewBox). Default `360`. */
  width?: number;
  /** Height per stage in user units. Default `48`. */
  stageHeight?: number;
  /** Vertical gap between stages in user units. Default `4`. */
  gap?: number;
  /**
   * Percentage basis. `"first"` = share of the first stage (default);
   * `"previous"` = conversion vs the previous stage.
   */
  percentOf?: "first" | "previous";
  /** Show stage labels. Default `true`. */
  showLabels?: boolean;
  /** Show value + percentage. Default `true`. */
  showValues?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * Funnel — stacked trapezoid segments narrowing top-to-bottom, sized by value.
 *
 * Each stage's width is proportional to its value relative to the first stage;
 * trapezoids connect consecutive widths. Percentage labels show share of the
 * first stage or conversion from the previous stage.
 */
export const Funnel = forwardRef<HTMLDivElement, FunnelProps>(function Funnel(
  {
    stages,
    width = 360,
    stageHeight = 48,
    gap = 4,
    percentOf = "first",
    showLabels = true,
    showValues = true,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const cx = width / 2;
  const maxValue = stages.length ? Math.max(...stages.map((s) => s.value), 0) : 1;
  const safeMax = maxValue || 1;
  const height = stages.length
    ? stages.length * stageHeight + (stages.length - 1) * gap
    : stageHeight;

  const first = stages[0]?.value ?? 0;

  const colorFor = (s: FunnelStage, i: number) =>
    s.color ?? (s.tone ? toneColor(s.tone, paletteColor(i)) : paletteColor(i));

  const halfWidthFor = (value: number) =>
    (Math.max(0, value) / safeMax) * (width / 2 - 2);

  const pctFor = (i: number): number => {
    const v = stages[i].value;
    if (percentOf === "previous") {
      const prev = i === 0 ? v : stages[i - 1].value;
      return prev > 0 ? Math.round((v / prev) * 100) : 0;
    }
    return first > 0 ? Math.round((v / first) * 100) : 0;
  };

  const summary =
    ariaLabel ??
    `Funnel chart with ${stages.length} stages. ` +
      stages
        .map((s, i) => `${s.label}: ${formatNumber(s.value)} (${pctFor(i)}%)`)
        .join(", ");

  return (
    <div ref={ref} className={cn("nova-funnel", className)} {...rest}>
      <svg
        className="nova-funnel__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
      >
        {stages.map((s, i) => {
          const topY = i * (stageHeight + gap);
          const botY = topY + stageHeight;
          const topHalf = halfWidthFor(s.value);
          const next = stages[i + 1];
          const botHalf = next ? halfWidthFor(next.value) : topHalf;
          const color = colorFor(s, i);
          const pct = pctFor(i);

          // Trapezoid: top edge wider/narrower than bottom edge.
          const d = [
            `M ${cx - topHalf} ${topY}`,
            `L ${cx + topHalf} ${topY}`,
            `L ${cx + botHalf} ${botY}`,
            `L ${cx - botHalf} ${botY}`,
            "Z",
          ].join(" ");

          const midY = topY + stageHeight / 2;

          return (
            <g key={`${s.label}-${i}`} className="nova-funnel__group">
              <path className="nova-funnel__seg" d={d} fill={color}>
                <title>{`${s.label}: ${formatNumber(s.value)} (${pct}%)`}</title>
              </path>
              {showLabels && (
                <text
                  className="nova-funnel__label"
                  x={cx}
                  y={midY - (showValues ? 6 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {s.label}
                </text>
              )}
              {showValues && (
                <text
                  className="nova-funnel__value"
                  x={cx}
                  y={midY + (showLabels ? 9 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {`${formatNumber(s.value)} · ${pct}%`}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <table className="nova-visually-hidden">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Value</th>
            <th scope="col">Percent</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((s, i) => (
            <tr key={`row-${i}`}>
              <th scope="row">{s.label}</th>
              <td>{s.value}</td>
              <td>{pctFor(i)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
