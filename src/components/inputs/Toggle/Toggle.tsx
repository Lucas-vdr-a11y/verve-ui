import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Toggle.css";

export type ToggleVariant = "solid" | "soft" | "outline" | "ghost";
export type ToggleSize = "sm" | "md" | "lg";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Visual style. Defaults to `"soft"`. */
  variant?: ToggleVariant;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ToggleSize;
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Uncontrolled initial pressed state. Defaults to `false`. */
  defaultPressed?: boolean;
  /** Called with the next pressed state when toggled. */
  onPressedChange?: (pressed: boolean) => void;
  /** Icon rendered before the label (or alone). */
  icon?: React.ReactNode;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    variant = "soft",
    size = "md",
    pressed,
    defaultPressed = false,
    onPressedChange,
    icon,
    disabled,
    className,
    children,
    onClick,
    type = "button",
    ...rest
  },
  ref
) {
  const isControlled = pressed !== undefined;
  const [internal, setInternal] = useState(defaultPressed);
  const isPressed = isControlled ? pressed : internal;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || disabled) return;
    const next = !isPressed;
    if (!isControlled) setInternal(next);
    onPressedChange?.(next);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "nova-toggle",
        "nova-focusable",
        `nova-toggle--${variant}`,
        `nova-toggle--${size}`,
        isPressed && "nova-toggle--on",
        className
      )}
      aria-pressed={isPressed}
      data-pressed={isPressed || undefined}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      {...rest}
    >
      {icon != null && (
        <span className="nova-toggle__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children != null && <span className="nova-toggle__label">{children}</span>}
    </button>
  );
});
