import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import {
  Spotlight,
  resolveSpotlightTarget,
  type SpotlightTarget,
} from "../Spotlight/Spotlight";
import "./Tour.css";

export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  /** The element to highlight: a CSS selector, an Element, or a ref. */
  target: SpotlightTarget;
  /** Heading for the step card. */
  title?: ReactNode;
  /** Body content for the step card. */
  content: ReactNode;
  /** Where the card sits relative to the target. Defaults to `"bottom"`. */
  placement?: TourPlacement;
  /** Extra space around the highlighted target, in px. */
  padding?: number;
}

export interface TourProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  /** Whether the tour is active. */
  open: boolean;
  /** Ordered list of tour steps. */
  steps: TourStep[];
  /** Controlled current step index. */
  step?: number;
  /** Initial step index for uncontrolled usage. Defaults to `0`. */
  defaultStep?: number;
  /** Notified when the active step changes. */
  onStepChange?: (index: number) => void;
  /** Called when the user advances past the final step. */
  onFinish?: () => void;
  /** Called when the user skips the tour (Esc, skip button, click outside). */
  onSkip?: () => void;
  /** Close the tour when the dimmed area is clicked. Defaults to `false`. */
  closeOnClickOutside?: boolean;
  /** Default padding around targets, in px. Defaults to `8`. */
  padding?: number;
  /** Corner radius of the highlight, in px. Defaults to `8`. */
  radius?: number;
  /** Label for the back button. Defaults to `"Back"`. */
  backLabel?: string;
  /** Label for the next button. Defaults to `"Next"`. */
  nextLabel?: string;
  /** Label for the next button on the last step. Defaults to `"Done"`. */
  finishLabel?: string;
  /** Label for the skip button. Defaults to `"Skip"`. */
  skipLabel?: string;
  /** Render the step counter (e.g. "2 / 5"). Defaults to `true`. */
  showCounter?: boolean;
}

interface CardPosition {
  top: number;
  left: number;
  placement: TourPlacement;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const GAP = 12;

/** Computes the card position next to the target rect within the viewport. */
function computeCardPosition(
  targetRect: DOMRect,
  cardRect: { width: number; height: number },
  placement: TourPlacement
): CardPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { width: cw, height: ch } = cardRect;

  const clampX = (x: number) => Math.max(GAP, Math.min(x, vw - cw - GAP));
  const clampY = (y: number) => Math.max(GAP, Math.min(y, vh - ch - GAP));

  // Flip if there is not enough room on the requested side.
  let resolved = placement;
  if (placement === "bottom" && targetRect.bottom + GAP + ch > vh)
    resolved = "top";
  else if (placement === "top" && targetRect.top - GAP - ch < 0)
    resolved = "bottom";
  else if (placement === "right" && targetRect.right + GAP + cw > vw)
    resolved = "left";
  else if (placement === "left" && targetRect.left - GAP - cw < 0)
    resolved = "right";

  let top = 0;
  let left = 0;
  switch (resolved) {
    case "top":
      top = targetRect.top - ch - GAP;
      left = targetRect.left + targetRect.width / 2 - cw / 2;
      break;
    case "bottom":
      top = targetRect.bottom + GAP;
      left = targetRect.left + targetRect.width / 2 - cw / 2;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - ch / 2;
      left = targetRect.left - cw - GAP;
      break;
    case "right":
      top = targetRect.top + targetRect.height / 2 - ch / 2;
      left = targetRect.right + GAP;
      break;
  }

  return { top: clampY(top), left: clampX(left), placement: resolved };
}

/**
 * Tour — a guided onboarding flow. Highlights each step's target with a
 * Spotlight cutout and anchors a tooltip card with back/next/skip controls and
 * a step counter. Keyboard: Esc skips, ArrowRight/Left navigate. Portals to the
 * body, SSR-safe, with full listener cleanup.
 */
