import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./TextGenerateEffect.css";

export interface TextGenerateEffectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The full text to "generate". */
  text: string;
  /** Stagger (ms) between each word appearing. Defaults `120`. */
  stagger?: number;
  /** Fade/blur duration (ms) per word. Defaults `600`. */
  duration?: number;
  /** Blur the words in as they appear. Defaults `true`. */
  blur?: boolean;
  /**
   * Start when scrolled into view (`true`) or immediately on mount (`false`).
   * Defaults `false`.
   */
  onView?: boolean;
}

/**
 * TextGenerateEffect — words fade (and optionally blur) in one-by-one, like an
 * AI streaming a response. Runs on mount, or when scrolled into view via
 * IntersectionObserver. SSR-safe (observer in an effect, cleaned up) and snaps
 * fully visible under reduced-motion.
 */
export const TextGenerateEffect = forwardRef<
  HTMLDivElement,
  TextGenerateEffectProps
>(function TextGenerateEffect(
  {
    text,
    stagger = 120,
    duration = 600,
    blur = true,
    onView = false,
    className,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(!onView);

  const setRefs = (node: HTMLDivElement | null) => {
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
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onView, reduced]);

  const words = text.split(/(\s+)/);

  return (
    <div
      ref={setRefs}
      className={cn(
        "nova-text-generate",
        active && "nova-text-generate--active",
        blur && "nova-text-generate--blur",
        className
      )}
      style={
        {
          "--nova-tg-duration": `${duration}ms`,
          ...style,
        } as React.CSSProperties
      }
      aria-label={text}
      {...rest}
    >
      <span aria-hidden="true">
        {words.map((word, i) =>
          /\s+/.test(word) ? (
            word
          ) : (
            <span
              key={i}
              className="nova-text-generate__word"
              style={{ transitionDelay: `${(i / 2) * stagger}ms` }}
            >
              {word}
            </span>
          )
        )}
      </span>
    </div>
  );
});
