import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Button.css";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "link";
export type ButtonTone = "primary" | "neutral" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Defaults to `"solid"`. */
  variant?: ButtonVariant;
  /** Color tone. Defaults to `"primary"`. */
  tone?: ButtonTone;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ButtonSize;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** Stretches the button to fill its container width. */
  fullWidth?: boolean;
}

function Spinner() {
  return (
    <span className="nova-button__spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="nova-button__spinner-svg">
        <circle
          className="nova-button__spinner-track"
          cx="12"
          cy="12"
          r="9"
          fill="none"
          strokeWidth="3"
        />
        <path
          className="nova-button__spinner-head"
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    tone = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    loading = false,
    fullWidth = false,
    disabled,
    type = "button",
    className,
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "nova-button",
        "nova-focusable",
        `nova-button--${variant}`,
        `nova-button--${tone}`,
        `nova-button--${size}`,
        fullWidth && "nova-button--full",
        loading && "nova-button--loading",
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {leftIcon && (
        <span className="nova-button__icon nova-button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children != null && <span className="nova-button__label">{children}</span>}
      {rightIcon && (
        <span className="nova-button__icon nova-button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
