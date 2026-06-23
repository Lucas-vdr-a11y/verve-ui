import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./WavyText.css";

export interface WavyTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The text to animate. */
  text: string;
  /** Seconds for one full bob cycle. Defaults `1.6`. */
  duration?: number;
  /** Per-letter delay (s) creating the travelling wave. Defaults `0.07`. */
  stagger?: number;
  /** Vertical travel as an em value. Defaults `0.32`. */
  amplitude?: number;
}

/**
 * WavyText — each letter bobs up and down in a continuous sine wave, offset by a
 * per-letter delay so the motion travels across the word. Pure CSS animation,
 * no JS loop, SSR-safe. Under reduced-motion the letters stay flat with no bob.
 */
export const WavyText = forwardRef<HTMLSpanElement, WavyTextProps>(
  function WavyText(
    {
      text,
      duration = 1.6,
      stagger = 0.07,
      amplitude = 0.32,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn("nova-wavy-text", className)}
        style={
          {
            "--nova-wt-duration": `${duration}s`,
            "--nova-wt-amp": `${amplitude}em`,
            ...style,
          } as React.CSSProperties
        }
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">
          {Array.from(text).map((ch, i) => (
            <span
              key={i}
              className="nova-wavy-text__char"
              style={
                {
                  animationDelay: `${i * stagger}s`,
                } as React.CSSProperties
              }
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);
