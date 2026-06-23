import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ShimmerButton.css";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size on the standard scale. Defaults `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Shimmer color. Defaults a translucent white sheen. */
  shimmerColor?: string;
  /** Duration of one shimmer sweep. Defaults `"2.5s"`. */
  shimmerDuration?: string;
  /** Soften the surrounding glow. Defaults `true`. */
  glow?: boolean;
  children?: React.ReactNode;
}

/**
 * A premium CTA button with a sheen that continuously sweeps across its surface
 * and a soft outer glow that intensifies on hover. The shimmer is a masked,
 * rotating conic highlight running on a pure CSS animation (paused under
 * reduced motion via tokens).
 *
 * Real `<button>` — keyboard and focus accessible.
 */
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  function ShimmerButton(
    {
      size = "md",
      shimmerColor = "rgb(255 255 255 / 0.85)",
      shimmerDuration = "2.5s",
      glow = true,
      className,
      children,
      style,
      type = "button",
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "nova-shimmer",
          `nova-shimmer--${size}`,
          glow && "nova-shimmer--glow",
          className
        )}
        style={
          {
            "--nova-shimmer-color": shimmerColor,
            "--nova-shimmer-duration": shimmerDuration,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-shimmer__spark" aria-hidden="true">
          <span className="nova-shimmer__spark-inner" />
        </span>
        <span className="nova-shimmer__content">{children}</span>
        <span className="nova-shimmer__backdrop" aria-hidden="true" />
      </button>
    );
  }
);
