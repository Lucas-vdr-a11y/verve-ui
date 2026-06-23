import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./TypingLoop.css";

export interface TypingLoopProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Phrases cycled through, typed then deleted in order. */
  phrases: string[];
  /** Per-character type speed, ms. Defaults `70`. */
  typeSpeed?: number;
  /** Per-character delete speed, ms. Defaults `40`. */
  deleteSpeed?: number;
  /** Pause once a phrase is fully typed, ms. Defaults `1400`. */
  holdMs?: number;
  /** Delay before the very first character types, ms. Defaults `0`. */
  startDelay?: number;
  /** Loop forever (`true`) or stop on the last phrase (`false`). Defaults `true`. */
  loop?: boolean;
  /** Show the blinking caret. Defaults `true`. */
  caret?: boolean;
}

type Phase = "start" | "typing" | "holding" | "deleting";

/**
 * TypingLoop — types and deletes through a list of phrases on a loop with a
 * blinking caret. Distinct from a single-string Typewriter: it cycles multiple
 * phrases with independent type / delete speeds and a configurable start delay.
 * Scheduling uses one chained setTimeout in an effect with cleanup; SSR-safe.
 * Under reduced motion the first phrase is shown in full with no animation.
 */
export const TypingLoop = forwardRef<HTMLSpanElement, TypingLoopProps>(
  function TypingLoop(
    {
      phrases,
      typeSpeed = 70,
      deleteSpeed = 40,
      holdMs = 1400,
      startDelay = 0,
      loop = true,
      caret = true,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (!phrases.length) return;

      if (reduced) {
        setText(phrases[0] ?? "");
        setDone(true);
        return;
      }

      let phraseIdx = 0;
      let charIdx = 0;
      let phase: Phase = "start";
      let active = true;

      const schedule = (fn: () => void, ms: number) => {
        timerRef.current = setTimeout(() => {
          if (active) fn();
        }, ms);
      };

      const step = () => {
        const phrase = phrases[phraseIdx] ?? "";
        switch (phase) {
          case "start":
            phase = "typing";
            schedule(step, startDelay);
            return;
          case "typing":
            charIdx += 1;
            setText(phrase.slice(0, charIdx));
            if (charIdx >= phrase.length) {
              phase = "holding";
              schedule(step, holdMs);
            } else {
              schedule(step, typeSpeed);
            }
            return;
          case "holding": {
            const isLast = phraseIdx === phrases.length - 1;
            if (isLast && !loop) {
              setDone(true);
              return;
            }
            phase = "deleting";
            schedule(step, deleteSpeed);
            return;
          }
          case "deleting":
            charIdx -= 1;
            setText(phrase.slice(0, Math.max(0, charIdx)));
            if (charIdx <= 0) {
              phraseIdx = (phraseIdx + 1) % phrases.length;
              phase = "typing";
              schedule(step, typeSpeed);
            } else {
              schedule(step, deleteSpeed);
            }
            return;
        }
      };

      setText("");
      setDone(false);
      step();

      return () => {
        active = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [phrases, typeSpeed, deleteSpeed, holdMs, startDelay, loop, reduced]);

    return (
      <span
        ref={ref}
        className={cn("nova-typing-loop", className)}
        aria-live="polite"
        {...rest}
      >
        <span className="nova-typing-loop__text">{text}</span>
        {caret && (
          <span
            aria-hidden="true"
            className={cn(
              "nova-typing-loop__caret",
              done && "nova-typing-loop__caret--idle"
            )}
          />
        )}
      </span>
    );
  }
);
