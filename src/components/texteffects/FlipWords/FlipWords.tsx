import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./FlipWords.css";

export interface FlipWordsProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The words to cycle through. */
  words: string[];
  /** Time (ms) each word stays before flipping. Defaults `2400`. */
  interval?: number;
  /** Flip duration (ms). Defaults `600`. */
  duration?: number;
}

/**
 * FlipWords — cycles through a list of words with a 3D spring flip, e.g.
 * "make it ___" → beautiful / modern / fast. Driven by a single timer in an
 * effect (cleaned up on unmount); SSR-safe. Under reduced-motion the words
 * still cycle but cross-fade instead of flipping.
 */
export const FlipWords = forwardRef<HTMLSpanElement, FlipWordsProps>(
  function FlipWords(
    { words, interval = 2400, duration = 600, className, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (typeof window === "undefined" || words.length <= 1) return;
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % words.length);
      }, interval);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [words.length, interval]);

    const current = words[index] ?? "";

    return (
      <span
        ref={ref}
        className={cn(
          "nova-flip-words",
          reduced && "nova-flip-words--reduced",
          className
        )}
        style={
          {
            "--nova-flip-duration": `${duration}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-live="polite"
        {...rest}
      >
        <span
          key={index}
          className="nova-flip-words__word"
          aria-hidden="false"
        >
          {Array.from(current).map((ch, i) => (
            <span
              key={i}
              className="nova-flip-words__char"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
