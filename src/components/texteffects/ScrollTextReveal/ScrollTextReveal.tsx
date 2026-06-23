import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ScrollTextReveal.css";

export interface ScrollTextRevealProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "children"> {
  /** The paragraph of text to reveal word-by-word. */
  text: string;
  /** Opacity of not-yet-revealed words (0–1). Defaults `0.18`. */
  dimOpacity?: number;
}

/**
 * ScrollTextReveal — a block of text whose words brighten from dim to full one
 * after another as the element scrolls through the viewport (the Magic UI
 * scroll "text reveal" effect). Uses a scroll listener mapped to the element's
 * progress through the viewport; rAF-throttled with cleanup, SSR-safe. Under
 * reduced-motion every word is shown at full opacity immediately.
 */
export const ScrollTextReveal = forwardRef<
  HTMLParagraphElement,
  ScrollTextRevealProps
>(function ScrollTextReveal(
  { text, dimOpacity = 0.18, className, style, ...rest },
  ref
) {
  const reduced = useReducedMotion();
  const innerRef = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(/(\s+)/);
  const wordCount = words.filter((w) => w.trim().length > 0).length;
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced || typeof window === "undefined") {
      setProgress(1);
      return;
    }
    const el = innerRef.current;
    if (!el) return;

    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Start revealing when the top reaches 85% of the viewport, finish when
      // the bottom passes 35%.
      const start = vh * 0.85;
      const end = vh * 0.35;
      const span = start - end || 1;
      const p = (start - rect.top) / (span + rect.height * 0.5);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const revealed = progress * wordCount;
  let wordIndex = -1;

  return (
    <p
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn("nova-scroll-text-reveal", className)}
      style={
        { "--nova-str-dim": String(dimOpacity), ...style } as React.CSSProperties
      }
      aria-label={text}
      {...rest}
    >
      <span aria-hidden="true">
        {words.map((token, i) => {
          if (!token.trim()) return <span key={i}>{token}</span>;
          wordIndex += 1;
          const local = revealed - wordIndex;
          const opacity = Math.min(1, Math.max(0, local));
          return (
            <span
              key={i}
              className="nova-scroll-text-reveal__word"
              style={
                {
                  opacity:
                    dimOpacity + (1 - dimOpacity) * opacity,
                } as React.CSSProperties
              }
            >
              {token}
            </span>
          );
        })}
      </span>
    </p>
  );
});
