import { forwardRef, useId, useMemo } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./AuroraRibbons.css";

export interface AuroraRibbonsProps extends React.SVGProps<SVGSVGElement> {
  /** Number of undulating ribbons. Defaults `3`. */
  ribbons?: number;
  /** Gradient colors cycled across the ribbons. Defaults a brand/info blend. */
  colors?: string[];
  /** Undulation speed multiplier. Defaults `1`. */
  speed?: number;
  /** Ribbon opacity (0–1). Defaults `0.5`. */
  opacity?: number;
}

/**
 * Flowing aurora ribbons — a few wavy gradient bands that undulate horizontally
 * across the background (distinct from AuroraBackground's soft blobs). Built with
 * animated SVG paths and gradient strokes.
 *
 * SSR-safe (no window access; ids via useId). Undulation freezes under
 * reduced-motion. Decorative — aria-hidden.
 */
export const AuroraRibbons = forwardRef<SVGSVGElement, AuroraRibbonsProps>(
  function AuroraRibbons(
    {
      ribbons = 3,
      colors = ["var(--nova-primary)", "var(--nova-info)", "var(--nova-brand-400)"],
      speed = 1,
      opacity = 0.5,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const rawId = useId().replace(/:/g, "");

    const bands = useMemo(() => {
      return Array.from({ length: ribbons }, (_, i) => {
        const baseY = 30 + (i * 40) / Math.max(1, ribbons);
        const amp = 14 + (i % 3) * 6;
        const color = colors[i % colors.length] || "var(--nova-primary)";
        const dur = (16 + i * 4) / Math.max(0.1, speed);
        return { i, baseY, amp, color, dur };
      });
    }, [ribbons, colors, speed]);

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={cn("nova-ribbons", className)}
        style={{ "--nova-ribbons-opacity": opacity, ...style } as React.CSSProperties}
        {...rest}
      >
        <defs>
          {bands.map((b) => {
            const gradId = `${rawId}-grad-${b.i}`;
            return (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={b.color} stopOpacity="0" />
                <stop offset="50%" stopColor={b.color} stopOpacity="1" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>
        {bands.map((b) => {
          const gradId = `${rawId}-grad-${b.i}`;
          const y = b.baseY;
          const a = b.amp;
          const d = `M -10 ${y} C 20 ${y - a}, 40 ${y + a}, 60 ${y} S 100 ${y - a}, 130 ${y}`;
          return (
            <path
              key={b.i}
              d={d}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={a * 0.9}
              strokeLinecap="round"
              className={cn(
                "nova-ribbons__band",
                !reduced && "nova-ribbons__band--anim"
              )}
              style={{ animationDuration: `${b.dur}s` } as React.CSSProperties}
            />
          );
        })}
      </svg>
    );
  }
);
