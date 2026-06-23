import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./QuantityStepper.css";

export type QuantityStepperSize = "sm" | "md" | "lg";

export interface QuantityStepperProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value. */
  value?: number;
  /** Initial value for uncontrolled usage. @default min ?? 1 */
  defaultValue?: number;
  /** Called with the new clamped value on change. */
  onChange?: (value: number) => void;
  /** Minimum allowed value. @default 1 */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Increment/decrement step. @default 1 */
  step?: number;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Size variant. @default "md" */
  size?: QuantityStepperSize;
  /** Accessible label for the value. @default "Quantity" */
  label?: string;
}

const MinusIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

function clamp(value: number, min: number, max?: number): number {
  let next = value;
  if (next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
}

/**
 * QuantityStepper — accessible − [n] + control for cart quantities.
 * Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 */
export const QuantityStepper = forwardRef<HTMLDivElement, QuantityStepperProps>(
  function QuantityStepper(
    {
      value,
      defaultValue,
      onChange,
      min = 1,
      max,
      step = 1,
      disabled = false,
      size = "md",
      label = "Quantity",
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number>(() =>
      clamp(defaultValue ?? min, min, max),
    );
    const current = isControlled ? clamp(value, min, max) : internal;

    const commit = useCallback(
      (next: number) => {
        const clamped = clamp(next, min, max);
        if (!isControlled) setInternal(clamped);
        if (clamped !== current) onChange?.(clamped);
      },
      [current, isControlled, max, min, onChange],
    );

    const atMin = current <= min;
    const atMax = max !== undefined && current >= max;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        commit(current + step);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        commit(current - step);
      } else if (e.key === "Home" && max !== undefined) {
        e.preventDefault();
        commit(min);
      } else if (e.key === "End" && max !== undefined) {
        e.preventDefault();
        commit(max);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-quantity-stepper",
          `nova-quantity-stepper--${size}`,
          disabled && "nova-quantity-stepper--disabled",
          className,
        )}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <button
          type="button"
          className="nova-quantity-stepper__btn nova-quantity-stepper__btn--minus"
          onClick={() => commit(current - step)}
          disabled={disabled || atMin}
          aria-label="Decrease quantity"
          tabIndex={-1}
        >
          <MinusIcon />
        </button>
        <span className="nova-quantity-stepper__value" aria-hidden="true">
          {current}
        </span>
        <button
          type="button"
          className="nova-quantity-stepper__btn nova-quantity-stepper__btn--plus"
          onClick={() => commit(current + step)}
          disabled={disabled || atMax}
          aria-label="Increase quantity"
          tabIndex={-1}
        >
          <PlusIcon />
        </button>
      </div>
    );
  },
);
