import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./TrueFocus.css";

export interface TrueFocusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Sentence whose words are focused one at a time. */
  text: string;
  /** Milliseconds each word stays focused. Defaults `1600`. */
  interval?: number;
  /** Blur amount (px) applied to unfocused words. Defaults `5`. */
  blur?: number;
}

/**
 * TrueFocus — steps through a sentence focusing one word at a time: the active
 * word snaps sharp inside a brand outline box while the rest stay blurred,
 * advancing on a timer (the reactbits TrueFocus). A single interval drives the
 * index; cleanup on unmount, SSR-safe. Under reduced-motion no blur is applied
 * and the words do not cycle.
 */
export const TrueFocus = forwardRef<HTMLSpanElement, TrueFocusProps>(
  function TrueFocus(
    { text, interval = 1600, blur = 5, className, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const words = text.split(/\s+/).filter(Boolean);
    const [active, setActive] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (reduced || typeof window === "undefined" || words.length <= 1) return;
      timerRef.current = setInterval(() => {
        setActive((i) => (i + 1) % words.length);
      }, interval);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [reduced, interval, words.length]);

    return (
      <span
        ref={ref}
        className={cn(
          "nova-true-focus",
          reduced && "nova-true-focus--static",
          className
        )}
        style={
          { "--nova-tf-blur": `${blur}px`, ...style } as React.CSSProperties
        }
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">
          {words.map((word, i) => (
            <span
              key={i}
              className={cn(
                "nova-true-focus__word",
                i === active && "nova-true-focus__word--focused"
              )}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
