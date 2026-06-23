import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import {
  clamp,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./ActivityRings.css";

export interface ActivityRing {
  /** Ring label (legend + a11y table). */
  label: string;
  /** Current value. */
  value: number;
  /** Per-ring max. Defaults to the chart `max`. */
  max?: number;
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface ActivityRingsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Rings, outermost first. */
  rings: ActivityRing[];
  /** Default max when a ring has no own `max`. Default `100`. */
  max?: number;
  /** SVG size (square) in user units. Default `200`. */
  size?: number;
  /** Ring thickness in user units. Default `16`. */
  ringWidth?: number;
  /** Gap between rings in user units. Default `4`. */
  ringGap?: number;
  /** Content rendered in the center. */
  centerLabel?: ReactNode;
  /** Show a legend below the rings. Default `true`. */
  showLegend?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

const TWO_PI = Math.PI * 2;

/**
 * ActivityRings (ProgressDonut) — concentric progress rings in the Apple
 * Activity style: full circle, rounded caps, each value/max. Distinct from
 * RadialBarChart by the rounded-cap rings drawn with stroke-dasharray. Values
 * over 100% wrap visually as an overshoot ring.
 */
export const ActivityRings = forwardRef<HTMLDivElement, ActivityRingsProps>(
  function ActivityRings(
    {
      rings,
      max = 100,
      size = 200,
      ringWidth = 16,
      ringGap = 4,
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
    const outerStart = size / 2 - ringWidth / 2 - 1;

    const colorFor = (ring: ActivityRing, i: number) =>
      ring.color ??
      (ring.tone ? toneColor(ring.tone, paletteColor(i)) : paletteColor(i));

    const computed = rings.map((ring, i) => {
      const radius = Math.max(0, outerStart - i * (ringWidth + ringGap));
      const circumference = TWO_PI * radius;
      const ringMax = ring.max ?? max;
      const frac = ringMax > 0 ? ring.value / ringMax : 0;
      const visible = clamp(frac, 0, 1);
      const pct = Math.round(frac * 100);
      // Dash length for the visible portion; rounded caps add ~ringWidth, so
      // keep a tiny epsilon to avoid the cap overlapping a full ring's start.
      const dash = visible >= 1 ? circumference : circumference * visible;
      return {
        ring,
        i,
        radius,
        circumference,
        dash,
        pct,
        color: colorFor(ring, i),
      };
    });

    const summary =
      ariaLabel ??
      `Activity rings: ` +
        computed.map((c) => `${c.ring.label} ${c.pct}%`).join(", ");

    return (
      <div ref={ref} className={cn("nova-activity-rings", className)} {...rest}>
        <div className="nova-activity-rings__figure">
          <svg
            className="nova-activity-rings__svg"
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={summary}
          >
            {/* Rotate -90deg so progress starts at 12 o'clock, clockwise. */}
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              {computed.map((c) =>
                c.radius > 0 ? (
                  <g key={`ring-${c.i}`}>
                    <circle
                      className="nova-activity-rings__track"
                      cx={cx}
                      cy={cy}
                      r={c.radius}
                      fill="none"
                      strokeWidth={ringWidth}
                      style={{ color: c.color }}
                    />
                    {c.dash > 0 && (
                      <circle
                        className="nova-activity-rings__bar"
                        cx={cx}
                        cy={cy}
                        r={c.radius}
                        fill="none"
                        stroke={c.color}
                        strokeWidth={ringWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${c.dash} ${c.circumference}`}
                      >
                        <title>{`${c.ring.label}: ${c.pct}%`}</title>
                      </circle>
                    )}
                  </g>
                ) : null
              )}
            </g>
          </svg>
          {centerLabel != null && (
            <div className="nova-activity-rings__center" aria-hidden="true">
              {centerLabel}
            </div>
          )}
        </div>

        {showLegend && (
          <ul className="nova-activity-rings__legend">
            {computed.map((c) => (
              <li
                key={`legend-${c.i}`}
                className="nova-activity-rings__legend-item"
              >
                <span
                  className="nova-activity-rings__swatch"
                  style={{ background: c.color }}
                  aria-hidden="true"
                />
                <span className="nova-activity-rings__legend-label">
                  {c.ring.label}
                </span>
                <span className="nova-activity-rings__legend-value">
                  {c.pct}%
                </span>
              </li>
            ))}
          </ul>
        )}

        <table className="nova-visually-hidden">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Ring</th>
              <th scope="col">Value</th>
              <th scope="col">Max</th>
            </tr>
          </thead>
          <tbody>
            {rings.map((ring, i) => (
              <tr key={`row-${i}`}>
                <th scope="row">{ring.label}</th>
                <td>{ring.value}</td>
                <td>{ring.max ?? max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
