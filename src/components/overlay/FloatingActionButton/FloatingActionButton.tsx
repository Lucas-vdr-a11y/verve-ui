import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./FloatingActionButton.css";

export type FabPlacement =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "top-center";

export type FabSize = "sm" | "md" | "lg";

export type FabTone = "primary" | "neutral" | "success" | "danger";

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon node rendered inside the button. */
  icon: ReactNode;
  /** Accessible label. Required (the icon alone is not readable). */
  label: string;
  /** Corner / edge placement. Defaults to `"bottom-right"`. */
  placement?: FabPlacement;
  /** Size preset. Defaults to `"md"`. */
  size?: FabSize;
  /** Color tone. Defaults to `"primary"`. */
  tone?: FabTone;
  /**
   * Render an extended FAB showing the label text beside the icon.
   * Defaults to `false`.
   */
  extended?: boolean;
  /**
   * Position relative to the nearest positioned ancestor instead of the
   * viewport. Defaults to `false` (fixed to viewport).
   */
  absolute?: boolean;
}

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(function FloatingActionButton(
  {
    icon,
    label,
    placement = "bottom-right",
    size = "md",
    tone = "primary",
    extended = false,
    absolute = false,
    className,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={extended ? undefined : label}
      className={cn(
        "nova-fab",
        `nova-fab--${placement}`,
        `nova-fab--${size}`,
        `nova-fab--${tone}`,
        extended && "nova-fab--extended",
        absolute && "nova-fab--absolute",
        "nova-focusable",
        className
      )}
      {...rest}
    >
      <span className="nova-fab__icon" aria-hidden="true">
        {icon}
      </span>
      {extended && <span className="nova-fab__label">{label}</span>}
    </button>
  );
});
