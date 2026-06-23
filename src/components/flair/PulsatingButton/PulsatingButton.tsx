import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PulsatingButton.css";

export interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size on the standard scale. Defaults `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Color of the pulsing ring. Defaults to the primary token. */
  pulseColor?: string;
  /** Duration of one pulse cycle. Defaults `"1.8s"`. */
  duration?: string;
  children?: React.ReactNode;
}

/**
 * An attention CTA that emits a soft glow ring pulsing outward from behind the
 * button on a loop. The ring is a pseudo-element scaling up while fading out,
 * driven by a pure CSS animation (disabled under reduced motion via tokens).
 *
 * Real `<button>` — keyboard and focus accessible.
 */
export const PulsatingButton = forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(function PulsatingButton(
  {
    size = "md",
    pulseColor,
    duration = "1.8s",
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
      className={cn("nova-pulsate", `nova-pulsate--${size}`, className)}
      style={
        {
          ...(pulseColor ? { "--nova-pulsate-color": pulseColor } : null),
          "--nova-pulsate-duration": duration,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-pulsate__ring" aria-hidden="true" />
      <span className="nova-pulsate__content">{children}</span>
    </button>
  );
});
