import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./FeatureSteps.css";

export interface FeatureStep {
  /** Step heading. */
  title: React.ReactNode;
  /** Supporting copy. */
  description?: React.ReactNode;
  /** Media image URL shown in the panel for this step. */
  image?: string;
  /** Arbitrary media node (used instead of `image` when provided). */
  media?: React.ReactNode;
}

export interface FeatureStepsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The numbered steps. */
  steps: FeatureStep[];
  /** Milliseconds each step stays active before auto-advancing. Defaults `4000`. */
  interval?: number;
  /** Auto-advance through steps. Defaults `true`. */
  autoplay?: boolean;
  /** Controlled active index. */
  activeIndex?: number;
  /** Fired when the active step changes (click or auto-advance). */
  onActiveChange?: (index: number) => void;
  /** Place the media panel on this side. Defaults `"right"`. */
  mediaSide?: "left" | "right";
}

/**
 * A feature showcase: a vertical numbered step list paired with a large media
 * panel that crossfades as steps advance, each step showing a progress bar that
 * fills over the interval. Auto-advances (pausable by controlling `activeIndex`)
 * and is clickable. Reduced motion disables the progress fill + autoplay.
 */
export const FeatureSteps = forwardRef<HTMLDivElement, FeatureStepsProps>(
  function FeatureSteps(
    {
      steps,
      interval = 4000,
      autoplay = true,
      activeIndex: activeProp,
      onActiveChange,
      mediaSide = "right",
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = activeProp !== undefined;
    const [internal, setInternal] = useState(0);
    const active = isControlled ? activeProp : internal;
    const onActiveChangeRef = useRef(onActiveChange);
    onActiveChangeRef.current = onActiveChange;

    const setActive = (next: number) => {
      if (!isControlled) setInternal(next);
      onActiveChangeRef.current?.(next);
    };

    useEffect(() => {
      if (!autoplay || reduced || isControlled || steps.length <= 1) return;
      const id = window.setTimeout(() => {
        setInternal((prev) => {
          const next = (prev + 1) % steps.length;
          onActiveChangeRef.current?.(next);
          return next;
        });
      }, interval);
      return () => window.clearTimeout(id);
    }, [autoplay, reduced, isControlled, interval, steps.length, active]);

    const current = steps[active];

    return (
      <div
        ref={ref}
        className={cn(
          "nova-feature-steps",
          `nova-feature-steps--media-${mediaSide}`,
          className
        )}
        {...rest}
      >
        <ol className="nova-feature-steps__list">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <li
                key={i}
                className={cn(
                  "nova-feature-steps__step",
                  isActive && "nova-feature-steps__step--active"
                )}
              >
                <button
                  type="button"
                  className="nova-feature-steps__trigger"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => setActive(i)}
                >
                  <span className="nova-feature-steps__number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="nova-feature-steps__text">
                    <span className="nova-feature-steps__title">
                      {step.title}
                    </span>
                    {step.description && (
                      <span className="nova-feature-steps__desc">
                        {step.description}
                      </span>
                    )}
                    <span
                      className="nova-feature-steps__progress"
                      aria-hidden="true"
                    >
                      <span
                        className="nova-feature-steps__progress-bar"
                        style={
                          {
                            "--nova-fs-duration": `${interval}ms`,
                          } as React.CSSProperties
                        }
                        data-active={isActive ? "true" : undefined}
                        data-animate={
                          isActive && autoplay && !reduced && !isControlled
                            ? "true"
                            : undefined
                        }
                        // re-key so the fill restarts each time the step activates
                        key={`${i}-${active}`}
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="nova-feature-steps__panel">
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn(
                "nova-feature-steps__media",
                i === active && "nova-feature-steps__media--active"
              )}
              aria-hidden={i === active ? undefined : "true"}
            >
              {step.media
                ? step.media
                : step.image && (
                    <img
                      className="nova-feature-steps__image"
                      src={step.image}
                      alt=""
                      loading="lazy"
                    />
                  )}
            </div>
          ))}
          {!current?.media && !current?.image && (
            <div className="nova-feature-steps__placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    );
  }
);
