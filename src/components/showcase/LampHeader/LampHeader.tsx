import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LampHeader.css";

export interface LampHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Glow / accent color. Any CSS color. Defaults the brand primary. */
  color?: string;
  /** Vertical size of the section. Defaults `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Heading content rendered in the lit zone. */
  children?: React.ReactNode;
}

/**
 * Aceternity-style "lamp" section header: a conic glow fans down from a point
 * and a thin luminous line, illuminating the heading beneath it. Decorative
 * layers are `aria-hidden`; the heading text remains the accessible content.
 *
 * Pure CSS (conic/radial gradients + blur). SSR-safe; entrance animation is
 * disabled under reduced motion via CSS.
 */
export const LampHeader = forwardRef<HTMLDivElement, LampHeaderProps>(
  function LampHeader(
    { color, size = "md", className, style, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-lamp", `nova-lamp--${size}`, className)}
        style={
          {
            ...(color ? { "--nova-lamp-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-lamp__stage" aria-hidden="true">
          <span className="nova-lamp__cone nova-lamp__cone--left" />
          <span className="nova-lamp__cone nova-lamp__cone--right" />
          <span className="nova-lamp__glow" />
          <span className="nova-lamp__line" />
        </div>
        <div className="nova-lamp__content">{children}</div>
      </div>
    );
  }
);
