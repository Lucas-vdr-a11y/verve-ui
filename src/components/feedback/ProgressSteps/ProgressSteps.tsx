import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressSteps.css";

export type ProgressStepsTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type ProgressStepsSize = "sm" | "md" | "lg";

export interface ProgressStep {
  /** Stable key. Falls back to the index when omitted. */
  id?: string;
  /** Label rendered beneath the step marker. */
  label?: React.ReactNode;
}

export interface ProgressStepsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Ordered list of steps. */
  steps: ProgressStep[];
  /**
   * Current step. Zero-based index of the active step, or, when `percent` is
   * set, ignored. Steps before this index render as complete. Defaults to `0`.
   */
  current?: number;
  /**
   * Explicit fill percentage (0–100). Overrides step-based fill. Use for a
   * smooth/continuous bar that does not snap to step markers.
   */
  percent?: number;
  /** Color tone of the fill + completed markers. Defaults to `"primary"`. */
  tone?: ProgressStepsTone;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ProgressStepsSize;
  /** Accessible label for the progress visualization. */
  label?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * ProgressSteps — a slim horizontal progress visualization: labeled step
 * markers joined by a connecting bar that fills to the current step (or to an
 * explicit percent). Distinct from a navigation `Steps` / wizard.
 */
export const ProgressSteps = forwardRef<HTMLDivElement, ProgressStepsProps>(
  function ProgressSteps(
    {
      steps,
      current = 0,
      percent,
      tone = "primary",
      size = "md",
      label,
      className,
      ...rest
    },
    ref
  ) {
    const count = steps.length;
    const lastIndex = Math.max(count - 1, 1);
    const safeCurrent = clamp(current, 0, Math.max(count - 1, 0));

    const fill =
      percent != null
        ? clamp(percent, 0, 100)
        : count <= 1
          ? safeCurrent > 0
            ? 100
            : 0
          : (safeCurrent / lastIndex) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        className={cn(
          "nova-progress-steps",
          `nova-progress-steps--${tone}`,
          `nova-progress-steps--${size}`,
          className
        )}
        {...rest}
      >
        <div className="nova-progress-steps__track" aria-hidden="true">
          <div
            className="nova-progress-steps__fill"
            style={{ inlineSize: `${fill}%` }}
          />
        </div>
        <ol className="nova-progress-steps__list">
          {steps.map((step, index) => {
            const isComplete =
              percent != null ? false : index < safeCurrent;
            const isActive = percent != null ? false : index === safeCurrent;
            return (
              <li
                key={step.id ?? index}
                className={cn(
                  "nova-progress-steps__step",
                  isComplete && "nova-progress-steps__step--complete",
                  isActive && "nova-progress-steps__step--active"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className="nova-progress-steps__marker"
                  aria-hidden="true"
                />
                {step.label != null && (
                  <span className="nova-progress-steps__label">
                    {step.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);
