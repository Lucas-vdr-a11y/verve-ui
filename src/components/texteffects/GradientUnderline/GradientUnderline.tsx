import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./GradientUnderline.css";

export interface GradientUnderlineProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** What draws the underline. Defaults `"view"`. */
  trigger?: "view" | "hover";
  /** Seconds for the underline draw. Defaults `0.7`. */
  duration?: number;
}

/**
 * GradientUnderline — wraps a heading/phrase with an animated gradient
 * underline that draws in from the left (on view or hover) and then keeps
 * shimmering. The draw is triggered via IntersectionObserver (view) or pointer
 * (hover); observer disconnected on cleanup, SSR-safe. Under reduced-motion the
 * underline is shown full-width with no draw or shimmer.
 */
export const GradientUnderline = forwardRef<
  HTMLSpanElement,
  GradientUnderlineProps
>(function GradientUnderline(
  { trigger = "view", duration = 0.7, className, style, children, onMouseEnter, ...rest },
  ref
) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (reduced || typeof window === "undefined") {
      setDrawn(true);
      return;
    }
    if (trigger !== "view") return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, trigger]);

  const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    if (trigger === "hover") setDrawn(true);
    onMouseEnter?.(e);
  };

  return (
    <span
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "nova-gradient-underline",
        drawn && "nova-gradient-underline--drawn",
        className
      )}
      style={
        {
          "--nova-gu-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      <span className="nova-gradient-underline__text">{children}</span>
      <span className="nova-gradient-underline__line" aria-hidden="true" />
    </span>
  );
});
