import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./GeminiBeam.css";

export interface GeminiBeamProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of curved beams. Defaults `4`. */
  beams?: number;
  /** Content rendered above the beams. */
  children?: React.ReactNode;
}

/**
 * GeminiBeam — flowing curved SVG beams whose strokes "draw" themselves
 * (stroke-dashoffset) as the section scrolls through the viewport, in the
 * Google-Gemini-effect style. Scroll progress is read against the container and
 * rAF-throttled; listeners clean up on unmount. SSR-safe (beams start undrawn)
 * and, under reduced-motion, the beams render fully drawn with no scroll
 * coupling.
 */
export const GeminiBeam = forwardRef<HTMLDivElement, GeminiBeamProps>(
  function GeminiBeam({ beams = 4, className, children, ...rest }, ref) {
    const reduced = useReducedMotion();
    const localRef = useRef<HTMLDivElement | null>(null);
    const frameRef = useRef<number | null>(null);
    const rawId = useId().replace(/[:]/g, "");
    const gradId = `nova-gemini-grad-${rawId}`;
    const [progress, setProgress] = useState(reduced ? 1 : 0);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      if (reduced || typeof window === "undefined") {
        setProgress(1);
        return;
      }
      const update = () => {
        frameRef.current = null;
        const node = localRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // Drive from when the top reaches the bottom of the viewport
        // to when the bottom reaches the top.
        const p = (vh - rect.top) / (vh + rect.height);
        setProgress(Math.min(1, Math.max(0, p)));
      };
      const onScroll = () => {
        if (frameRef.current == null) {
          frameRef.current = window.requestAnimationFrame(update);
        }
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frameRef.current != null) {
          window.cancelAnimationFrame(frameRef.current);
        }
      };
    }, [reduced]);

    // Build a set of curved paths fanning across the viewBox.
    const W = 1000;
    const H = 400;
    const paths = Array.from({ length: beams }, (_, i) => {
      const t = beams === 1 ? 0.5 : i / (beams - 1);
      const startY = H * (0.1 + t * 0.8);
      const endY = H * 0.5;
      const c1y = startY;
      const c2y = endY + (startY - endY) * 0.3;
      return `M0 ${startY.toFixed(1)} C ${(W * 0.35).toFixed(1)} ${c1y.toFixed(
        1
      )}, ${(W * 0.6).toFixed(1)} ${c2y.toFixed(1)}, ${W} ${endY.toFixed(1)}`;
    });

    return (
      <div
        ref={setRefs}
        className={cn("nova-gemini-beam", className)}
        {...rest}
      >
        <svg
          className="nova-gemini-beam__svg"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--nova-brand-400)" />
              <stop offset="50%" stopColor="var(--nova-brand-500)" />
              <stop offset="100%" stopColor="var(--nova-brand-300)" />
            </linearGradient>
          </defs>
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke={`url(#${gradId})`}
              strokeWidth={2}
              strokeLinecap="round"
              className="nova-gemini-beam__path"
              style={
                {
                  "--nova-gemini-progress": progress,
                } as React.CSSProperties
              }
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
            />
          ))}
        </svg>
        {children != null && (
          <div className="nova-gemini-beam__content">{children}</div>
        )}
      </div>
    );
  }
);
