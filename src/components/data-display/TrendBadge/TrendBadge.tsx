import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TrendBadge.css";

export type TrendDirection = "up" | "down" | "flat";
export type TrendBadgeSize = "sm" | "md";

export interface TrendBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Numeric delta. Used to derive the arrow direction and default label
   * (formatted as a percentage) when `value` is not provided.
   */
  delta?: number;
  /** Explicit display text (overrides the formatted `delta`). */
  value?: React.ReactNode;
  /** Force direction. Derived from the sign of `delta` when omitted. */
  direction?: TrendDirection;
  /**
   * Whether the change is good. Defaults to `up = positive`. Set explicitly
   * when lower is better (e.g. bounce rate, error count).
   */
  positive?: boolean;
  /** Size on the sm/md scale. Defaults to `"md"`. */
  size?: TrendBadgeSize;
  /** Fractional digits when formatting `delta`. Defaults to `1`. */
  decimals?: number;
  /** Visually-hidden screen-reader prefix, e.g. "increased by". */
  srLabel?: string;
}

const directionFromDelta = (delta?: number): TrendDirection => {
  if (delta === undefined || delta === 0) return "flat";
  return delta > 0 ? "up" : "down";
};

const Arrow = ({ direction }: { direction: TrendDirection }) => {
  if (direction === "flat") {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  const d =
    direction === "up"
      ? "M8 13V4M8 4l-3.5 3.5M8 4l3.5 3.5"
      : "M8 3v9M8 12l-3.5-3.5M8 12l3.5 3.5";
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TrendBadge = forwardRef<HTMLSpanElement, TrendBadgeProps>(
  function TrendBadge(
    {
      delta,
      value,
      direction,
      positive,
      size = "md",
      decimals = 1,
      srLabel,
      className,
      ...rest
    },
    ref
  ) {
    const dir = direction ?? directionFromDelta(delta);

    const tone =
      dir === "flat"
        ? "flat"
        : (positive !== undefined ? positive : dir === "up")
        ? "positive"
        : "negative";

    const content =
      value !== undefined
        ? value
        : delta !== undefined
        ? `${Math.abs(delta).toFixed(decimals)}%`
        : null;

    return (
      <span
        ref={ref}
        className={cn(
          "nova-trend-badge",
          `nova-trend-badge--${tone}`,
          `nova-trend-badge--${size}`,
          className
        )}
        {...rest}
      >
        <span className="nova-trend-badge__icon" aria-hidden="true">
          <Arrow direction={dir} />
        </span>
        {srLabel && <span className="nova-trend-badge__sr-only">{srLabel} </span>}
        {content != null && (
          <span className="nova-trend-badge__value">{content}</span>
        )}
      </span>
    );
  }
);
