import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./NumberInput.css";

export type NumberInputSize = "sm" | "md" | "lg";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: NumberInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Step increment for the +/- buttons and arrow keys. Defaults to `1`. */
  step?: number;
  /** Controlled value. Use `null`/empty for a cleared field. */
  value?: number | "";
  /** Initial value for uncontrolled usage. */
  defaultValue?: number | "";
  /** Fired with the numeric value (or `""` when cleared). */
  onChange?: (value: number | "") => void;
}

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      size = "md",
      invalid = false,
      min,
      max,
      step = 1,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      className,
      id,
      "aria-label": ariaLabel,
      ...rest
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number | "">(
      defaultValue ?? ""
    );
    const current = isControlled ? (value as number | "") : internal;

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const commit = useCallback(
      (next: number | "") => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === "") {
          commit("");
          return;
        }
        const n = Number(raw);
        if (Number.isNaN(n)) return;
        commit(n);
      },
      [commit]
    );

    // Clamp on blur so users can freely type intermediate values.
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (current !== "" && typeof current === "number") {
          const clamped = clamp(current, min, max);
          if (clamped !== current) commit(clamped);
        }
        rest.onBlur?.(e);
      },
      [current, min, max, commit, rest]
    );

    const stepBy = useCallback(
      (dir: 1 | -1) => {
        if (disabled || readOnly) return;
        const base = typeof current === "number" ? current : min ?? 0;
        const next = clamp(base + dir * step, min, max);
        commit(next);
        innerRef.current?.focus();
      },
      [current, step, min, max, disabled, readOnly, commit]
    );

    const atMin =
      typeof current === "number" && min !== undefined && current <= min;
    const atMax =
      typeof current === "number" && max !== undefined && current >= max;

    return (
      <div
        className={cn(
          "nova-number",
          `nova-number--${size}`,
          invalid && "nova-number--invalid",
          disabled && "nova-number--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <input
          ref={setRef}
          id={id}
          type="text"
          inputMode="decimal"
          className="nova-number__field nova-focusable"
          role="spinbutton"
          aria-valuenow={typeof current === "number" ? current : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          readOnly={readOnly}
          value={current}
          onChange={handleChange}
          {...rest}
          onBlur={handleBlur}
        />
        <span className="nova-number__steppers" aria-hidden="true">
          <button
            type="button"
            tabIndex={-1}
            className="nova-number__step nova-number__step--up"
            onClick={() => stepBy(1)}
            disabled={disabled || readOnly || atMax}
            aria-label="Increment"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 7.5L6 4.5l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="nova-number__step nova-number__step--down"
            onClick={() => stepBy(-1)}
            disabled={disabled || readOnly || atMin}
            aria-label="Decrement"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5l3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </span>
      </div>
    );
  }
);
