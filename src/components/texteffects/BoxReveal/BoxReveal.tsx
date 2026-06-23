import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./BoxReveal.css";

export type BoxRevealDirection = "left" | "right" | "up" | "down";

export interface BoxRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Color of the wiping box. Defaults `var(--nova-primary)`. */
  boxColor?: string;
  /** Direction the box wipes from. Defaults `"left"`. */
  direction?: BoxRevealDirection;
  /** Total animation duration (ms). Defaults `700`. */
  duration?: number;
  /** Trigger when scrolled into view. Defaults `true`. */
  onView?: boolean;
}

/**
 * BoxReveal — a colored box wipes across the content then retracts, uncovering
 * the text underneath (the classic Magic-UI reveal). Triggered on scroll-into-
 * view via IntersectionObserver in an effect (SSR-safe). Under reduced-motion
 * the content is shown immediately with no box sweep.
 */
export const BoxReveal = forwardRef<HTMLDivElement, BoxRevealProps>(
  function BoxReveal(
    {
      boxColor,
      direction = "left",
      duration = 700,
      onView = true,
      className,
      style,
      children,
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
        { threshold: 0.3 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [onView, reduced]);

    const cssVars = {
      "--nova-box-reveal-duration": `${duration}ms`,
      ...(boxColor != null ? { "--nova-box-reveal-color": boxColor } : null),
    } as React.CSSProperties;

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-box-reveal",
          `nova-box-reveal--${direction}`,
          active && "nova-box-reveal--active",
          className
        )}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        <span className="nova-box-reveal__content">{children}</span>
        <span className="nova-box-reveal__box" aria-hidden="true" />
      </div>
    );
  }
);
