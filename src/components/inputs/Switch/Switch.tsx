import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Switch.css";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SwitchSize;
  /** Visible label rendered next to the toggle. */
  label?: React.ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = "md", label, disabled, className, ...rest },
  ref
) {
  return (
    <label
      className={cn(
        "nova-switch",
        `nova-switch--${size}`,
        disabled && "nova-switch--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      <span className="nova-switch__control">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className="nova-switch__input nova-focusable"
          disabled={disabled}
          {...rest}
        />
        <span className="nova-switch__track" aria-hidden="true">
          <span className="nova-switch__thumb" />
        </span>
      </span>
      {label != null && <span className="nova-switch__label">{label}</span>}
    </label>
  );
});
