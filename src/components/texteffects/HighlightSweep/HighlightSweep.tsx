import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./HighlightSweep.css";

export interface HighlightSweepProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** The word(s) the highlight bar sweeps behind. */
  children: React.ReactNode;
  /** Highlight color. Defaults a translucent brand tint. */
  color?: string;
  /** Sweep height as a fraction of the line. Defaults `0.4`. */
  height?: number;
  /** Fraction visible before sweeping. Defaults `0.6`. */
  threshold?: number;
  /** Sweep only once. Defaults `true`. */
  once?: boolean;
  /** Render behind text (`true`) or as an underline-ish bar (`false`). Defaults `true`. */
  behind?: boolean;
}

/**
 * HighlightSweep — wraps key words so a brand highlight bar wipes in behind them
 * (left to right) the moment they scroll into view, like a marker stroke.
 * Visibility is detected with an IntersectionObserver (disconnected on unmount
 * and after the first sweep when `once`). The sweep is a pure CSS clip-path
 * transition. SSR-safe; reduced motion shows the highlight already drawn.
 */
export const HighlightSweep = forwardRef<HTMLSpanElement, HighlightSweepProps>(
  function HighlightSweep(
    {
      children,
      color,
      height = 0.4,
      threshold = 0.6,
      once = true,
      behind = true,
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

    return (
      <span
        ref={mergeRefs(ref, hostRef)}
        className={cn(
          "nova-highlight-sweep",
          behind ? "nova-highlight-sweep--behind" : "nova-highlight-sweep--under",
          visible && "nova-highlight-sweep--in",
          className
        )}
        style={
          {
            "--nova-highlight-sweep-height": `${height * 100}%`,
            ...(color ? { "--nova-highlight-sweep-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-highlight-sweep__bar" aria-hidden="true" />
        <span className="nova-highlight-sweep__text">{children}</span>
      </span>
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
