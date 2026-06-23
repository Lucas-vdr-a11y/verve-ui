import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CircularText.css";

export interface CircularTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text laid out around the circle. */
  text: string;
  /** Diameter of the ring in px. Defaults `160`. */
  size?: number;
  /** Seconds for one full rotation (0 = no spin). Defaults `20`. */
  spin?: number;
  /** Spin direction. Defaults `"cw"`. */
  direction?: "cw" | "ccw";
}

/**
 * CircularText — lays each character around a circle (rotated per-glyph) inside
 * an optionally, slowly spinning ring. Pure CSS layout + animation, no JS loop,
 * SSR-safe. Under reduced-motion the ring stops spinning but the circular
 * layout is preserved.
 */
export const CircularText = forwardRef<HTMLDivElement, CircularTextProps>(
  function CircularText(
    { text, size = 160, spin = 20, direction = "cw", className, style, ...rest },
    ref
  ) {
    const chars = Array.from(text);
    const step = chars.length ? 360 / chars.length : 0;
    const dir = direction === "ccw" ? -1 : 1;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-circular-text",
          spin > 0 && "nova-circular-text--spinning",
          className
        )}
        style={
          {
            "--nova-circ-size": `${size}px`,
            "--nova-circ-spin": `${spin}s`,
            "--nova-circ-dir": String(dir),
            width: `${size}px`,
            height: `${size}px`,
            ...style,
          } as React.CSSProperties
        }
        role="img"
        aria-label={text}
        {...rest}
      >
        <span className="nova-circular-text__ring" aria-hidden="true">
          {chars.map((ch, i) => (
            <span
              key={i}
              className="nova-circular-text__char"
              style={
                {
                  transform: `rotate(${i * step}deg) translateY(calc(var(--nova-circ-size) / -2))`,
                } as React.CSSProperties
              }
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </div>
    );
  }
);
