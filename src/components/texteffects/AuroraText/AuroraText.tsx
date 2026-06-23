import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AuroraText.css";

export interface AuroraTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Text to render. */
  text: string;
  /** Seconds for one full aurora drift cycle. Defaults `8`. */
  speed?: number;
  /**
   * Color stops for the aurora gradient (any CSS colors / token refs). Defaults
   * to a violet→cyan→pink brand aurora.
   */
  colors?: string[];
}

/**
 * AuroraText — fills the text with a slowly shifting multi-color aurora
 * gradient (animated `background-clip: text` + drifting position/hue). CSS-only,
 * SSR-safe, and freezes to a static fill under reduced-motion.
 */
export const AuroraText = forwardRef<HTMLSpanElement, AuroraTextProps>(
  function AuroraText(
    { text, speed = 8, colors, className, style, ...rest },
    ref
  ) {
    const cssVars = {
      "--nova-aurora-duration": `${speed}s`,
      ...(colors && colors.length > 0
        ? { "--nova-aurora-stops": colors.join(", ") }
        : null),
    } as React.CSSProperties;

    return (
      <span
        ref={ref}
        className={cn("nova-aurora-text", className)}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        {text}
      </span>
    );
  }
);