export const Tour = forwardRef<HTMLDivElement, TourProps>(function Tour(
  {
    open,
    steps,
    step: stepProp,
    defaultStep = 0,
    onStepChange,
    onFinish,
    onSkip,
    closeOnClickOutside = false,
    padding = 8,
    radius = 8,
    backLabel = "Back",
    nextLabel = "Next",
    finishLabel = "Done",
    skipLabel = "Skip",
    showCounter = true,
    className,
    ...rest
  },
  ref
) {
  const isControlled = stepProp !== undefined;
  const [internalStep, setInternalStep] = useState(defaultStep);
  const current = isControlled ? stepProp : internalStep;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPos, setCardPos] = useState<CardPosition | null>(null);

  const total = steps.length;
  const clampedIndex = Math.min(Math.max(current, 0), Math.max(total - 1, 0));
  const activeStep = steps[clampedIndex];
  const isFirst = clampedIndex === 0;
  const isLast = clampedIndex === total - 1;

  const goTo = useCallback(
    (index: number) => {
      if (!isControlled) setInternalStep(index);
      onStepChange?.(index);
    },
    [isControlled, onStepChange]
  );

  const next = useCallback(() => {
    if (isLast) {
      onFinish?.();
    } else {
      goTo(clampedIndex + 1);
    }
  }, [isLast, onFinish, goTo, clampedIndex]);

  const back = useCallback(() => {
    if (!isFirst) goTo(clampedIndex - 1);
  }, [isFirst, goTo, clampedIndex]);

  const skip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  // Position the card relative to the active target.
  const reposition = useCallback(() => {
    if (!canUseDOM() || !activeStep) return;
    const el = resolveSpotlightTarget(activeStep.target);
    const card = cardRef.current;
    if (!card) return;
    const cardRect = { width: card.offsetWidth, height: card.offsetHeight };

    if (!el) {
      // No target: center the card.
      setCardPos({
        top: window.innerHeight / 2 - cardRect.height / 2,
        left: window.innerWidth / 2 - cardRect.width / 2,
        placement: activeStep.placement ?? "bottom",
      });
      return;
    }
    const targetRect = el.getBoundingClientRect();
    setCardPos(
      computeCardPosition(
        targetRect,
        cardRect,
        activeStep.placement ?? "bottom"
      )
    );
  }, [activeStep]);

  // Scroll the target into view when the step changes.
  useEffect(() => {
    if (!open || !canUseDOM() || !activeStep) return;
    const el = resolveSpotlightTarget(activeStep.target);
    if (el && "scrollIntoView" in el) {
      el.scrollIntoView({ block: "center", inline: "center" });
    }
  }, [open, activeStep, clampedIndex]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, clampedIndex, reposition]);

  // Reposition on scroll/resize.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    const raf = window.requestAnimationFrame(reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      window.cancelAnimationFrame(raf);
    };
  }, [open, reposition]);

  // Keyboard controls.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, skip, next, back]);

  if (!open || !canUseDOM() || total === 0) return null;

  const cardStyle: CSSProperties = cardPos
    ? { top: cardPos.top, left: cardPos.left, visibility: "visible" }
    : { top: 0, left: 0, visibility: "hidden" };

  const overlay = (
    <div ref={ref} className={cn("nova-tour", className)} {...rest}>
      <Spotlight
        target={activeStep?.target ?? null}
        padding={activeStep?.padding ?? padding}
        radius={radius}
        interactiveTarget={false}
        onClickOutside={closeOnClickOutside ? skip : undefined}
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={
          typeof activeStep?.title === "string"
            ? activeStep.title
            : "Tour step"
        }
        className={cn(
          "nova-tour__card",
          cardPos && `nova-tour__card--${cardPos.placement}`
        )}
        style={cardStyle}
      >
        {activeStep?.title != null && (
          <h2 className="nova-tour__title">{activeStep.title}</h2>
        )}
        <div className="nova-tour__content">{activeStep?.content}</div>

        <div className="nova-tour__footer">
          {showCounter && (
            <span className="nova-tour__counter" aria-live="polite">
              {clampedIndex + 1} / {total}
            </span>
          )}
          <button
            type="button"
            className={cn("nova-tour__skip", "nova-focusable")}
            onClick={skip}
          >
            {skipLabel}
          </button>
          <div className="nova-tour__actions">
            {!isFirst && (
              <button
                type="button"
                className={cn(
                  "nova-tour__btn",
                  "nova-tour__btn--ghost",
                  "nova-focusable"
                )}
                onClick={back}
              >
                {backLabel}
              </button>
            )}
            <button
              type="button"
              className={cn(
                "nova-tour__btn",
                "nova-tour__btn--primary",
                "nova-focusable"
              )}
              onClick={next}
            >
              {isLast ? finishLabel : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
});
