import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./HeroHighlight.css";

export interface HeroHighlightProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Background pattern. Defaults `"dot"`. */
  pattern?: "dot" | "grid";
  children?: React.ReactNode;
}

/**
 * HeroHighlight — a hero backdrop with a dot/grid pattern that brightens in a
 * soft radius under the cursor (the pattern is masked to a pointer-tracked
 * gradient). Pointer position is written to CSS variables in an event handler
 * (no rAF loop); SSR-safe. The reveal is decorative, so touch / reduced-motion
 * simply shows the dim pattern.
 */
export const HeroHighlight = forwardRef<HTMLDivElement, HeroHighlightProps>(
  function HeroHighlight(
    { pattern = "dot", className, children, onPointerMove, ...rest },
    ref
  ) {
    const localRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
      const node = localRef.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--nova-hh-x", `${e.clientX - rect.left}px`);
        node.style.setProperty("--nova-hh-y", `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    };

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-hero-highlight",
          `nova-hero-highlight--${pattern}`,
          className
        )}
        onPointerMove={handlePointerMove}
        {...rest}
      >
        <div className="nova-hero-highlight__pattern" aria-hidden="true" />
        <div className="nova-hero-highlight__reveal" aria-hidden="true" />
        <div className="nova-hero-highlight__content">{children}</div>
      </div>
    );
  }
);

export interface HighlightProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/**
 * Highlight — an inline span that animates a brand underline-highlight sweeping
 * in behind its text. Pairs with HeroHighlight for emphasising key words. The
 * sweep runs on mount; under reduced-motion it appears fully filled.
 */
export const Highlight = forwardRef<HTMLSpanElement, HighlightProps>(
  function Highlight({ className, children, ...rest }, ref) {
    return (
      <span ref={ref} className={cn("nova-highlight", className)} {...rest}>
        <span className="nova-highlight__fill" aria-hidden="true" />
        <span className="nova-highlight__text">{children}</span>
      </span>
    );
  }
);
