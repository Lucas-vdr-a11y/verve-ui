import { forwardRef, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TextHoverFill.css";

export interface TextHoverFillProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
  /** Text to render as outline. */
  text: string;
  /** Gradient stop colours (CSS colours). Defaults a brand spectrum. */
  colors?: string[];
  /** Radius (in SVG user units) of the reveal mask. Defaults `28`. */
  radius?: number;
  /** Font size in SVG user units. Defaults `64`. */
  fontSize?: number;
}

const DEFAULT_COLORS = ["#eab308", "#ef4444", "#3b82f6", "#06b6d4", "#8b5cf6"];

/**
 * TextHoverFill — SVG outline text whose gradient fill is revealed through a
 * soft circular mask that follows the cursor across the letters (Aceternity
 * "text hover" effect). Pointer math runs in event handlers only (no rAF loop);
 * SSR-safe. When idle / on touch devices it shows the outline; the fill simply
 * never reveals without a pointer, which is an acceptable graceful fallback.
 */
export const TextHoverFill = forwardRef<SVGSVGElement, TextHoverFillProps>(
  function TextHoverFill(
    {
      text,
      colors = DEFAULT_COLORS,
      radius = 28,
      fontSize = 64,
      className,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      ...rest
    },
    ref
  ) {
    const rawId = useId().replace(/[:]/g, "");
    const gradId = `nova-thf-grad-${rawId}`;
    const maskId = `nova-thf-mask-${rawId}`;
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [pos, setPos] = useState({ x: 50, y: 50 });
    const [hovered, setHovered] = useState(false);

    const setRefs = (node: SVGSVGElement | null) => {
      svgRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handlePointerMove: React.PointerEventHandler<SVGSVGElement> = (e) => {
      const node = svgRef.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
      onPointerMove?.(e);
    };

    const handleEnter: React.PointerEventHandler<SVGSVGElement> = (e) => {
      setHovered(true);
      onPointerEnter?.(e);
    };
    const handleLeave: React.PointerEventHandler<SVGSVGElement> = (e) => {
      setHovered(false);
      onPointerLeave?.(e);
    };

    return (
      <svg
        ref={setRefs}
        className={cn("nova-text-hover-fill", className)}
        viewBox="0 0 300 100"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        role="img"
        aria-label={text}
        {...rest}
      >
        <defs>
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="100">
            {colors.map((c, i) => (
              <stop
                key={i}
                offset={colors.length > 1 ? i / (colors.length - 1) : 0}
                stopColor={c}
              />
            ))}
          </linearGradient>
          <radialGradient
            id={maskId}
            gradientUnits="userSpaceOnUse"
            cx={`${pos.x}%`}
            cy={`${pos.y}%`}
            r={radius}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id={`${maskId}-clip`}>
            <rect
              x="0"
              y="0"
              width="300"
              height="100"
              fill={hovered ? `url(#${maskId})` : "black"}
            />
          </mask>
        </defs>

        {/* Outline (always visible) */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          className="nova-text-hover-fill__outline"
        >
          {text}
        </text>

        {/* Gradient fill, revealed through the cursor mask */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill={`url(#${gradId})`}
          mask={`url(#${maskId}-clip)`}
          className="nova-text-hover-fill__fill"
        >
          {text}
        </text>
      </svg>
    );
  }
);
