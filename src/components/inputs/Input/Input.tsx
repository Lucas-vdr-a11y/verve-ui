import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Input.css";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: InputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Content rendered inside the field, before the input (e.g. a prefix or icon). */
  leftAddon?: React.ReactNode;
  /** Content rendered inside the field, after the input (e.g. a suffix or icon). */
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    invalid = false,
    leftAddon,
    rightAddon,
    disabled,
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      className={cn(
        "nova-input",
        `nova-input--${size}`,
        invalid && "nova-input--invalid",
        disabled && "nova-input--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      {leftAddon != null && (
        <span className="nova-input__addon nova-input__addon--left">
          {leftAddon}
        </span>
      )}
      <input
        ref={ref}
        className="nova-input__field nova-focusable"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {rightAddon != null && (
        <span className="nova-input__addon nova-input__addon--right">
          {rightAddon}
        </span>
      )}
    </div>
  );
});
