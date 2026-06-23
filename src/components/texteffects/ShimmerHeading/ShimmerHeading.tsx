import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShimmerHeading.css";

export interface ShimmerHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level / element. Defaults `"h2"`. */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Seconds for one shimmer sweep. Defaults `4`. */
  duration?: number;
  children?: React.ReactNode;
}

/**
 * ShimmerHeading — a large headline with a subtle silver shimmer that sweeps
 * across the text. Tuned for headline sizing (heavy weight, tight leading),
 * distinct from ShinyText's small label treatment. Pure CSS background-clip
 * animation; SSR-safe and renders semantic heading levels. The sweep stops
 * under reduced-motion, leaving a clean static heading.
 */
export const ShimmerHeading = forwardRef<
  HTMLHeadingElement,
  ShimmerHeadingProps
>(function ShimmerHeading(
  { as = "h2", duration = 4, className, style, children, ...rest },
  ref
) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cn("nova-shimmer-heading", className)}
      style={
        {
          "--nova-shimmer-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
});
