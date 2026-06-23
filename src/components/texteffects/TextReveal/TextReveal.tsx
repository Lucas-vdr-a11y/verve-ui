import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./TextReveal.css";

export interface TextRevealProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to reveal. */
  text: string;
  /** Split into `"word"` or `"char"` units. Defaults `"word"`. */
  by?: "word" | "char";
  /** Stagger (ms) between successive units. Defaults `60`. */
  stagger?: number;
  /** Animation duration (ms) per unit. Defaults `500`. */
  duration?: number;
  /**
   * Reveal when scrolled into view (`true`) or immediately on mount (`false`).
   * Defaults `true`.
   */
  onView?: boolean;
  /** Replay each time it (re)enters the viewport. Defaults `false`. */
  repeat?: boolean;
}

function splitText(text: string, by: "word" | "char") {
  if (by === "char") return Array.from(text);
  // Keep the spaces as their own tokens so word spacing survives.
  return text.split(/(\s+)/);
}

/**
 * TextReveal — words or characters fade in and rise into place with a stagger,
 * either on mount or when scrolled into view via IntersectionObserver. SSR-safe
 * (observer lives in an effect) and snaps fully visible under reduced-motion.
 */
export const TextReveal = forwardRef<HTMLSpanElement, TextRevealProps>(
  function TextReveal(
    {
      text,
      by = "word",
      stagger = 60,
      duration = 500,
      onView = true,
      repeat = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLSpanElement | null>(null);
    const [active, setActive] = useState(!onView);

    const setRefs = (node: HTMLSpanElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      if (!onView || reduced) {
        setActive(true);
        return;
      }
      const node = innerRef.current;
      if (!node || typeof IntersectionObserver === "undefined") {
        setActive(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(true);
            if (!repeat) observer.disconnect();
          } else if (repeat) {
            setActive(false);
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [onView, repeat, reduced]);

    const tokens = splitText(text, by);
    let unitIndex = 0;

    return (
      <span
        ref={setRefs}
        className={cn(
          "nova-text-reveal",
          active && "nova-text-reveal--active",
          className
        )}
        style={
          {
            "--nova-text-reveal-duration": `${duration}ms`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {tokens.map((token, i) => {
          const isSpace = /^\s+$/.test(token);
          if (isSpace) {
            return (
              <span key={i} className="nova-text-reveal__space">
                {token}
              </span>
            );
          }
          const idx = unitIndex++;
          return (
            <span key={i} className="nova-text-reveal__unit">
              <span
                className="nova-text-reveal__inner"
                style={{ transitionDelay: `${idx * stagger}ms` }}
              >
                {token}
              </span>
            </span>
          );
        })}
      </span>
    );
  }
);
