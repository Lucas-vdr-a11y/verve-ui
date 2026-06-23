import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressMilestones.css";

export interface Milestone {
  /** Position on the track, in the same unit as `value`/`max`. */
  at: number;
  /** Icon shown at the marker (defaults to a star). */
  icon?: React.ReactNode;
  /** Accessible / tooltip label. */
  label?: string;
}

export interface ProgressMilestonesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value. */
  value: number;
  /** Maximum value of the track. Defaults to the largest milestone `at`. */
  max?: number;
  /** Reward checkpoints along the track. */
  milestones: Milestone[];
  /** Track tone. Defaults to `"brand"`. */
  tone?: "brand" | "success" | "warning" | "info";
}

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.87L12 17.9l-5.25 2.77 1-5.87L3.5 9.66l5.9-.86L12 3.5z"
      fill="currentColor"
    />
  </svg>
);

export const ProgressMilestones = forwardRef<
  HTMLDivElement,
  ProgressMilestonesProps
>(function ProgressMilestones(
  { value, max, milestones, tone = "brand", className, ...rest },
  ref
) {
  const computedMax =
    max ?? Math.max(...milestones.map((m) => m.at), value, 1);
  const pct = Math.min(Math.max(value / computedMax, 0), 1) * 100;

  return (
    <div
      ref={ref}
      className={cn(
        "nova-progress-milestones",
        `nova-progress-milestones--${tone}`,
        className
      )}
      {...rest}
    >
      <div
        className="nova-progress-milestones__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={computedMax}
        aria-valuenow={Math.min(value, computedMax)}
      >
        <div
          className="nova-progress-milestones__fill"
          style={{ width: `${pct}%` }}
        />
        {milestones.map((m, i) => {
          const left = Math.min(Math.max(m.at / computedMax, 0), 1) * 100;
          const unlocked = value >= m.at;
          return (
            <div
              key={i}
              className={cn(
                "nova-progress-milestones__marker",
                unlocked && "nova-progress-milestones__marker--unlocked"
              )}
              style={{ left: `${left}%` }}
              aria-label={`${m.label ?? `Milestone ${i + 1}`}: ${
                unlocked ? "unlocked" : "locked"
              }`}
              title={m.label}
            >
              <span className="nova-progress-milestones__marker-icon">
                {m.icon ?? <StarIcon />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
