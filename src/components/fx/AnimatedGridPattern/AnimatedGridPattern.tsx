import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./AnimatedGridPattern.css";

export interface AnimatedGridPatternProps
  extends React.SVGProps<SVGSVGElement> {
  /** Cell width in px. Defaults `40`. */
  width?: number;
  /** Cell height in px. Defaults `40`. */
  height?: number;
  /** Horizontal offset of the grid in px. Defaults `-1`. */
  x?: number;
  /** Vertical offset of the grid in px. Defaults `-1`. */
  y?: number;
  /** SVG dash array for the grid lines. */
  strokeDasharray?: string;
  /** How many cells glow simultaneously. Defaults `5`. */
  numSquares?: number;
  /** Max opacity a lit cell reaches. Defaults `0.4`. */
  maxOpacity?: number;
  /** Seconds each cell stays lit before moving. Defaults `1.4`. */
  duration?: number;
  /** Fade the grid toward the edges with a radial mask. Defaults `true`. */
  fade?: boolean;
}

interface Cell {
  id: number;
  cx: number;
  cy: number;
}

const COLS = 24;
const ROWS = 16;

/**
 * An SVG grid where random cells continuously light up and fade out, then jump
 * to fresh positions (the Magic UI animated grid). Lit-cell count, max opacity,
 * dwell time, cell size and edge fade are configurable.
 *
 * SSR-safe: deterministic initial cells for stable first paint; reshuffling runs
 * in an effect/timer with cleanup. Freezes on reduced-motion. Decorative —
 * aria-hidden.
 */
export const AnimatedGridPattern = forwardRef<
  SVGSVGElement,
  AnimatedGridPatternProps
>(function AnimatedGridPattern(
  {
    width = 40,
    height = 40,
    x = -1,
    y = -1,
    strokeDasharray,
    numSquares = 5,
    maxOpacity = 0.4,
    duration = 1.4,
    fade = true,
    className,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const patternId = `nova-agrid-${id}`;
  const counter = useRef(0);

  const pick = useCallback(
    () => ({
      id: counter.current++,
      cx: Math.floor(Math.random() * COLS),
      cy: Math.floor(Math.random() * ROWS),
    }),
    []
  );

  // Deterministic initial layout so SSR and first client paint match.
  const initial = useMemo<Cell[]>(() => {
    let seed = numSquares * 7331 + 53;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      cx: Math.floor(rand() * COLS),
      cy: Math.floor(rand() * ROWS),
    }));
  }, [numSquares]);

  const [cells, setCells] = useState<Cell[]>(initial);

  useEffect(() => {
    counter.current = initial.length;
    setCells(initial);
  }, [initial]);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setCells((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const next = prev.slice();
        next[idx] = pick();
        return next;
      });
    }, Math.max(200, (duration * 1000) / Math.max(1, numSquares)));
    return () => clearInterval(interval);
  }, [reduced, duration, numSquares, pick]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={cn("nova-agrid", fade && "nova-agrid--fade", className)}
      style={
        {
          "--nova-agrid-duration": `${duration}s`,
          "--nova-agrid-max-opacity": maxOpacity,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
            className="nova-agrid__line"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      <svg x={x} y={y} className="nova-agrid__cells">
        {cells.map((c) => (
          <rect
            key={c.id}
            className="nova-agrid__cell"
            width={width - 1}
            height={height - 1}
            x={c.cx * width + 1}
            y={c.cy * height + 1}
          />
        ))}
      </svg>
    </svg>
  );
});
