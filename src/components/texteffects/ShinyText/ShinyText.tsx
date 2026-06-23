import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShinyText.css";

export interface ShinyTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Text to render. */
  text: string;
  /** Seconds for one full shimmer sweep. Defaults `4`. */
  speed?: number;
  /** Base text color. Defaults `var(--nova-text-muted)`. */
  baseColor?: string;
  /** Color of the moving highlight. Defaults a bright sheen. */
  shineColor?: string;
  /** Pause (disable) the sweep. Defaults `false`. */
  paused?: boolean;
}

/**
 * ShinyText — a metallic light highlight sweeps continuously across the text via
 * an animated masked gradient. Perfect for "Pro" / premium labels. CSS-only, so
 * it is SSR-safe and honors reduced-motion (the sweep simply holds still).
 */
export const ShinyText = forwardRef<HTMLSpanElement, ShinyTextProps>(
  function ShinyText(
    {
      text,
      speed = 4,
      baseColor,
      shineColor,
      paused = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const cssVars = {
      "--nova-shiny-duration": `${speed}s`,
      ...(baseColor != null ? { "--nova-shiny-base": baseColor } : null),
      ...(shineColor != null ? { "--nova-shiny-shine": shineColor } : null),
    } as React.CSSProperties;

    return (
      <span
        ref={ref}
        className={cn(
          "nova-shiny-text",
          paused && "nova-shiny-text--paused",
          className
        )}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        {text}
      </span>
    );
  }
);
