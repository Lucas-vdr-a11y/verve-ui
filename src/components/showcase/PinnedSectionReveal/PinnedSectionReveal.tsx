import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./PinnedSectionReveal.css";

export interface PinnedStep {
  /** Stable key. */
  id: string | number;
  /** Step content (any node — heading, media, etc.). */
  children: React.ReactNode;
}

export interface PinnedSectionRevealProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The steps advanced through while the section is pinned. */
  steps: PinnedStep[];
  /** Optional sticky heading rendered above the panels. */
  heading?: React.ReactNode;
}

/**
 * PinnedSectionReveal — a tall section whose inner panel pins to the viewport
 * while scrolling advances a horizontal filmstrip through its steps; once the
 * last step is reached the section unpins and the page continues. A progress bar
 * and step dots track position.
 *
 * Scroll progress is read from the section's bounding box in a rAF-throttled
 * listener created in an effect with cleanup; SSR-safe (guards `window`). Under
 * reduced motion the section unpins and stacks the steps vertically.
 */
export const PinnedSectionReveal = forwardRef<
  HTMLDivElement,
  PinnedSectionRevealProps
>(function PinnedSectionReveal(
  { steps, heading, className, style, ...rest },
  ref
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      frame.current = null;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // total scrollable distance while pinned = section height - one viewport
      const total = rect.height - vh;
      const p = total > 0 ? -rect.top / total : 0;
      setProgress(p < 0 ? 0 : p > 1 ? 1 : p);
    };
    const schedule = () => {
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [reduced]);

  const count = steps.length;
  // active index from progress
  const activeIndex = Math.min(
    count - 1,
    Math.round(progress * (count - 1))
  );

  return (
    <div
      ref={mergeRefs(ref, wrapRef)}
      className={cn(
        "nova-pinned-section-reveal",
        reduced && "nova-pinned-section-reveal--static",
        className
      )}
      style={
        {
          "--nova-pinned-progress": progress,
          "--nova-pinned-count": count,
          // tall enough to give each step a viewport of scroll
          "--nova-pinned-height": `${count * 100}vh`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-pinned-section-reveal__sticky">
        {heading && (
          <div className="nova-pinned-section-reveal__heading">{heading}</div>
        )}
        <div className="nova-pinned-section-reveal__viewport">
          <div
            className="nova-pinned-section-reveal__track"
            style={
              {
                transform: reduced
                  ? undefined
                  : `translateX(calc(${activeIndex} * -100%))`,
              } as React.CSSProperties
            }
          >
            {steps.map((step, i) => (
              <div
                key={step.id}
                className="nova-pinned-section-reveal__step"
                data-active={i === activeIndex ? "" : undefined}
                aria-hidden={!reduced && i !== activeIndex}
              >
                {step.children}
              </div>
            ))}
          </div>
        </div>
        <div
          className="nova-pinned-section-reveal__dots"
          role="presentation"
        >
          {steps.map((step, i) => (
            <span
              key={step.id}
              className="nova-pinned-section-reveal__dot"
              data-active={i === activeIndex ? "" : undefined}
            />
          ))}
        </div>
        <div className="nova-pinned-section-reveal__bar" aria-hidden="true">
          <span className="nova-pinned-section-reveal__bar-fill" />
        </div>
      </div>
    </div>
  );
});

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
