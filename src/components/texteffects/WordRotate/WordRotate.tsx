import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./WordRotate.css";

export type WordRotateTransition = "slide" | "flip";

export interface WordRotateProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Words to cycle through in place. */
  words: string[];
  /** Milliseconds each word stays visible. Defaults `2200`. */
  interval?: number;
  /** Enter/exit transition style. Defaults `"slide"`. */
  transition?: WordRotateTransition;
  /** Transition duration (ms). Defaults `420`. */
  duration?: number;
}

/**
 * WordRotate — cycles through a list of words in place, each sliding or flipping
 * out as the next enters (great for "Build ___ faster"). Driven by a single
 * timer in an effect with cleanup; SSR-safe and, under reduced-motion, swaps
 * words instantly with no transform.
 */
export const WordRotate = forwardRef<HTMLSpanElement, WordRotateProps>(
  function WordRotate(
    {
      words,
      interval = 2200,
      transition = "slide",
      duration = 420,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (words.length <= 1) return;
      const timer = setInterval(() => {
        setIndex((i) => (i + 1) % words.length);
      }, Math.max(duration, interval));
      return () => clearInterval(timer);
    }, [words.length, interval, duration]);

    const current = words[index] ?? "";

    return (
      <span
        ref={ref}
        className={cn(
          "nova-word-rotate",
          `nova-word-rotate--${transition}`,
          className
        )}
        style={
          {
            "--nova-word-rotate-duration": `${duration}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-live="polite"
        {...rest}
      >
        {/* key change retriggers the enter animation for each new word */}
        <span key={reduced ? "static" : index} className="nova-word-rotate__word">
          {current}
        </span>
      </span>
    );
  }
);
