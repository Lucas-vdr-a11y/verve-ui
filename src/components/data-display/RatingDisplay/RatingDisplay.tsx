import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RatingDisplay.css";

export type RatingDisplaySize = "sm" | "md" | "lg";

export interface RatingDisplayProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current rating value (e.g. `3.5`). */
  value: number;
  /** Maximum number of stars. Defaults to `5`. */
  max?: number;
  /** Star size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: RatingDisplaySize;
  /**
   * Smallest fractional step to render, enabling partial stars via clipping.
   * Defaults to `0.5`. Use `1` for whole stars only, `0.1` for fine fills.
   */
  precision?: number;
  /**
   * Custom accessible label. Defaults to `"{value} out of {max}"`.
   * Receives the rounded value and max.
   */
  getLabel?: (value: number, max: number) => string;
}

const StarShape = ({ fill }: { fill: number }) => {
  const clamped = Math.max(0, Math.min(1, fill));
  return (
    <span className="nova-rating-display__star" aria-hidden="true">
      <svg
        className="nova-rating-display__star-bg"
        viewBox="0 0 20 20"
        width="1em"
        height="1em"
        focusable="false"
      >
        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85z" />
      </svg>
      <span
        className="nova-rating-display__star-fill"
        style={{ width: `${clamped * 100}%` }}
      >
        <svg viewBox="0 0 20 20" width="1em" height="1em" focusable="false">
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85z" />
        </svg>
      </span>
    </span>
  );
};

export const RatingDisplay = forwardRef<HTMLDivElement, RatingDisplayProps>(
  function RatingDisplay(
    {
      value,
      max = 5,
      size = "md",
      precision = 0.5,
      getLabel,
      className,
      ...rest
    },
    ref
  ) {
    const step = precision > 0 ? precision : 1;
    const safeValue = Math.max(0, Math.min(max, value));
    const rounded = Math.round(safeValue / step) * step;
    const label = getLabel
      ? getLabel(rounded, max)
      : `${rounded} out of ${max}`;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-rating-display",
          `nova-rating-display--${size}`,
          className
        )}
        role="img"
        aria-label={label}
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => (
          <StarShape key={i} fill={rounded - i} />
        ))}
      </div>
    );
  }
);
