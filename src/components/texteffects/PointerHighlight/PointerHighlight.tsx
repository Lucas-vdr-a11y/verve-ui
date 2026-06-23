import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./PointerHighlight.css";

export interface PointerHighlightProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** What draws the highlight box. Defaults `"view"`. */
  trigger?: "view" | "hover";
  /** Seconds for the box to draw. Defaults `0.6`. */
  duration?: number;
}

/**
 * PointerHighlight — wraps a phrase and, on view or hover, draws a brand
 * highlighter box around it with small corner brackets (the Aceternity
 * pointer-highlight). View triggering uses IntersectionObserver (disconnected
 * on cleanup); SSR-safe. Under reduced-motion the box is shown immediately with
 * no draw animation.
 */
export const PointerHighlight = forwardRef<
  HTMLSpanElement,
  PointerHighlightProps
>(function PointerHighlight(
  { trigger = "view", duration = 0.6, className, style, children, onMouseEnter, ...rest },
  ref
) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced || typeof window === "undefined") {
      setShown(true);
      return;
    }
    if (trigger !== "view") return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, trigger]);

  const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    if (trigger === "hover") setShown(true);
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
        "nova-pointer-highlight",
        shown && "nova-pointer-highlight--shown",
        className
      )}
      style={
        {
          "--nova-ph-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      <span className="nova-pointer-highlight__text">{children}</span>
      <span className="nova-pointer-highlight__box" aria-hidden="true">
        <span className="nova-pointer-highlight__corner nova-pointer-highlight__corner--tl" />
        <span className="nova-pointer-highlight__corner nova-pointer-highlight__corner--tr" />
        <span className="nova-pointer-highlight__corner nova-pointer-highlight__corner--bl" />
        <span className="nova-pointer-highlight__corner nova-pointer-highlight__corner--br" />
      </span>
    </span>
  );
});
