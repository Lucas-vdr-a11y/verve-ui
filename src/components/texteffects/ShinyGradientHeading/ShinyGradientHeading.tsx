import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShinyGradientHeading.css";

export interface ShinyGradientHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading text (or rich children). */
  children: React.ReactNode;
  /** Heading level for semantics. Defaults `"h1"`. */
  as?: "h1" | "h2" | "h3";
  /** Ordered gradient stop colors. Defaults a brand-tinted spectrum. */
  colors?: string[];
  /** Seconds for one full gradient sweep. Defaults `6`. */
  duration?: number;
  /** Soft glow behind the text. Defaults `true`. */
  glow?: boolean;
}

const DEFAULT_COLORS = [
  "var(--nova-brand-400)",
  "var(--nova-brand-600)",
  "var(--nova-info-500)",
  "var(--nova-brand-300)",
  "var(--nova-brand-500)",
];

/**
 * ShinyGradientHeading — a large hero heading painted with a moving multi-stop
 * gradient and an optional soft glow. The gradient is clipped to the text and
 * animated via background-position; pure CSS, SSR-safe. Under reduced motion the
 * sweep halts on a static gradient.
 */
export const ShinyGradientHeading = forwardRef<
  HTMLHeadingElement,
  ShinyGradientHeadingProps
>(function ShinyGradientHeading(
  {
    children,
    as: Tag = "h1",
    colors = DEFAULT_COLORS,
    duration = 6,
    glow = true,
    className,
    style,
    ...rest
  },
  ref
) {
  const stops = [...colors, colors[0]].join(", ");
  return (
    <Tag
      ref={ref}
      className={cn(
        "nova-shiny-gradient-heading",
        glow && "nova-shiny-gradient-heading--glow",
        className
      )}
      style={
        {
          "--nova-shiny-gradient-stops": stops,
          "--nova-shiny-gradient-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-shiny-gradient-heading__text">{children}</span>
    </Tag>
  );
});
