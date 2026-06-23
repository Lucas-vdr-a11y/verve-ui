import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./OnboardingChecklist.css";

export interface OnboardingStep {
  /** Stable identifier for the step. */
  id: string;
  /** Step title. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Whether the step is complete. */
  done?: boolean;
  /** Optional action label rendered as a button on incomplete steps. */
  action?: React.ReactNode;
}

export interface OnboardingChecklistProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onSelect"> {
  /** Card title. @default "Get started" */
  title?: React.ReactNode;
  /** Supporting subtitle below the title. */
  subtitle?: React.ReactNode;
  /** Setup steps. */
  steps: OnboardingStep[];
  /** Show a dismiss (×) button in the header. */
  dismissible?: boolean;
  /** Called when the dismiss button is pressed. */
  onDismiss?: () => void;
  /**
   * Whether completed steps can be collapsed into a summary line.
   * @default true
   */
  collapsibleDone?: boolean;
  /** Called when a step's action button is pressed. */
  onStepAction?: (id: string) => void;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--nova-duration-fast) var(--nova-ease)" }}
  >
    <path
      d="M4 6l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function StepRow({
  step,
  onStepAction,
}: {
  step: OnboardingStep;
  onStepAction?: (id: string) => void;
}) {
  return (
    <li
      className={cn(
        "nova-onboarding-checklist__step",
        step.done && "nova-onboarding-checklist__step--done",
      )}
    >
      <span
        className="nova-onboarding-checklist__mark"
        aria-hidden="true"
        data-done={step.done ? "true" : "false"}
      >
        {step.done && <CheckIcon />}
      </span>
      <div className="nova-onboarding-checklist__step-body">
        <span className="nova-onboarding-checklist__step-title">{step.title}</span>
        {step.description && (
          <span className="nova-onboarding-checklist__step-desc">{step.description}</span>
        )}
      </div>
      {!step.done && step.action && (
        <button
          type="button"
          className="nova-onboarding-checklist__step-action nova-focusable"
          onClick={() => onStepAction?.(step.id)}
        >
          {step.action}
        </button>
      )}
    </li>
  );
}

/**
 * OnboardingChecklist — a setup checklist card with an overall progress bar,
 * "n of m complete" summary, optional dismiss, and collapsible completed steps.
 */
export const OnboardingChecklist = forwardRef<HTMLElement, OnboardingChecklistProps>(
  function OnboardingChecklist(
    {
      title = "Get started",
      subtitle,
      steps,
      dismissible = false,
      onDismiss,
      collapsibleDone = true,
      onStepAction,
      className,
      ...rest
    },
    ref,
  ) {
    const total = steps.length;
    const completed = steps.filter((s) => s.done).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const progressLabelId = useId();
    const doneRegionId = useId();

    const doneSteps = steps.filter((s) => s.done);
    const openSteps = steps.filter((s) => !s.done);
    const hasCollapsible = collapsibleDone && doneSteps.length > 0;

    const [showDone, setShowDone] = useState(false);

    return (
      <section
        ref={ref}
        className={cn("nova-onboarding-checklist", className)}
        {...rest}
      >
        <header className="nova-onboarding-checklist__header">
          <div className="nova-onboarding-checklist__heading">
            <h3 className="nova-onboarding-checklist__title">{title}</h3>
            {subtitle && (
              <p className="nova-onboarding-checklist__subtitle">{subtitle}</p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              className="nova-onboarding-checklist__dismiss nova-focusable"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          )}
        </header>

        <div className="nova-onboarding-checklist__progress">
          <div className="nova-onboarding-checklist__progress-meta">
            <span id={progressLabelId} className="nova-onboarding-checklist__count">
              {completed} of {total} complete
            </span>
            <span className="nova-onboarding-checklist__percent">{percent}%</span>
          </div>
          <div
            className="nova-onboarding-checklist__track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby={progressLabelId}
          >
            <div
              className="nova-onboarding-checklist__bar"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <ul className="nova-onboarding-checklist__steps" role="list">
          {(hasCollapsible ? openSteps : steps).map((step) => (
            <StepRow key={step.id} step={step} onStepAction={onStepAction} />
          ))}
        </ul>

        {hasCollapsible && (
          <div className="nova-onboarding-checklist__done-group">
            <button
              type="button"
              className="nova-onboarding-checklist__toggle nova-focusable"
              onClick={() => setShowDone((v) => !v)}
              aria-expanded={showDone}
              aria-controls={doneRegionId}
            >
              <span>
                {showDone ? "Hide" : "Show"} {doneSteps.length} completed
              </span>
              <span className="nova-onboarding-checklist__toggle-icon" aria-hidden="true">
                <ChevronIcon open={showDone} />
              </span>
            </button>
            {showDone && (
              <ul
                id={doneRegionId}
                className="nova-onboarding-checklist__steps"
                role="list"
              >
                {doneSteps.map((step) => (
                  <StepRow key={step.id} step={step} onStepAction={onStepAction} />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    );
  },
);
