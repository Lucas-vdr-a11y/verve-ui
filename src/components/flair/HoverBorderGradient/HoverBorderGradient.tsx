import {
  forwardRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./HoverBorderGradient.css";

export interface HoverBorderGradientProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Element to render as (e.g. `"a"`). Defaults `"button"`. */
  as?: ElementType;
  /** Border thickness (px). Defaults `1.5`. */
  thickness?: number;
  /** Two-color gradient sweep. Defaults to brand + info accents. */
  fromColor?: string;
  toColor?: string;
  children?: ReactNode;
}

/**
 * A pill control wrapped in a continuously rotating conic gradient border that
 * intensifies and speeds up on hover. The rotating gradient is a masked ring
 * (border-box minus content-box) so only the rim shows; the interior is a solid
 * token surface. CSS `@property` animates the conic angle with zero JS.
 *
 * Animation is fully CSS-driven and pauses under reduced motion.
 */
export const HoverBorderGradient = forwardRef<
  HTMLButtonElement,
  HoverBorderGradientProps
>(function HoverBorderGradient(
  {
    as,
    thickness = 1.5,
    fromColor,
    toColor,
    className,
    children,
    style,
    type,
    ...rest
  },
  ref
) {
  const Tag = (as ?? "button") as ElementType;
  const isButton = Tag === "button";

  return (
    <Tag
      ref={ref}
      type={isButton ? type ?? "button" : undefined}
      className={cn("nova-hbg", className)}
      style={
        {
          "--nova-hbg-thickness": `${thickness}px`,
          ...(fromColor ? { "--nova-hbg-from": fromColor } : null),
          ...(toColor ? { "--nova-hbg-to": toColor } : null),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-hbg__content">{children}</span>
    </Tag>
  );
});
