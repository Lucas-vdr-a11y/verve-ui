import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ColourfulText.css";

export interface ColourfulTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The text to colour. */
  text: string;
  /** Seconds for one full rainbow cycle. Defaults `6`. */
  duration?: number;
  /** Hue offset (deg) added per letter, spreading the rainbow. Defaults `18`. */
  spread?: number;
  /** Saturation %, 0–100. Defaults `85`. */
  saturation?: number;
  /** Lightness %, 0–100. Defaults `60`. */
  lightness?: number;
}

/**
 * ColourfulText — every letter has a shifting hue, continuously animating
 * through the rainbow with a per-letter offset so the colours flow across the
 * word. Pure CSS animation (no JS loop); SSR-safe. Under reduced-motion the
 * hue cycle freezes into a static gradient spread.
 */
export const ColourfulText = forwardRef<HTMLSpanElement, ColourfulTextProps>(
  function ColourfulText(
    {
      text,
      duration = 6,
      spread = 18,
      saturation = 85,
      lightness = 60,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn("nova-colourful-text", className)}
        style={
          {
            "--nova-ct-duration": `${duration}s`,
            "--nova-ct-sat": `${saturation}%`,
            "--nova-ct-light": `${lightness}%`,
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
              className="nova-colourful-text__char"
              style={
                {
                  "--nova-ct-offset": `${i * spread}deg`,
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
