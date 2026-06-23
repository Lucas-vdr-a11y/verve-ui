import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ScrollReveal.css";

export type ScrollRevealAnimation =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "blur";

export interface ScrollRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Entrance style. Defaults `"slide-up"`. */
  animation?: ScrollRevealAnimation;
  /** Delay before this element reveals, ms. Defaults `0`. */
  delay?: number;
  /**
   * Per-child stagger, ms. When set, direct children are revealed in sequence
   * instead of the wrapper as a whole. Defaults `0` (reveal as one block).
   */
  stagger?: number;
  /** Fraction of the element visible before revealing (0–1). Defaults `0.15`. */
  threshold?: number;
  /** Reveal only once, then stop observing. Defaults `true`. */
  once?: boolean;
  /** Render as a different element type. Defaults `"div"`. */
  as?: React.ElementType;
  children?: React.ReactNode;
}

/**
 * Generic on-scroll reveal wrapper. Fades/slides/scales/blurs its child (or, in
 * `stagger` mode, each direct child in sequence) into view when it enters the
 * viewport.
 *
 * Visibility is detected with an IntersectionObserver, disconnected on unmount
 * (and after the first reveal when `once`). SSR-safe; respects reduced motion
 * via CSS (content shows immediately, no transform).
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  function ScrollReveal(
    {
      animation = "slide-up",
      delay = 0,
      stagger = 0,
      threshold = 0.15,
      once = true,
      as,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const localRef = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const Component = (as ?? "div") as React.ElementType;

    useEffect(() => {
      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        setVisible(true);
        return;
      }
      const el = localRef.current;
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

    return (
      <Component
        ref={mergeRefs(ref, localRef)}
        className={cn(
          "nova-scroll-reveal",
          `nova-scroll-reveal--${animation}`,
          stagger > 0 && "nova-scroll-reveal--stagger",
          visible && "nova-scroll-reveal--in",
          className
        )}
        style={
          {
            "--nova-scroll-reveal-delay": `${delay}ms`,
            "--nova-scroll-reveal-stagger": `${stagger}ms`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {stagger > 0
          ? wrapStaggerChildren(children)
          : children}
      </Component>
    );
  }
);

/** Wrap each child so CSS can apply an index-based stagger delay. */
function wrapStaggerChildren(children: React.ReactNode): React.ReactNode {
  return (
    Array.isArray(children) ? children : [children]
  ).map((child, i) => (
    <div
      key={i}
      className="nova-scroll-reveal__child"
      style={{ "--nova-scroll-reveal-i": i } as React.CSSProperties}
    >
      {child}
    </div>
  ));
}

/** Merge a forwarded ref with a local one. */
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
