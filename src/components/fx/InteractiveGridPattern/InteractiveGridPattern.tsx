import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./InteractiveGridPattern.css";

export interface InteractiveGridPatternProps
  extends Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Single cell size in px (square). Defaults `40`. */
  size?: number;
  /** Number of columns. Defaults `24`. */
  columns?: number;
  /** Number of rows. Defaults `12`. */
  rows?: number;
  /** Fade the grid toward the edges with a radial mask. Defaults `true`. */
  fade?: boolean;
}

/**
 * A grid of SVG cells that highlight individually as the cursor moves over them
 * (pointer-tracked). Subtle hover fill on the hovered cell; cell size, column /
 * row count and edge fade are configurable.
 *
 * SSR-safe: hover state is React-driven (no direct window access), pure CSS for
 * the visuals. No animation to gate, but the fill transition honors the global
 * reduced-motion token freeze. Decorative — aria-hidden.
 */
export const InteractiveGridPattern = forwardRef<
  SVGSVGElement,
  InteractiveGridPatternProps
>(function InteractiveGridPattern(
  { size = 40, columns = 24, rows = 12, fade = true, className, ...rest },
  ref
) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = columns * rows;

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={columns * size}
      height={rows * size}
      className={cn(
        "nova-igrid",
        fade && "nova-igrid--fade",
        className
      )}
      {...rest}
    >
      {Array.from({ length: total }, (_, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        return (
          <rect
            key={i}
            className={cn(
              "nova-igrid__cell",
              hovered === i && "nova-igrid__cell--active"
            )}
            x={col * size}
            y={row * size}
            width={size}
            height={size}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() =>
              setHovered((cur) => (cur === i ? null : cur))
            }
          />
        );
      })}
    </svg>
  );
});
