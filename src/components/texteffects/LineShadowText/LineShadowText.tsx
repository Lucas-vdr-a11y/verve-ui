import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LineShadowText.css";

export interface LineShadowTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Text to render. */
  text: string;
  /** Element to render. Defaults `"span"`. */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** Color of the diagonal shadow lines. Defaults `var(--nova-primary)`. */
  shadowColor?: string;
  /** Seconds for one shadow drift cycle. Defaults `5`. */
  speed?: number;
}

/**
 * LineShadowText — a bold display heading backed by a striped diagonal "line
 * shadow" offset behind the letters, the stripes drifting continuously (the
 * trendy line-shadow display style). Pure CSS via a duplicated text layer, so it
 * is SSR-safe; under reduced-motion the stripes hold still.
 */
export const LineShadowText = forwardRef<HTMLElement, LineShadowTextProps>(
  function LineShadowText(
    { text, as = "span", shadowColor, speed = 5, className, style, ...rest },
    ref
  ) {
    const cssVars = {
      "--nova-line-shadow-duration": `${speed}s`,
      ...(shadowColor != null
        ? { "--nova-line-shadow-color": shadowColor }
        : null),
    } as React.CSSProperties;

    return createElement(
      as,
      {
        ref,
        className: cn("nova-line-shadow-text", className),
        style: { ...cssVars, ...style },
        // Mirror the text into the shadow layer via a data attribute.
        "data-text": text,
        ...rest,
      },
      text
    );
  }
);
