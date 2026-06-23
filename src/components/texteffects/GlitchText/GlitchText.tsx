import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./GlitchText.css";

export interface GlitchTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to glitch. */
  text: string;
  /** Only glitch on hover instead of continuously. Defaults `false`. */
  hoverOnly?: boolean;
  /** Glitch animation speed (seconds per cycle). Defaults `2.5`. */
  speed?: number;
  /** Intensity of the RGB split / jitter (px). Defaults `3`. */
  intensity?: number;
}

/**
 * GlitchText — a datamosh / RGB-split glitch. Two clipped clone layers (cyan +
 * magenta) jitter and clip-slice over the base text. Pure CSS animation;
 * SSR-safe. With `hoverOnly` the glitch is idle until hover. Respects
 * reduced-motion (layers hide, base text stays crisp).
 */
export const GlitchText = forwardRef<HTMLSpanElement, GlitchTextProps>(
  function GlitchText(
    {
      text,
      hoverOnly = false,
      speed = 2.5,
      intensity = 3,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          "nova-glitch-text",
          hoverOnly && "nova-glitch-text--hover",
          className
        )}
        style={
          {
            "--nova-glitch-speed": `${speed}s`,
            "--nova-glitch-shift": `${intensity}px`,
            ...style,
          } as React.CSSProperties
        }
        data-text={text}
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">{text}</span>
      </span>
    );
  }
);
