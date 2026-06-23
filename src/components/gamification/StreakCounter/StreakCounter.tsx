import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StreakCounter.css";

export interface StreakCounterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Current streak length in days. */
  count: number;
  /**
   * Recent days, most recent last. `true` = active/completed, `false` = missed.
   * Rendered as a row of dots beneath the flame.
   */
  days?: boolean[];
  /** Word used for the unit. Defaults to `"day"` (auto-pluralised). */
  unit?: string;
  /** Size of the flame + text. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      className="nova-streak__flame-outer"
      d="M12 2c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-1.2.4-2.2 1-3 .2 1 1 1.8 2 1.8C8.5 7 12 6 12 2Z"
    />
    <path
      className="nova-streak__flame-inner"
      d="M12 11c1.4.8 2.2 2 2.2 3.3a2.2 2.2 0 0 1-4.4 0c0-.9.5-1.6 1.1-2.2.1.5.6.9 1.1.9-.4-.9 0-1.6 0-2Z"
    />
  </svg>
);

export const StreakCounter = forwardRef<HTMLDivElement, StreakCounterProps>(
  function StreakCounter(
    { count, days, unit = "day", size = "md", className, ...rest },
    ref
  ) {
    const plural = count === 1 ? unit : `${unit}s`;
    const active = count > 0;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-streak",
          `nova-streak--${size}`,
          !active && "nova-streak--idle",
          className
        )}
        {...rest}
      >
        <div className="nova-streak__head">
          <span className="nova-streak__flame" aria-hidden="true">
            <FlameIcon />
          </span>
          <span className="nova-streak__count">
            <span className="nova-streak__num">{count.toLocaleString()}</span>
            <span className="nova-streak__label">
              {plural} streak
            </span>
          </span>
        </div>
        {days && days.length > 0 && (
          <ol className="nova-streak__days" aria-label="Recent days">
            {days.map((on, i) => (
              <li
                key={i}
                className={cn(
                  "nova-streak__dot",
                  on
                    ? "nova-streak__dot--active"
                    : "nova-streak__dot--missed"
                )}
                aria-label={on ? "Active day" : "Missed day"}
                title={on ? "Active" : "Missed"}
              />
            ))}
          </ol>
        )}
      </div>
    );
  }
);
