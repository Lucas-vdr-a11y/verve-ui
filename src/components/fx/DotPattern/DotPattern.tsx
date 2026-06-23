import { forwardRef, useCallback, useId, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./DotPattern.css";

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  /** Cell spacing in px. Defaults `24`. */
  spacing?: number;
  /** Dot radius in px. Defaults `1.4`. */
  radius?: number;
  /** Fade the dots out toward the edges with a radial mask. Defaults `true`. */
  fade?: boolean;
  /**
   * Add a soft glow that follows the cursor over the pattern. Defaults `true`.
   * The glow radius in px when enabled. Pass a number to size it; `true` = 160.
   */
  glow?: boolean | number;
}

/**
 * SVG dot-grid background. Optional radial fade mask plus an interactive glow
 * that tracks the pointer via a CSS variable updated in an rAF-throttled
 * pointermove handler.
 *
 * SSR-safe (no window access during render; listener is inline on the element).
 * Decorative — aria-hidden. Glow uses a mask so it only reveals the dots.
 */
export const DotPattern = forwardRef<SVGSVGElement, DotPatternProps>(
  function DotPattern(
    { spacing = 24, radius = 1.4, fade = true, glow = true, className, ...rest },
    ref
  ) {
    const id = useId().replace(/:/g, "");
    const patternId = `nova-dots-${id}`;
    const rootRef = useRef<SVGSVGElement | null>(null);
    const frame = useRef<number | null>(null);
    const glowOn = glow !== false;
    const glowSize = typeof glow === "number" ? glow : 160;

    const setRefs = useCallback(
      (node: SVGSVGElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const handleMove = useCallback(
      (e: React.PointerEvent<SVGSVGElement>) => {
        if (!glowOn) return;
        const node = rootRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (frame.current != null) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          node.style.setProperty("--nova-dots-x", `${px}px`);
          node.style.setProperty("--nova-dots-y", `${py}px`);
          node.style.setProperty("--nova-dots-glow-opacity", "1");
        });
      },
      [glowOn]
    );

    const handleLeave = useCallback(() => {
      rootRef.current?.style.setProperty("--nova-dots-glow-opacity", "0");
    }, []);

    return (
      <svg
        ref={setRefs}
        aria-hidden="true"
        className={cn(
          "nova-dots",
          fade && "nova-dots--fade",
          glowOn && "nova-dots--glow",
          className
        )}
        style={{ "--nova-dots-glow-size": `${glowSize}px` } as React.CSSProperties}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        {...rest}
      >
        <defs>
          <pattern
            id={patternId}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={radius}
              className="nova-dots__dot"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        {glowOn && (
          <rect
            width="100%"
            height="100%"
            fill={`url(#${patternId})`}
            className="nova-dots__glow"
          />
        )}
      </svg>
    );
  }
);
