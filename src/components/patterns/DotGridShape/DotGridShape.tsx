import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./DotGridShape.css";

export interface DotGridShapeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Number of dot rows. Defaults `6`. */
  rows?: number;
  /** Number of dot columns. Defaults `6`. */
  cols?: number;
  /** Shape of the cluster. Defaults `"grid"`. */
  shape?: "grid" | "triangle";
  /** Dot diameter in px. Defaults `4`. */
  dotSize?: number;
  /** Gap between dot centers in px. Defaults `16`. */
  gap?: number;
  /** Dot color. Defaults the primary token. */
  color?: string;
}

/**
 * The classic decorative "dots accent" — a cluster of dots used near headings and
 * cards. Configurable rows/cols, a triangle variant, dot size, gap, and color.
 *
 * SSR-safe (layout computed during render), no motion. Decorative — aria-hidden.
 */
export const DotGridShape = forwardRef<HTMLDivElement, DotGridShapeProps>(
  function DotGridShape(
    {
      rows = 6,
      cols = 6,
      shape = "grid",
      dotSize = 4,
      gap = 16,
      color = "var(--nova-primary)",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const dots = useMemo(() => {
      const out: { cx: number; cy: number }[] = [];
      for (let r = 0; r < rows; r++) {
        const count = shape === "triangle" ? r + 1 : cols;
        for (let c = 0; c < count; c++) {
          out.push({ cx: c * gap + dotSize, cy: r * gap + dotSize });
        }
      }
      return out;
    }, [rows, cols, shape, gap, dotSize]);

    const w = (cols - 1) * gap + dotSize * 2;
    const h = (rows - 1) * gap + dotSize * 2;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-dot-grid-shape", className)}
        style={
          {
            "--nova-dotgrid-color": color,
            width: w,
            height: h,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-dot-grid-shape__svg"
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          xmlns="http://www.w3.org/2000/svg"
        >
          {dots.map((d, i) => (
            <circle
              key={i}
              className="nova-dot-grid-shape__dot"
              cx={d.cx}
              cy={d.cy}
              r={dotSize / 2}
            />
          ))}
        </svg>
      </div>
    );
  }
);
