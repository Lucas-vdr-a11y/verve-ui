import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TracingBeam.css";

export interface TracingBeamProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Beam / accent color. Any CSS color. Defaults the brand primary. */
  color?: string;
  /** Content the beam runs alongside. */
  children?: React.ReactNode;
}

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * A vertical guide line down the left of long content with a glowing beam +
 * dot that tracks the reader's scroll position through the content — ideal for
 * articles and timelines.
 *
 * Progress is computed from the content's bounding rect relative to the
 * viewport, updated once per animation frame on scroll/resize and cleaned up on
 * unmount. SSR-safe; decorative track is `aria-hidden`.
 */
export const TracingBeam = forwardRef<HTMLDivElement, TracingBeamProps>(
  function TracingBeam({ color, className, style, children, ...rest }, ref) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const frame = useRef<number | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = innerRef.current;
      if (!el) return;

      const measure = () => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // 0 when the top reaches mid-viewport, 1 when the bottom does.
        const total = rect.height;
        if (total <= 0) {
          setProgress(0);
          return;
        }
        const scrolled = vh * 0.5 - rect.top;
        setProgress(clamp(scrolled / total));
      };
      const schedule = () => {
        if (frame.current === null) {
          frame.current = window.requestAnimationFrame(measure);
        }
      };

      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });

      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame.current !== null) {
          window.cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        className={cn("nova-tracing-beam", className)}
        style={
          {
            ...(color ? { "--nova-tracing-beam-color": color } : null),
            "--nova-tracing-beam-progress": progress,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-tracing-beam__rail" aria-hidden="true">
          <div className="nova-tracing-beam__track" />
          <div className="nova-tracing-beam__beam" />
          <span className="nova-tracing-beam__dot" />
        </div>
        <div className="nova-tracing-beam__content" ref={innerRef}>
          {children}
        </div>
      </div>
    );
  }
);
