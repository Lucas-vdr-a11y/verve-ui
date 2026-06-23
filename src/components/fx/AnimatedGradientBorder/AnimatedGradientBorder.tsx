import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedGradientBorder.css";

export interface AnimatedGradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Border thickness in px. Defaults `2`. */
  borderWidth?: number;
  /** Time for one full rotation in seconds. Defaults `6`. */
  duration?: number;
  /** Corner radius. Defaults `--nova-radius-xl`. */
  radius?: string;
  /** Colors fed into the rotating conic gradient. */
  colors?: string[];
  /** Add a soft outer glow that mirrors the border colors. Defaults `true`. */
  glow?: boolean;
  children?: React.ReactNode;
}

/**
 * A card wrapped in a slowly rotating conic-gradient border glow. The gradient
 * is painted onto the border ring and the whole conic angle is animated via
 * an `@property`-driven custom property for buttery rotation, with an optional
 * blurred outer halo.
 *
 * SSR-safe (pure CSS). Border + glow layers are aria-hidden. Freezes on
 * reduced-motion.
 */
export const AnimatedGradientBorder = forwardRef<
  HTMLDivElement,
  AnimatedGradientBorderProps
>(function AnimatedGradientBorder(
  {
    borderWidth = 2,
    duration = 6,
    radius = "var(--nova-radius-xl)",
    colors = [
      "var(--nova-brand-500)",
      "var(--nova-info-500)",
      "var(--nova-brand-400)",
      "var(--nova-brand-600)",
    ],
    glow = true,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const stops = `${colors.join(", ")}, ${colors[0]}`;
  return (
    <div
      ref={ref}
      className={cn(
        "nova-gborder",
        glow && "nova-gborder--glow",
        className
      )}
      style={
        {
          "--nova-gborder-width": `${borderWidth}px`,
          "--nova-gborder-duration": `${duration}s`,
          "--nova-gborder-radius": radius,
          "--nova-gborder-stops": stops,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span aria-hidden="true" className="nova-gborder__halo" />
      <span aria-hidden="true" className="nova-gborder__ring" />
      <div className="nova-gborder__content">{children}</div>
    </div>
  );
});
