import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./FallingText.css";

export interface FallingTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The text whose letters fall into place. */
  text: string;
  /** Per-letter stagger (ms). Defaults `60`. */
  stagger?: number;
  /** Run only once the element scrolls into view. Defaults `true`. */
  animateOnView?: boolean;
}

/**
 * FallingText — letters drop in from above with a gravity-and-bounce settle,
 * each offset by a stagger so the word assembles in sequence. Triggers on mount
 * or when the element scrolls into view (IntersectionObserver, disconnected on
 * cleanup); SSR-safe. Under reduced-motion the text appears in place with no
 * drop.
 */
export const FallingText = forwardRef<HTMLSpanElement, FallingTextProps>(
  function FallingText(
    { text, stagger = 60, animateOnView = true, className, style, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const [active, setActive] = useState(!animateOnView);

    useEffect(() => {
      if (reduced || typeof window === "undefined") {
        setActive(true);
        return;
      }
      if (!animateOnView) {
        setActive(true);
        return;
      }
      const el = rootRef.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        setActive(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActive(true);
              io.disconnect();
            }
          }
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [reduced, animateOnView]);

    return (
      <span
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "nova-falling-text",
          active && "nova-falling-text--active",
          className
        )}
        style={
          {
            "--nova-ft-stagger": `${stagger}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">
          {Array.from(text).map((ch, i) => (
            <span
              key={i}
              className="nova-falling-text__char"
              style={{ "--nova-ft-i": String(i) } as React.CSSProperties}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
