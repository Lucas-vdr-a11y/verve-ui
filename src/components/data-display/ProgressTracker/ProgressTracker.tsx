import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import type { ChartTone } from "../../charts/utils";
import { toneColor } from "../../charts/utils";
import "./ProgressTracker.css";

export type TrackerStepStatus = "done" | "active" | "todo" | "error";

export interface TrackerStep {
  /** Stable unique id (falls back to index if omitted). */
  id?: string;
  /** Step title. */
  title: string;
  /** Longer description / activity detail. */
  description?: React.ReactNode;
  /** Status drives the marker styling. Defaults to `"todo"`. */
  status?: TrackerStepStatus;
  /** Timestamp / meta line shown on the opposite side. */
  timestamp?: string;
  /** Custom icon node placed inside the marker. */
  icon?: React.ReactNode;
  /** Override marker tone (else derived from status). */
  tone?: ChartTone;
}

export interface ProgressTrackerProps
  extends React.HTMLAttributes<HTMLOListElement> {
  /** Ordered milestones. */
  steps: TrackerStep[];
  /** Marker size scale. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const STATUS_TONE: Record<TrackerStepStatus, string> = {
  done: "var(--nova-success)",
  active: "var(--nova-primary)",
  todo: "var(--nova-border-strong)",
  error: "var(--nova-danger)",
};

const STATUS_GLYPH: Record<TrackerStepStatus, string> = {
  done: "✓",
  active: "",
  todo: "",
  error: "!",
};

export const ProgressTracker = forwardRef<
  HTMLOListElement,
  ProgressTrackerProps
>(function ProgressTracker(
  { steps, size = "md", className, ...rest },
  ref
) {
  return (
    <ol
      ref={ref}
      className={cn(
        "nova-progress-tracker",
        `nova-progress-tracker--${size}`,
        className
      )}
      {...rest}
    >
      {steps.map((step, i) => {
        const status: TrackerStepStatus = step.status ?? "todo";
        const tone = step.tone
          ? toneColor(step.tone, STATUS_TONE[status])
          : STATUS_TONE[status];
        const isLast = i === steps.length - 1;
        const glyph = STATUS_GLYPH[status];
        return (
          <li
            key={step.id ?? i}
            className={cn(
              "nova-progress-tracker__step",
              `nova-progress-tracker__step--${status}`,
              isLast && "nova-progress-tracker__step--last"
            )}
            style={{ ["--nova-track-tone" as string]: tone }}
            aria-current={status === "active" ? "step" : undefined}
          >
            <div className="nova-progress-tracker__gutter">
              <span
                className="nova-progress-tracker__marker"
                aria-hidden="true"
              >
                {step.icon ?? (glyph ? <span>{glyph}</span> : null)}
              </span>
              {!isLast && (
                <span
                  className="nova-progress-tracker__connector"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="nova-progress-tracker__content">
              <div className="nova-progress-tracker__head">
                <span className="nova-progress-tracker__title">
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="nova-progress-tracker__time">
                    {step.timestamp}
                  </span>
                )}
              </div>
              {step.description && (
                <div className="nova-progress-tracker__desc">
                  {step.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
