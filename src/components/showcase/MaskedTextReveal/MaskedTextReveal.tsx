import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./MaskedTextReveal.css";

export type MaskedTextRevealDirection = "left" | "right" | "up" | "down";

export interface MaskedTextRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading text (or rich children) to reveal. */
  children: React.ReactNode;
  /** Heading element for semantics. Defaults `"h2"`. */
  as?: "h1" | "h2" | "h3" | "div";
  /** Direction the mask wipes from. Defaults `"left"`. */
  direction?: MaskedTextRevealDirection;
  /** Fraction visible before revealing. Defaults `0.4`. */
  threshold?: number;
  /** Reveal only once. Defaults `true`. */
  once?: boolean;
}

const HIDDEN: Record<MaskedTextRevealDirection, string> = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  up: "inset(100% 0 0 0)",
  down: "inset(0 0 100% 0)",
};

/**
 * MaskedTextReveal — a heading uncovered through a wiping clip-path mask as it
 * scrolls into view. Visibility is detected with an IntersectionObserver
 * (disconnected on unmount and after the first reveal when `once`); the wipe
 * itself is a pure CSS clip-path transition. SSR-safe; under reduced motion the
 * heading is shown fully (handled in CSS).
 */
export const MaskedTextReveal = forwardRef<
  HTMLDivElement,
  MaskedTextRevealProps
>(function MaskedTextReveal(
  {
    children,
    as: Tag = "h2",
    direction = "left",
    threshold = 0.4,
    once = true,
    className,
    style,
    ...rest
  },
  ref
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
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

  return (
    <div
      ref={mergeRefs(ref, hostRef)}
      className={cn(
        "nova-masked-text-reveal",
        visible && "nova-masked-text-reveal--in",
        className
      )}
      style={
        {
          "--nova-masked-text-reveal-hidden": HIDDEN[direction],
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <Tag className="nova-masked-text-reveal__heading">{children}</Tag>
    </div>
  );
});

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
