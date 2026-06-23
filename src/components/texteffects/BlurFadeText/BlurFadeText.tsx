import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./BlurFadeText.css";

export interface BlurFadeTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to animate. */
  text: string;
  /** Stagger (ms) between words. Defaults `120`. */
  stagger?: number;
  /** Duration (ms) per word. Defaults `600`. */
  duration?: number;
  /** Blur amount (px) words start from. Defaults `10`. */
  blur?: number;
  /** Trigger when scrolled into view. Defaults `true`. */
  onView?: boolean;
}

/**
 * BlurFadeText — each word blurs in and fades up with a stagger when scrolled
 * into view (or on mount). Uses IntersectionObserver inside an effect (SSR-safe)
 * and snaps to crisp, fully-visible text under reduced-motion.
 */
export const BlurFadeText = forwardRef<HTMLSpanElement, BlurFadeTextProps>(
  function BlurFadeText(
    {
      text,
      stagger = 120,
      duration = 600,
      blur = 10,
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

    const words = text.split(/(\s+)/);
    let wordIndex = 0;

    return (
      <span
        ref={setRefs}
        className={cn(
          "nova-blur-fade-text",
          active && "nova-blur-fade-text--active",
          className
        )}
        style={
          {
            "--nova-blur-fade-duration": `${duration}ms`,
            "--nova-blur-fade-blur": `${blur}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {words.map((token, i) => {
          if (/^\s+$/.test(token)) {
            return (
              <span key={i} className="nova-blur-fade-text__space">
                {token}
              </span>
            );
          }
          const idx = wordIndex++;
          return (
            <span
              key={i}
              className="nova-blur-fade-text__word"
              style={{ transitionDelay: `${idx * stagger}ms` }}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  }
);
