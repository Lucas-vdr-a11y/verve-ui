import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./CirclePattern.css";

export interface CirclePatternProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Number of concentric rings. Defaults `5`. */
  rings?: number;
  /** Overall diameter in px. Defaults `200`. */
  size?: number;
  /** Ring stroke thickness in px. Defaults `1.5`. */
  thickness?: number;
  /** Stroke color. Defaults the primary token. */
  color?: string;
  /** Fill the innermost dot solid. Defaults `true`. */
  centerDot?: boolean;
  /** Fade outer rings toward the edge. Defaults `true`. */
  fade?: boolean;
}

/**
 * Concentric rings — a ring-burst decorative accent for placing behind or beside
 * headings, badges, and cards. Configurable ring count, size, thickness, color,
 * an optional solid center dot, and an outward opacity fade.
 *
 * SSR-safe (rings computed during render), no motion. Decorative — aria-hidden.
 */
export const CirclePattern = forwardRef<HTMLDivElement, CirclePatternProps>(
  function CirclePattern(
    {
      rings = 5,
      size = 200,
      thickness = 1.5,
      color = "var(--nova-primary)",
      centerDot = true,
      fade = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const n = Math.max(1, rings);
    const cx = size / 2;
    const maxR = size / 2 - thickness;
    const circles = useMemo(() => {
      const out: { r: number; opacity: number }[] = [];
      for (let i = 1; i <= n; i++) {
        const r = (maxR * i) / n;
        const opacity = fade ? 1 - (i - 1) / n : 1;
        out.push({ r, opacity });
      }
      return out;
    }, [n, maxR, fade]);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-circle-pattern", className)}
        style={
          {
            "--nova-circle-color": color,
            width: size,
            height: size,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-circle-pattern__svg"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {circles.map((c, i) => (
            <circle
              key={i}
              className="nova-circle-pattern__ring"
              cx={cx}
              cy={cx}
              r={c.r}
              strokeWidth={thickness}
              style={{ opacity: c.opacity }}
            />
          ))}
          {centerDot && (
            <circle
              className="nova-circle-pattern__dot"
              cx={cx}
              cy={cx}
              r={Math.max(2, maxR / n / 2.5)}
            />
          )}
        </svg>
      </div>
    );
  }
);
