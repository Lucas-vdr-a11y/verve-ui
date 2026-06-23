import { createElement, forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./GradientText.css";

export type GradientPreset = "brand" | "sunset" | "ocean" | "candy" | "forest";

export interface GradientTextProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `"span"`. */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** Named preset gradient. Ignored when `from`/`to` are provided. */
  preset?: GradientPreset;
  /** Custom gradient start color (any CSS color / token reference). */
  from?: string;
  /** Custom gradient end color (any CSS color / token reference). */
  to?: string;
  /** Gradient angle in degrees. Defaults to `90`. */
  angle?: number;
  /**
   * Fallback solid color applied where background-clip text is unsupported.
   * Defaults to `var(--nova-primary)`.
   */
  fallbackColor?: string;
}

/**
 * GradientText — clips a brand gradient to the text fill. Use a `preset` or
 * supply custom `from`/`to` stops. Degrades to `fallbackColor` where
 * `background-clip: text` is unsupported.
 */
export const GradientText = forwardRef<HTMLElement, GradientTextProps>(
  function GradientText(
    {
      as = "span",
      preset = "brand",
      from,
      to,
      angle = 90,
      fallbackColor,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const custom = from != null && to != null;

    const cssVars: Record<string, string> = {};
    if (custom) {
      cssVars["--nova-gradient-text-image"] =
        `linear-gradient(${angle}deg, ${from}, ${to})`;
    } else {
      cssVars["--nova-gradient-text-angle"] = `${angle}deg`;
    }
    if (fallbackColor != null) {
      cssVars["--nova-gradient-text-fallback"] = fallbackColor;
    }

    return createElement(as, {
      ref,
      className: cn(
        "nova-gradient-text",
        !custom && `nova-gradient-text--${preset}`,
        className
      ),
      style: { ...cssVars, ...style } as React.CSSProperties,
      ...rest,
    });
  }
);
