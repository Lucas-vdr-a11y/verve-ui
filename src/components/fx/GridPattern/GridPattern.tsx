import { forwardRef, useId, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./GridPattern.css";

export interface GridPatternProps
  extends React.SVGProps<SVGSVGElement> {
  /** Cell width in px. Defaults `40`. */
  width?: number;
  /** Cell height in px. Defaults `40`. */
  height?: number;
  /** Horizontal offset of the pattern in px. Defaults `-1`. */
  x?: number;
  /** Vertical offset of the pattern in px. Defaults `-1`. */
  y?: number;
  /** SVG dash array for the grid lines (e.g. `"4 2"`). */
  strokeDasharray?: string;
  /** Fade the grid out toward the edges with a radial mask. Defaults `true`. */
  fade?: boolean;
  /** Number of random squares that softly pulse. Defaults `0` (none). */
  highlightedSquares?: number;
}

/**
 * SVG graph-paper grid background. Configurable cell size, stroke dash, optional
 * radial fade mask, and a set of randomly-placed squares that gently pulse.
 *
 * SSR-safe: random highlight positions are derived deterministically per render
 * with a memo so the markup is stable. Decorative — aria-hidden.
 */
export const GridPattern = forwardRef<SVGSVGElement, GridPatternProps>(
  function GridPattern(
    {
      width = 40,
      height = 40,
      x = -1,
      y = -1,
      strokeDasharray,
      fade = true,
      highlightedSquares = 0,
      className,
      ...rest
    },
    ref
  ) {
    const id = useId().replace(/:/g, "");
    const patternId = `nova-grid-${id}`;

    const squares = useMemo(() => {
      if (highlightedSquares <= 0) return [];
      const out: { sx: number; sy: number; delay: number }[] = [];
      let seed = highlightedSquares * 9301 + 49297;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let i = 0; i < highlightedSquares; i++) {
        out.push({
          sx: Math.floor(rand() * 18),
          sy: Math.floor(rand() * 12),
          delay: rand() * 4,
        });
      }
      return out;
    }, [highlightedSquares]);

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn("nova-grid", fade && "nova-grid--fade", className)}
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
              className="nova-grid__line"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        {squares.map(({ sx, sy, delay }, i) => (
          <rect
            key={`${sx}-${sy}-${i}`}
            className="nova-grid__cell"
            width={width - 1}
            height={height - 1}
            x={sx * width + x + 1}
            y={sy * height + y + 1}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </svg>
    );
  }
);
