import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./StaggerReveal.css";

export type StaggerRevealSplit = "words" | "lines";
export type StaggerRevealEffect = "slide" | "fade" | "blur";

export interface StaggerRevealProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Plain text to split and reveal. */
  text: string;
  /** Split granularity. Defaults `"words"`. */
  split?: StaggerRevealSplit;
  /** Reveal style. Defaults `"slide"`. */
  effect?: StaggerRevealEffect;
  /** Per-token stagger in ms. Defaults `60`. */
  stagger?: number;
  /** Delay before the first token reveals, ms. Defaults `0`. */
  delay?: number;
  /** Fraction visible before revealing. Defaults `0.2`. */
  threshold?: number;
  /** Reveal only once. Defaults `true`. */
  once?: boolean;
  /** Rendered wrapper element. Defaults `"span"`. */
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
}

/**
 * StaggerReveal — splits text into words or lines and reveals each token in
 * sequence (slide / fade / blur) once the block scrolls into view. Visibility
 * is detected with an IntersectionObserver that disconnects on unmount (and
 * after the first reveal when `once`). Stagger is expressed as CSS variables so
 * the animation itself is GPU-driven. SSR-safe; reduced motion shows everything
 * immediately (handled in CSS).
 */
export const StaggerReveal = forwardRef<HTMLSpanElement, StaggerRevealProps>(
  function StaggerReveal(
    {
      text,
      split = "words",
      effect = "slide",
      stagger = 60,
      delay = 0,
      threshold = 0.2,
      once = true,
      as: Tag = "span",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const hostRef = useRef<HTMLSpanElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        setVisible(true);
        return;
      }
      const el = hostRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once) observer.disconnect();
            } else if (!once) {
              setVisible(false);
            }
          }
        },
        { threshold }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [threshold, once]);

    const tokens =
      split === "lines"
        ? text.split("\n")
        : text.split(/(\s+)/).filter((t) => t.length > 0);

    let revealIndex = 0;

    return (
      <Tag
        ref={mergeRefs(ref, hostRef)}
        className={cn(
          "nova-stagger-reveal",
          `nova-stagger-reveal--${effect}`,
          `nova-stagger-reveal--${split}`,
          visible && "nova-stagger-reveal--in",
          className
        )}
        style={
          {
            "--nova-stagger-reveal-step": `${stagger}ms`,
            "--nova-stagger-reveal-delay": `${delay}ms`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={text}
        {...rest}
      >
        {tokens.map((token, i) => {
          const isSpace = split === "words" && /^\s+$/.test(token);
          if (isSpace) {
            return (
              <span key={i} aria-hidden="true" className="nova-stagger-reveal__space">
                {token}
              </span>
            );
          }
          const idx = revealIndex++;
          return (
            <span
              key={i}
              aria-hidden="true"
              className="nova-stagger-reveal__token"
              style={
                { "--nova-stagger-reveal-i": idx } as React.CSSProperties
              }
            >
              <span className="nova-stagger-reveal__inner">{token}</span>
            </span>
          );
        })}
      </Tag>
    );
  }
);

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
