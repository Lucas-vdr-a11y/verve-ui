import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./FlipText.css";

export interface FlipTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to flip in. */
  text: string;
  /** Stagger (ms) between characters. Defaults `60`. */
  stagger?: number;
  /** Duration (ms) of each character's flip. Defaults `600`. */
  duration?: number;
  /** Trigger when scrolled into view (`true`) or on mount (`false`). Defaults `true`. */
  onView?: boolean;
}

/**
 * FlipText — each character flips into place around the 3D X-axis with a
 * stagger, like falling tiles. Triggered on mount or scroll-into-view
 * (IntersectionObserver in an effect, SSR-safe). Under reduced-motion the text
 * is shown flat with no flip.
 */
export const FlipText = forwardRef<HTMLSpanElement, FlipTextProps>(
  function FlipText(
    {
      text,
      stagger = 60,
      duration = 600,
      onView = true,
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
            observer.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [onView, reduced]);

    const chars = Array.from(text);

    return (
      <span
        ref={setRefs}
        className={cn(
          "nova-flip-text",
          active && "nova-flip-text--active",
          className
        )}
        style={
          {
            "--nova-flip-text-duration": `${duration}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={text}
        {...rest}
      >
        {chars.map((ch, i) => (
          <span
            key={i}
            className="nova-flip-text__char"
            aria-hidden="true"
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    );
  }
);
