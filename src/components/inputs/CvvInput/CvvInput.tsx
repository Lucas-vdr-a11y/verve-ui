import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CvvInput.css";

export type CvvInputSize = "sm" | "md" | "lg";

export interface CvvChange {
  /** The CVV digits the user typed. */
  value: string;
  /** Whether the value has the expected length (4 for amex, else 3). */
  valid: boolean;
}

export interface CvvInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CvvInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Controlled value (digits only). */
  value?: string;
  /** Uncontrolled initial value (digits only). */
  defaultValue?: string;
  /** Called with the digits and a validity flag. */
  onChange?: (change: CvvChange) => void;
  /**
   * Number of digits expected. Defaults to 3; pass 4 for American Express.
   */
  length?: 3 | 4;
  /**
   * Render the field masked (like a password) with a reveal toggle.
   * Defaults to `false`.
   */
  masked?: boolean;
  /** Help text shown via the tooltip affordance. Set `null` to hide it. */
  help?: React.ReactNode;
}

export const CvvInput = forwardRef<HTMLInputElement, CvvInputProps>(
  function CvvInput(
    {
      size = "md",
      invalid = false,
      value,
      defaultValue,
      onChange,
      length = 3,
      masked = false,
      help = "The 3 or 4 digit security code on the back of your card (front for Amex).",
      disabled,
      className,
      placeholder,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const sanitize = (s: string) => s.replace(/\D/g, "").slice(0, length);
    const [internal, setInternal] = useState<string>(() =>
      sanitize(defaultValue ?? "")
    );
    const raw = isControlled ? sanitize(value) : internal;

    const [revealed, setRevealed] = useState(false);
    const reactId = useId();
    const helpId = `nova-cvv-help-${reactId}`;
    const [showHelp, setShowHelp] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = sanitize(e.target.value);
      if (!isControlled) setInternal(next);
      onChange?.({ value: next, valid: next.length === length });
    };

    const useMask = masked && !revealed;

    return (
      <div
        className={cn(
          "nova-cvv",
          `nova-cvv--${size}`,
          invalid && "nova-cvv--invalid",
          disabled && "nova-cvv--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <input
          {...rest}
          ref={ref}
          type={useMask ? "password" : "text"}
          inputMode="numeric"
          autoComplete="cc-csc"
          className="nova-cvv__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={help != null ? helpId : undefined}
          value={raw}
          onChange={handleChange}
          placeholder={placeholder ?? (length === 4 ? "CVV" : "CVC")}
          maxLength={length}
        />

        {masked && (
          <button
            type="button"
            className="nova-cvv__toggle nova-focusable"
            aria-label={revealed ? "Hide security code" : "Show security code"}
            aria-pressed={revealed}
            disabled={disabled}
            onClick={() => setRevealed((r) => !r)}
            tabIndex={-1}
          >
            {revealed ? (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M4 4l12 12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        )}

        {help != null && (
          <span className="nova-cvv__help">
            <button
              type="button"
              className="nova-cvv__help-trigger nova-focusable"
              aria-label="What is this?"
              aria-describedby={helpId}
              aria-expanded={showHelp}
              disabled={disabled}
              onClick={() => setShowHelp((s) => !s)}
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              onFocus={() => setShowHelp(true)}
              onBlur={() => setShowHelp(false)}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M7.75 7.5a2.25 2.25 0 1 1 3 2.12c-.6.23-1 .8-1 1.45v.18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9.75" cy="14" r="0.9" fill="currentColor" />
              </svg>
            </button>
            <span
              id={helpId}
              role="tooltip"
              className={cn(
                "nova-cvv__tooltip",
                showHelp && "nova-cvv__tooltip--visible"
              )}
            >
              {help}
            </span>
          </span>
        )}
      </div>
    );
  }
);
