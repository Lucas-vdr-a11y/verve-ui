import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./MultiStepLoader.css";

export interface MultiStepLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Step labels, advanced top-to-bottom. */
  steps: string[];
  /** Whether the loader is running. Defaults `true`. */
  loading?: boolean;
  /** Milliseconds each step stays "in progress" before checking off. Defaults `1500`. */
  duration?: number;
  /** Restart from the top after finishing the last step. Defaults `false`. */
  loop?: boolean;
  /** Fired each time the active step advances (after a step completes). */
  onStepChange?: (index: number) => void;
  /** Fired once when the final step completes (not called while looping). */
  onComplete?: () => void;
}

/**
 * A vertical checklist loader (Aceternity multi-step loader): steps advance
 * automatically on a timer, each transitioning spinner → check as it completes
 * while the active step is highlighted. Optionally loops. Honors reduced motion
 * by swapping the spinner for a static dot.
 */
export const MultiStepLoader = forwardRef<HTMLDivElement, MultiStepLoaderProps>(
  function MultiStepLoader(
    {
      steps,
      loading = true,
      duration = 1500,
      loop = false,
      onStepChange,
      onComplete,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [current, setCurrent] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
      if (!loading) {
        setCurrent(0);
        setDone(false);
        return;
      }
      if (done) return;

      const id = window.setTimeout(() => {
        setCurrent((prev) => {
          const next = prev + 1;
          if (next >= steps.length) {
            if (loop) {
              onStepChange?.(0);
              return 0;
            }
            setDone(true);
            onComplete?.();
            return prev;
          }
          onStepChange?.(next);
          return next;
        });
      }, duration);

      return () => window.clearTimeout(id);
    }, [loading, current, done, duration, loop, steps.length]);

    return (
      <div
        ref={ref}
        className={cn("nova-multi-step-loader", className)}
        role="list"
        aria-busy={loading && !done}
        {...rest}
      >
        {steps.map((label, i) => {
          const state =
            i < current || (done && i <= current)
              ? "done"
              : i === current
              ? "active"
              : "pending";
          return (
            <div
              key={i}
              role="listitem"
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "nova-multi-step-loader__step",
                `nova-multi-step-loader__step--${state}`
              )}
            >
              <span className="nova-multi-step-loader__marker" aria-hidden="true">
                {state === "done" ? (
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : state === "active" ? (
                  reduced ? (
                    <span className="nova-multi-step-loader__dot" />
                  ) : (
                    <span className="nova-multi-step-loader__spinner" />
                  )
                ) : (
                  <span className="nova-multi-step-loader__dot" />
                )}
              </span>
              <span className="nova-multi-step-loader__label">{label}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
