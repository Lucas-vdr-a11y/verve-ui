import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Rating.css";

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Called with the new rating. */
  onChange?: (value: number) => void;
  /** Number of symbols. Defaults to `5`. */
  max?: number;
  /** Allow half-step selection. Defaults to `false`. */
  allowHalf?: boolean;
  /** Render the rating read-only (no interaction). */
  readOnly?: boolean;
  /** Disable interaction entirely. */
  disabled?: boolean;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: RatingSize;
  /** Custom symbol node. Defaults to a star. */
  icon?: React.ReactNode;
  /** Accessible label for the group. */
  "aria-label"?: string;
  /** Build a per-symbol label, e.g. `(v) => \`${v} stars\``. */
  getItemLabel?: (value: number) => string;
}

const StarIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.3l-5.8 3.06 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z"
      fill="currentColor"
    />
  </svg>
);

export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value,
    defaultValue,
    onChange,
    max = 5,
    allowHalf = false,
    readOnly = false,
    disabled = false,
    size = "md",
    icon = StarIcon,
    className,
    getItemLabel,
    onKeyDown,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? 0);
  const current = isControlled ? value : internal;

  const [hover, setHover] = useState<number | null>(null);
  const interactive = !readOnly && !disabled;
  const display = hover != null ? hover : current;
  const step = allowHalf ? 0.5 : 1;

  const commit = (next: number) => {
    const clamped = Math.max(0, Math.min(max, next));
    if (!isControlled) setInternal(clamped);
    onChange?.(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!interactive || e.defaultPrevented) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commit(Math.min(max, current + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commit(Math.max(0, current - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(0);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(max);
    }
  };

  const labelFor = (v: number) =>
    getItemLabel ? getItemLabel(v) : `${v} of ${max}`;

  return (
    <div
      ref={ref}
      className={cn(
        "nova-rating",
        `nova-rating--${size}`,
        readOnly && "nova-rating--readonly",
        disabled && "nova-rating--disabled",
        className
      )}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={labelFor(current)}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      tabIndex={interactive ? 0 : -1}
      data-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => interactive && setHover(null)}
      {...rest}
    >
      {Array.from({ length: max }, (_, i) => {
        const symbolValue = i + 1;
        const fill = Math.max(0, Math.min(1, display - i)); // 0..1
        return (
          <span
            key={symbolValue}
            className="nova-rating__symbol"
            data-fill={fill === 1 ? "full" : fill === 0 ? "empty" : "half"}
          >
            <span className="nova-rating__icon nova-rating__icon--bg">
              {icon}
            </span>
            <span
              className="nova-rating__icon nova-rating__icon--fg"
              style={{ width: `${fill * 100}%` }}
            >
              {icon}
            </span>
            {interactive && (
              <>
                {allowHalf && (
                  <button
                    type="button"
                    className="nova-rating__hit nova-rating__hit--half"
                    aria-label={labelFor(symbolValue - 0.5)}
                    onMouseEnter={() => setHover(symbolValue - 0.5)}
                    onClick={() => commit(symbolValue - 0.5)}
                    tabIndex={-1}
                  />
                )}
                <button
                  type="button"
                  className="nova-rating__hit nova-rating__hit--full"
                  aria-label={labelFor(symbolValue)}
                  onMouseEnter={() => setHover(symbolValue)}
                  onClick={() => commit(symbolValue)}
                  tabIndex={-1}
                />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
});
