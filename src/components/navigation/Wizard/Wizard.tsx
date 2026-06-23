import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Wizard.css";

export interface WizardStepMeta {
  /** Unique id for the step. */
  id: string;
  /** Short title shown in the progress indicator. */
  title: React.ReactNode;
  /**
   * Optional gate run before advancing past this step. Return `false`
   * (or a Promise resolving to `false`) to block navigation.
   */
  validate?: () => boolean | Promise<boolean>;
}

export interface WizardContextValue {
  /** Ordered step metadata. */
  steps: WizardStepMeta[];
  /** Index of the active step. */
  current: number;
  /** Id of the active step (if known). */
  currentId: string | undefined;
  /** Whether the wizard has reached its completed state. */
  completed: boolean;
  /** True while an async validation gate is resolving. */
  validating: boolean;
  /** Whether a previous step exists. */
  canGoBack: boolean;
  /** Whether a next step exists. */
  canGoNext: boolean;
  /** Advance one step (runs the current step's validation gate). */
  next: () => Promise<void>;
  /** Go back one step. */
  back: () => void;
  /** Jump to a step by index (no validation gate). */
  goTo: (index: number) => void;
  /** Mark the flow complete (runs the last step's validation gate). */
  complete: () => Promise<void>;
  /** Internal: id base for ARIA wiring. */
  baseId: string;
  /** Internal: register a declarative step. */
  registerStep: (meta: WizardStepMeta) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/** Access the surrounding wizard's state and navigation helpers. */
export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard() must be used within <Wizard>.");
  }
  return ctx;
}

export interface WizardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Steps in render order. */
  steps: WizardStepMeta[];
  /** Controlled active step index. */
  current?: number;
  /** Initial active step index when uncontrolled. Defaults to `0`. */
  defaultCurrent?: number;
  /** Called when the active step index changes. */
  onChange?: (index: number) => void;
  /** Called when the flow is completed. */
  onComplete?: () => void;
  /** Show the built-in progress indicator. Defaults to `true`. */
  showProgress?: boolean;
}

const WizardRoot = forwardRef<HTMLDivElement, WizardProps>(function Wizard(
  {
    steps,
    current: currentProp,
    defaultCurrent = 0,
    onChange,
    onComplete,
    showProgress = true,
    className,
    children,
    ...rest
  },
  ref
) {
  const baseId = useId();
  const isControlled = currentProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultCurrent);
  const current = isControlled ? currentProp : uncontrolled;

  const [completed, setCompleted] = useState(false);
  const [validating, setValidating] = useState(false);

  // Declarative <WizardStep> registration is informational; the `steps`
  // prop is the source of truth for navigation.
  const registerStep = useCallback(() => {}, []);

  const setCurrent = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, steps.length - 1));
      if (!isControlled) setUncontrolled(clamped);
      onChange?.(clamped);
    },
    [isControlled, onChange, steps.length]
  );

  const runGate = useCallback(
    async (index: number): Promise<boolean> => {
      const gate = steps[index]?.validate;
      if (!gate) return true;
      setValidating(true);
      try {
        return await gate();
      } finally {
        setValidating(false);
      }
    },
    [steps]
  );

  const next = useCallback(async () => {
    if (current >= steps.length - 1) return;
    if (await runGate(current)) setCurrent(current + 1);
  }, [current, steps.length, runGate, setCurrent]);

  const back = useCallback(() => {
    if (current > 0) {
      setCompleted(false);
      setCurrent(current - 1);
    }
  }, [current, setCurrent]);

  const goTo = useCallback(
    (index: number) => {
      setCompleted(false);
      setCurrent(index);
    },
    [setCurrent]
  );

  const complete = useCallback(async () => {
    if (await runGate(current)) {
      setCompleted(true);
      onComplete?.();
    }
  }, [current, runGate, onComplete]);

  const ctx = useMemo<WizardContextValue>(
    () => ({
      steps,
      current,
      currentId: steps[current]?.id,
      completed,
      validating,
      canGoBack: current > 0,
      canGoNext: current < steps.length - 1,
      next,
      back,
      goTo,
      complete,
      baseId,
      registerStep,
    }),
    [
      steps,
      current,
      completed,
      validating,
      next,
      back,
      goTo,
      complete,
      baseId,
      registerStep,
    ]
  );

  return (
    <WizardContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cn("nova-wizard", className)}
        data-completed={completed || undefined}
        {...rest}
      >
        {showProgress && <WizardProgress />}
        <div className="nova-wizard__body">{children}</div>
      </div>
    </WizardContext.Provider>
  );
});

function WizardProgress() {
  const { steps, current, completed, goTo, baseId } = useWizard();
  return (
    <ol className="nova-wizard__progress" aria-label="Progress">
      {steps.map((step, index) => {
        const status =
          completed || index < current
            ? "complete"
            : index === current
              ? "current"
              : "upcoming";
        return (
          <li
            key={step.id}
            className={cn(
              "nova-wizard__progress-step",
              `nova-wizard__progress-step--${status}`
            )}
            aria-current={status === "current" ? "step" : undefined}
          >
            <button
              type="button"
              className={cn("nova-wizard__progress-marker", "nova-focusable")}
              aria-label={
                typeof step.title === "string" ? step.title : undefined
              }
              aria-controls={`${baseId}-panel-${step.id}`}
              onClick={() => goTo(index)}
            >
              {status === "complete" ? (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            <span className="nova-wizard__progress-title">{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

export interface WizardStepProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Id matching one of the steps passed to <Wizard>. */
  id: string;
}

export const WizardStep = forwardRef<HTMLDivElement, WizardStepProps>(
  function WizardStep({ id, className, children, ...rest }, ref) {
    const { currentId, baseId, completed } = useWizard();
    const isActive = currentId === id && !completed;

    return (
      <div
        ref={ref}
        id={`${baseId}-panel-${id}`}
        role="tabpanel"
        hidden={!isActive}
        className={cn("nova-wizard__step", className)}
        {...rest}
      >
        {isActive ? children : null}
      </div>
    );
  }
);

export const Wizard = Object.assign(WizardRoot, {
  Step: WizardStep,
  Progress: WizardProgress,
});
