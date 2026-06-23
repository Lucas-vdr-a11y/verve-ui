import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ZigzagDivider.css";

export interface ZigzagDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Which edge the zigzag sits on. Defaults `"bottom"`. */
  edge?: "top" | "bottom";
  /** Tooth width in px. Defaults `40`. */
  toothWidth?: number;
  /** Tooth height (saw depth) in px. Defaults `24`. */
  toothHeight?: number;
  /** Fill color. Defaults a surface token so the edge blends sections. */
  color?: string;
}

/**
 * A zigzag / triangle-saw edge divider. Teeth are generated to tile the full
 * width; `toothWidth` and `toothHeight` control the saw geometry.
 *
 * SSR-safe, no motion. Decorative — aria-hidden.
 */
export const ZigzagDivider = forwardRef<HTMLDivElement, ZigzagDividerProps>(
  function ZigzagDivider(
    {
      edge = "bottom",
      toothWidth = 40,
      toothHeight = 24,
      color = "var(--nova-surface)",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const w = 1440;
    const h = Math.max(1, toothHeight);
    const tw = Math.max(2, toothWidth);
    const count = Math.ceil(w / tw);

    // Build the saw boundary as a polyline, then close into the section side.
    const points: string[] = [];
    const baseY = edge === "bottom" ? 0 : h;
    const tipY = edge === "bottom" ? h : 0;
    for (let i = 0; i <= count; i++) {
      const x = i * tw;
      points.push(`${x} ${baseY}`);
      points.push(`${x + tw / 2} ${tipY}`);
    }
    const poly = points.join(" L ");
    const d = `M ${poly} L ${w} ${baseY} V ${edge === "bottom" ? h : 0} H 0 Z`;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-zigzag-divider",
          `nova-zigzag-divider--${edge}`,
          className
        )}
        style={
          {
            "--nova-zigzag-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-zigzag-divider__svg"
          viewBox={`0 0 ${w} ${h}`}
          width="100%"
          height={h}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="nova-zigzag-divider__path" d={d} />
        </svg>
      </div>
    );
  }
);
