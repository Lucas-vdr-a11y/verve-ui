import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ThreeDButton.css";

export interface ThreeDButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Defaults `"primary"`. */
  variant?: "primary" | "neutral" | "danger";
  /** Size scale. Defaults `"md"`. */
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

/**
 * A chunky 3D push-button with real depth: a colored top face sits above a
 * darker "edge" so the button reads as physically raised. Pressing (pointer or
 * keyboard activation) translates the top face down into its edge for a
 * satisfying tactile click, with the shadow collapsing.
 *
 * A real `<button>` — fully keyboard operable and focusable. Under reduced
 * motion the depress is instant.
 */
export const ThreeDButton = forwardRef<HTMLButtonElement, ThreeDButtonProps>(
  function ThreeDButton(
    { variant = "primary", size = "md", className, children, type, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "nova-3d-button",
          `nova-3d-button--${variant}`,
          `nova-3d-button--${size}`,
          className
        )}
        {...rest}
      >
        <span className="nova-3d-button__edge" aria-hidden="true" />
        <span className="nova-3d-button__face">{children}</span>
      </button>
    );
  }
);
