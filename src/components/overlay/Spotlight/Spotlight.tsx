import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Spotlight.css";

export type SpotlightTarget =
  | string
  | Element
  | null
  | React.RefObject<Element | null>;

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SpotlightProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the dim + cutout overlay is shown. Defaults to `true`. */
  open?: boolean;
  /** The element to highlight: a CSS selector, an Element, or a ref. */
  target: SpotlightTarget;
  /** Extra space around the target, in px. Defaults to `8`. */
  padding?: number;
  /** Corner radius of the cutout, in px. Defaults to `8`. */
  radius?: number;
  /** Called when the dimmed area (outside the cutout) is clicked. */
  onClickOutside?: () => void;
  /** Whether the cutout area lets pointer events reach the target. Defaults to `true`. */
  interactiveTarget?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

/** Resolves a SpotlightTarget to a live Element, or null. */
export function resolveSpotlightTarget(
  target: SpotlightTarget
): Element | null {
  if (!target) return null;
  if (typeof target === "string") {
    return canUseDOM() ? document.querySelector(target) : null;
  }
  if (target instanceof Element) return target;
  if ("current" in target) return target.current ?? null;
  return null;
}

/**
 * Spotlight — dims the page with a highlighted cutout around a target element.
 * The reusable primitive that Tour builds on. Tracks the target across
 * scroll/resize, portals to the body, and is SSR-safe.
 */
export const Spotlight = forwardRef<HTMLDivElement, SpotlightProps>(
  function Spotlight(
    {
      open = true,
      target,
      padding = 8,
      radius = 8,
      onClickOutside,
      interactiveTarget = true,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const [rect, setRect] = useState<SpotlightRect | null>(null);

    const measure = useCallback(() => {
      const el = resolveSpotlightTarget(target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - padding,
        left: r.left - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      });
    }, [target, padding]);

    // Track the target across scroll, resize, and layout shifts.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      measure();

      window.addEventListener("scroll", measure, true);
      window.addEventListener("resize", measure);

      let resizeObserver: ResizeObserver | undefined;
      const el = resolveSpotlightTarget(target);
      if (el && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(el);
      }

      // Re-measure on the next frame in case fonts/layout settle late.
      const raf = window.requestAnimationFrame(measure);

      return () => {
        window.removeEventListener("scroll", measure, true);
        window.removeEventListener("resize", measure);
        resizeObserver?.disconnect();
        window.cancelAnimationFrame(raf);
      };
    }, [open, target, measure]);

    if (!open || !canUseDOM()) return null;

    // Build a clip-path with an inner rounded rectangle "hole" via evenodd fill.
    // When there is no resolvable target we just dim the whole viewport.
    const cutoutStyle: CSSProperties = rect
      ? ({
          "--nova-spotlight-top": `${rect.top}px`,
          "--nova-spotlight-left": `${rect.left}px`,
          "--nova-spotlight-width": `${rect.width}px`,
          "--nova-spotlight-height": `${rect.height}px`,
          "--nova-spotlight-radius": `${radius}px`,
        } as CSSProperties)
      : {};

    const overlay = (
      <div
        ref={ref}
        className={cn(
          "nova-spotlight",
          rect && "nova-spotlight--has-target",
          className
        )}
        style={{ ...cutoutStyle, ...style }}
        {...rest}
      >
        {/* Dim layer. Click anywhere in the dim = "outside". */}
        <div
          className="nova-spotlight__backdrop"
          onClick={() => onClickOutside?.()}
        />
        {/* The hole. When interactive it ignores pointer events so the target
            beneath stays clickable; otherwise it blocks them. */}
        {rect && (
          <div
            className={cn(
              "nova-spotlight__cutout",
              interactiveTarget
                ? "nova-spotlight__cutout--interactive"
                : "nova-spotlight__cutout--blocking"
            )}
            aria-hidden="true"
            onClick={
              interactiveTarget ? undefined : () => onClickOutside?.()
            }
          />
        )}
        {children}
      </div>
    );

    return ReactDOM.createPortal(overlay, document.body);
  }
);
