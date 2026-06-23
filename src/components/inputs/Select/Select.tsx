import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SelectSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /**
   * Placeholder text rendered as a disabled, hidden first option. Only shown
   * when the control is uncontrolled with no `defaultValue`, or controlled with
   * an empty value.
   */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = "md",
    invalid = false,
    placeholder,
    disabled,
    className,
    children,
    value,
    defaultValue,
    ...rest
  },
  ref
) {
  // When a placeholder is requested, default the uncontrolled value to "" so the
  // placeholder option is the initial selection.
  const resolvedDefault =
    placeholder != null && value === undefined && defaultValue === undefined
      ? ""
      : defaultValue;

  return (
    <div
      className={cn(
        "nova-select",
        `nova-select--${size}`,
        invalid && "nova-select--invalid",
        disabled && "nova-select--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      <select
        ref={ref}
        className="nova-select__field nova-focusable"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={resolvedDefault}
        {...rest}
      >
        {placeholder != null && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <span className="nova-select__chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
});
