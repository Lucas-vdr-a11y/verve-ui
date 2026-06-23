import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./RotatingText.css";

export interface RotatingTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The list of words to cycle through. */
  words: string[];
  /** Milliseconds each word stays fully shown. Defaults `2000`. */
  interval?: number;
  /** Per-character stagger (ms) for enter/exit. Defaults `35`. */
  stagger?: number;
}

/**
 * RotatingText — cycles a list of words, with each character of the outgoing
 * word sliding/fading out and each character of the incoming word sliding/fading
 * in on a per-letter stagger (distinct from a plain word-swap). A single timer
 * advances the index; cleanup on unmount, SSR-safe. Under reduced-motion the
 * words swap instantly with no per-letter choreography.
 */
export const RotatingText = forwardRef<HTMLSpanElement, RotatingTextProps>(
  function RotatingText(
    { words, interval = 2000, stagger = 35, className, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const safeWords = words.length ? words : [""];

    useEffect(() => {
      if (reduced || typeof window === "undefined" || safeWords.length <= 1) {
        return;
      }
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % safeWords.length);
      }, interval);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [reduced, interval, safeWords.length]);

    const word = safeWords[index] ?? "";
    const chars = Array.from(word);

    return (
      <span
        ref={ref}
        className={cn("nova-rotating-text", className)}
        style={
          {
            "--nova-rt-stagger": `${stagger}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={safeWords.join(", ")}
        {...rest}
      >
        <span
          key={index}
          className="nova-rotating-text__word"
          aria-hidden="true"
        >
          {chars.map((ch, i) => (
            <span
              key={i}
              className="nova-rotating-text__char"
              style={
                { "--nova-rt-i": String(i) } as React.CSSProperties
              }
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
