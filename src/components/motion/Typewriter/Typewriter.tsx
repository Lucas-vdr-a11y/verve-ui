import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Typewriter.css";

export interface TypewriterProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** A single string, or an array of strings to cycle through. */
  text: string | string[];
  /** Milliseconds between typed characters. Defaults `55`. */
  speed?: number;
  /** Milliseconds between deleted characters. Defaults `30`. */
  deleteSpeed?: number;
  /** Pause (ms) once a string is fully typed before deleting. Defaults `1500`. */
  pauseDuration?: number;
  /** Pause (ms) after a string is deleted before typing the next. Defaults `400`. */
  deletePause?: number;
  /**
   * Whether to loop through the strings. With a single string + `loop`, it
   * retypes after deleting. Defaults `true` when `text` is an array, else `false`.
   */
  loop?: boolean;
  /** Show a caret. Defaults `true`. */
  caret?: boolean;
  /** Character used for the caret. Defaults `"|"`. */
  caretChar?: string;
  /** Delay (ms) before typing begins. Defaults `0`. */
  startDelay?: number;
  /** Called whenever a full string finishes typing. */
  onTypingDone?: (text: string) => void;
}

type Phase = "typing" | "pausing" | "deleting" | "waiting";

/**
 * Types out text, or cycles through an array of strings, optionally deleting and
 * looping. Driven by `setTimeout` scheduled in an effect with full cleanup; the
 * caret blinks via CSS. SSR-safe (no DOM access on the server) and snaps to the
 * full (last) string under reduced motion.
 */
export const Typewriter = forwardRef<HTMLSpanElement, TypewriterProps>(
  function Typewriter(
    {
      text,
      speed = 55,
      deleteSpeed = 30,
      pauseDuration = 1500,
      deletePause = 400,
      loop,
      caret = true,
      caretChar = "|",
      startDelay = 0,
      onTypingDone,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const strings = Array.isArray(text) ? text : [text];
    const shouldLoop = loop ?? Array.isArray(text);

    // Snapshot under reduced motion: render the last string fully, no animation.
    const snapped = reduced ? strings[strings.length - 1] ?? "" : null;

    const [display, setDisplay] = useState("");
    const [index, setIndex] = useState(0); // which string
    const [phase, setPhase] = useState<Phase>("typing");

    // Keep callback fresh without re-running the scheduler effect.
    const doneRef = useRef(onTypingDone);
    useEffect(() => {
      doneRef.current = onTypingDone;
    }, [onTypingDone]);

    useEffect(() => {
      if (reduced) return; // snapped render, nothing to schedule

      const current = strings[index] ?? "";
      let timer: ReturnType<typeof setTimeout>;

      if (phase === "waiting") {
        timer = setTimeout(() => setPhase("typing"), Math.max(0, startDelay));
      } else if (phase === "typing") {
        if (display.length < current.length) {
          timer = setTimeout(
            () => setDisplay(current.slice(0, display.length + 1)),
            speed
          );
        } else {
          doneRef.current?.(current);
          const isLast = index === strings.length - 1;
          if (!shouldLoop && isLast) return; // settle on the final string
          timer = setTimeout(() => setPhase("deleting"), pauseDuration);
        }
      } else if (phase === "deleting") {
        if (display.length > 0) {
          timer = setTimeout(
            () => setDisplay(current.slice(0, display.length - 1)),
            deleteSpeed
          );
        } else {
          const next = (index + 1) % strings.length;
          timer = setTimeout(() => {
            setIndex(next);
            setPhase("typing");
          }, deletePause);
        }
      }

      return () => clearTimeout(timer);
    }, [
      reduced,
      display,
      phase,
      index,
      strings,
      speed,
      deleteSpeed,
      pauseDuration,
      deletePause,
      startDelay,
      shouldLoop,
    ]);

    // Begin with the start delay (skipped if zero) on first mount.
    useEffect(() => {
      if (startDelay > 0) setPhase("waiting");
      // run once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <span
        ref={ref}
        className={cn("nova-typewriter", className)}
        {...rest}
      >
        <span className="nova-typewriter__text">
          {snapped ?? display}
        </span>
        {caret && (
          <span
            className="nova-typewriter__caret"
            aria-hidden="true"
            data-static={reduced ? "" : undefined}
          >
            {caretChar}
          </span>
        )}
      </span>
    );
  }
);
