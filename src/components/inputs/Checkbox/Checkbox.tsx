import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./Checkbox.css";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CheckboxSize;
  /** Renders the mixed/indeterminate state. */
  indeterminate?: boolean;
  /** Visible label rendered next to the box. */
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      size = "md",
      indeterminate = false,
      label,
      disabled,
      className,
      id,
      ...rest
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
      <label
        className={cn(
          "nova-checkbox",
          `nova-checkbox--${size}`,
          disabled && "nova-checkbox--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <span className="nova-checkbox__control">
          <input
            ref={setRef}
            type="checkbox"
            id={id}
            className="nova-checkbox__input nova-focusable"
            disabled={disabled}
            aria-checked={indeterminate ? "mixed" : undefined}
            {...rest}
          />
          <span className="nova-checkbox__box" aria-hidden="true">
            <svg
              className="nova-checkbox__check"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3.5 8.5l2.8 2.8 6.2-6.6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nova-checkbox__dash" />
          </span>
        </span>
        {label != null && (
          <span className="nova-checkbox__label">{label}</span>
        )}
      </label>
    );
  }
);
