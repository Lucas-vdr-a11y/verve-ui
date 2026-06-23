import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ExpiryInput.css";

export type ExpiryInputSize = "sm" | "md" | "lg";

export interface ExpiryValue {
  /** Two-digit month string, "01"–"12", or "" if not yet complete. */
  month: string;
  /** Two-digit year string (YY), or "" if not yet complete. */
  year: string;
}

export interface ExpiryChange extends ExpiryValue {
  /** Display value, e.g. "12/27". */
  formatted: string;
  /** Whether month+year are complete, parseable, and not in the past. */
  valid: boolean;
}

export interface ExpiryInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ExpiryInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Controlled raw value (digits only, up to 4, e.g. "1227"). */
  value?: string;
  /** Uncontrolled initial raw value. */
  defaultValue?: string;
  /** Called with month, year, formatted display, and validity. */
  onChange?: (change: ExpiryChange) => void;
}

/**
 * Normalize free input into up to 4 expiry digits. A leading month > 1 is
 * padded (e.g. "5" -> "05") so the slash appears naturally.
 */
function normalizeDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  // Auto-pad an obviously-single-digit month (2-9) to two digits.
  if (d.length === 1 && /[2-9]/.test(d)) {
    d = "0" + d;
  }
  return d.slice(0, 4);
}

function isNotPast(month: number, year2: number): boolean {
  // year2 is YY; resolve to full year in the 2000s window.
  const fullYear = 2000 + year2;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1; // 1-12
  if (fullYear > curYear) return true;
  if (fullYear < curYear) return false;
  return month >= curMonth;
}

export function parseExpiry(input: string): ExpiryChange {
  const digits = normalizeDigits(input);
  const mm = digits.slice(0, 2);
  const yy = digits.slice(2, 4);

  const formatted =
    digits.length <= 2 ? mm : `${mm}/${yy}`;

  let month = "";
  let year = "";
  let valid = false;

  if (mm.length === 2) {
    const m = Number(mm);
    if (m >= 1 && m <= 12) {
      month = mm;
      if (yy.length === 2) {
        year = yy;
        valid = isNotPast(m, Number(yy));
      }
    }
  }

  return { month, year, formatted, valid };
}

export const ExpiryInput = forwardRef<HTMLInputElement, ExpiryInputProps>(
  function ExpiryInput(
    {
      size = "md",
      invalid = false,
      value,
      defaultValue,
      onChange,
      disabled,
      className,
      placeholder,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(
      () => normalizeDigits(defaultValue ?? "")
    );
    const raw = isControlled ? value : internal;
    const { formatted } = parseExpiry(raw ?? "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = normalizeDigits(e.target.value);
      if (!isControlled) setInternal(digits);
      onChange?.(parseExpiry(digits));
    };

    return (
      <div
        className={cn(
          "nova-expiry",
          `nova-expiry--${size}`,
          invalid && "nova-expiry--invalid",
          disabled && "nova-expiry--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <input
          {...rest}
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          className="nova-expiry__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder ?? "MM/YY"}
          maxLength={5}
        />
      </div>
    );
  }
);
