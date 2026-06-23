import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Transition.css";

/** Built-in transition presets. Custom hooks can be supplied instead. */
export type TransitionPreset = "fade" | "slide" | "scale" | "collapse";

/** Phase of the transition lifecycle, exposed via `data-transition`. */
export type TransitionStatus =
  | "enter"
  | "entering"
  | "entered"
  | "exit"
  | "exiting"
  | "exited";

export interface TransitionClassNames {
  /** Applied for one frame at the start of entering (the "from" state). */
  enter?: string;
  /** Applied while entering (the "to" state, transition active). */
  enterActive?: string;
  /** Applied for one frame at the start of exiting (the "from" state). */
  exit?: string;
  /** Applied while exiting (the "to" state, transition active). */
  exitActive?: string;
}

// `onTransitionEnd` from native props clashes with our managed handler.
type DivPropsBase = Omit<React.HTMLAttributes<HTMLDivElement>, "onTransitionEnd">;

export interface TransitionProps extends DivPropsBase {
  /** Drives the transition: `true` enters/keeps mounted, `false` exits then unmounts. */
  in: boolean;
  /** Run the enter transition on initial mount when `in` is already `true`. */
  appear?: boolean;
  /** When `false`, the child is removed from the DOM once exited. Defaults `false`. */
  mountOnEnter?: boolean;
  /** Keep the child mounted (hidden) instead of unmounting after exit. */
  unmountOnExit?: boolean;
  /** Duration in ms. Overrides the token-driven CSS duration for the JS fallback timer. */
  duration?: number;
  /** CSS easing override applied inline. */
  easing?: string;
  /** A named preset that ships its own enter/exit CSS. */
  preset?: TransitionPreset;
  /** Custom enter/exit class hooks. Takes precedence over `preset` styling. */
  classNames?: TransitionClassNames;
  /** Fired after the enter transition completes. */
  onEntered?: () => void;
  /** Fired after the exit transition completes (before unmount). */
  onExited?: () => void;
  children?: React.ReactNode;
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Core mount/unmount transition primitive. Keeps its child mounted through the
 * exit transition, then unmounts. Drives enter/exit via data attributes +
 * class hooks; completion is detected with `transitionend` and a safety timer.
 *
 * SSR-safe: no window/document access during render; timers/listeners are
 * registered in effects and cleaned up. Honors reduced motion by snapping.
 */
export const Transition = forwardRef<HTMLDivElement, TransitionProps>(
  function Transition(
    {
      in: inProp,
      appear = false,
      mountOnEnter = false,
      unmountOnExit = false,
      duration,
      easing,
      preset,
      classNames,
      onEntered,
      onExited,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();

    // Whether the node should exist in the DOM at all.
    const [mounted, setMounted] = useState(inProp ? true : !mountOnEnter);
    const [status, setStatus] = useState<TransitionStatus>(
      inProp ? (appear ? "exited" : "entered") : "exited"
    );

    const nodeRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    // True on the very first effect run, used to gate `appear`.
    const firstRef = useRef(true);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        nodeRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const clearTimers = useCallback(() => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current != null) {
        if (typeof cancelAnimationFrame !== "undefined")
          cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    // Drive the lifecycle whenever `in` changes (and on first mount for appear).
    useIsoLayoutEffect(() => {
      const isFirst = firstRef.current;
      firstRef.current = false;

      if (inProp) {
        if (!mounted) {
          setMounted(true);
          return; // re-run after mount to start the enter transition
        }
        // Skip animating on first render unless `appear` requested it.
        if (isFirst && !appear) {
          setStatus("entered");
          return;
        }
        setStatus("enter");
      } else {
        if (!mounted) return;
        if (isFirst) {
          setStatus("exited");
          return;
        }
        setStatus("exit");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProp, mounted]);

    // Transition the "enter"/"exit" pre-states into their active states on the
    // next frame so the browser registers a transition.
    useIsoLayoutEffect(() => {
      if (status !== "enter" && status !== "exit") return;

      const finishAfter = (next: TransitionStatus) => {
        clearTimers();
        const ms = reduced ? 0 : resolveDuration(duration, nodeRef.current);
        timerRef.current = setTimeout(() => finalize(next), ms + 30);
      };

      if (status === "enter") {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => {
            setStatus("entering");
            finishAfter("entered");
          });
        });
      } else {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => {
            setStatus("exiting");
            finishAfter("exited");
          });
        });
      }

      return clearTimers;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, reduced, duration]);

    const finalize = useCallback(
      (next: TransitionStatus) => {
        clearTimers();
        setStatus(next);
        if (next === "entered") {
          onEntered?.();
        } else if (next === "exited") {
          onExited?.();
          if (!unmountOnExit) setMounted(false);
        }
      },
      [clearTimers, onEntered, onExited, unmountOnExit]
    );

    const handleTransitionEnd = useCallback(
      (event: React.TransitionEvent<HTMLDivElement>) => {
        if (event.target !== nodeRef.current) return; // ignore bubbled child events
        if (status === "entering") finalize("entered");
        else if (status === "exiting") finalize("exited");
      },
      [status, finalize]
    );

    if (!mounted) return null;

    const isEntering = status === "enter" || status === "entering";
    const isExiting = status === "exit" || status === "exiting";
    const active = status === "entering" || status === "exiting";

    const custom = classNames;
    const presetClass = preset ? `nova-transition--${preset}` : undefined;

    const phaseClasses = custom
      ? cn(
          isEntering && custom.enter,
          status === "entering" && custom.enterActive,
          isExiting && custom.exit,
          status === "exiting" && custom.exitActive
        )
      : undefined;

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-transition",
          !custom && presetClass,
          phaseClasses,
          className
        )}
        data-transition={status}
        data-enter={isEntering ? "" : undefined}
        data-exit={isExiting ? "" : undefined}
        data-active={active ? "" : undefined}
        onTransitionEnd={handleTransitionEnd}
        style={{
          ...(easing ? ({ "--nova-transition-ease": easing } as React.CSSProperties) : null),
          ...(duration != null
            ? ({ "--nova-transition-duration": `${duration}ms` } as React.CSSProperties)
            : null),
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

/** Resolve the timer duration: explicit prop, else read the computed CSS, else fallback. */
function resolveDuration(
  duration: number | undefined,
  node: HTMLElement | null
): number {
  if (duration != null) return duration;
  if (node && typeof window !== "undefined" && window.getComputedStyle) {
    const raw = window.getComputedStyle(node).transitionDuration;
    const parsed = parseCssTime(raw);
    if (parsed > 0) return parsed;
  }
  return 200;
}

function parseCssTime(value: string): number {
  // transitionDuration may be a comma list ("200ms, 200ms"); take the max.
  let max = 0;
  for (const part of value.split(",")) {
    const t = part.trim();
    if (!t) continue;
    const num = parseFloat(t);
    if (Number.isNaN(num)) continue;
    const ms = t.endsWith("ms") ? num : num * 1000;
    if (ms > max) max = ms;
  }
  return max;
}
