import { forwardRef, useId, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./HexPattern.css";

export interface HexPatternProps extends React.SVGProps<SVGSVGElement> {
  /** Hexagon size (radius) in px. Defaults `28`. */
  size?: number;
  /** Stroke width of the hex outlines in px. Defaults `1`. */
  strokeWidth?: number;
  /** Fade the pattern toward the edges with a radial mask. Defaults `true`. */
  fade?: boolean;
  /** Number of random hexes that softly twinkle. Defaults `0` (none). */
  twinkleCount?: number;
}

/**
 * A hexagonal-tile background pattern built from a tiling SVG pattern of pointy
 * hex outlines, with an optional radial edge fade and a configurable number of
 * randomly placed hexes that gently twinkle. Hover lights individual cells.
 *
 * SSR-safe: twinkle positions derived deterministically per render (stable
 * markup), pure CSS. Twinkle freezes on reduced-motion. Decorative — aria-hidden.
 */
export const HexPattern = forwardRef<SVGSVGElement, HexPatternProps>(
  function HexPattern(
    {
      size = 28,
      strokeWidth = 1,
      fade = true,
      twinkleCount = 0,
      className,
      ...rest
    },
    ref
  ) {
    const id = useId().replace(/:/g, "");
    const patternId = `nova-hex-${id}`;

    // Pointy-top hex geometry. Tile is one hex wide × full hex tall, with a
    // vertical half-step so adjacent columns interlock.
    const w = Math.sqrt(3) * size; // tile width
    const h = 2 * size; // tile height (one full hex)
    const points = useMemo(() => {
      const cx = w / 2;
      const cy = h / 2;
      return Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 90);
        return `${(cx + size * Math.cos(a)).toFixed(2)},${(
          cy +
          size * Math.sin(a)
        ).toFixed(2)}`;
      }).join(" ");
    }, [w, h, size]);

    const twinkles = useMemo(() => {
      if (twinkleCount <= 0) return [];
      let seed = twinkleCount * 7727 + 31;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      return Array.from({ length: twinkleCount }, () => ({
        left: rand() * 100,
        top: rand() * 100,
        delay: rand() * 4,
        s: 0.7 + rand() * 0.6,
      }));
    }, [twinkleCount]);

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn("nova-hex", fade && "nova-hex--fade", className)}
        {...rest}
      >
        <defs>
          <pattern
            id={patternId}
            width={w}
            height={h * 1.5}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0 0)`}
          >
            <polygon
              className="nova-hex__cell"
              points={points}
              strokeWidth={strokeWidth}
            />
            <polygon
              className="nova-hex__cell"
              points={points}
              strokeWidth={strokeWidth}
              transform={`translate(${w / 2} ${h * 0.75})`}
            />
            <polygon
              className="nova-hex__cell"
              points={points}
              strokeWidth={strokeWidth}
              transform={`translate(${-w / 2} ${h * 0.75})`}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        {twinkles.map((t, i) => (
          <circle
            key={i}
            className="nova-hex__twinkle"
            r={size * 0.45 * t.s}
            style={
              {
                transformBox: "fill-box",
                animationDelay: `${t.delay}s`,
              } as React.CSSProperties
            }
            cx={`${t.left}%`}
            cy={`${t.top}%`}
          />
        ))}
      </svg>
    );
  }
);
