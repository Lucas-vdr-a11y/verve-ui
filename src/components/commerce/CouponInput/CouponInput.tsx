import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CouponInput.css";

export interface CouponInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onSubmit"
  > {
  /** Controlled input value (the code being typed). */
  value: string;
  /** Called when the input value changes. */
  onChange: (value: string) => void;
  /** Called when the apply button (or Enter) is triggered. */
  onApply?: (value: string) => void;
  /** Called when the applied coupon's remove button is clicked. */
  onRemove?: () => void;
  /** The successfully applied code. When set, shows the applied state. */
  appliedCode?: string;
  /** Success message shown in the applied state. */
  successMessage?: React.ReactNode;
  /** Error message shown below the input. Presence triggers error styling. */
  error?: React.ReactNode;
  /** Show a loading state on the apply button. */
  loading?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Input placeholder. @default "Promo code" */
  placeholder?: string;
  /** Apply button label. @default "Apply" */
  applyLabel?: React.ReactNode;
  /** Field label (visually shown above). */
  label?: React.ReactNode;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="nova-coupon-input__spinner" viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
    <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * CouponInput — controlled promo-code input + apply button, with applied
 * (success) and error states.
 */
export const CouponInput = forwardRef<HTMLInputElement, CouponInputProps>(
  function CouponInput(
    {
      value,
      onChange,
      onApply,
      onRemove,
      appliedCode,
      successMessage = "Coupon applied",
      error,
      loading = false,
      disabled = false,
      placeholder = "Promo code",
      applyLabel = "Apply",
      label,
      className,
      id,
      ...rest
    },
    ref,
  ) {
    const isApplied = appliedCode !== undefined && appliedCode !== "";
    const hasError = error !== undefined && error !== null && error !== "";
    const inputId = id ?? "nova-coupon-input";
    const errorId = `${inputId}-error`;

    const handleApply = () => {
      if (disabled || loading) return;
      const trimmed = value.trim();
      if (trimmed) onApply?.(trimmed);
    };

    if (isApplied) {
      return (
        <div
          className={cn("nova-coupon-input", "nova-coupon-input--applied", className)}
          {...rest}
        >
          <div className="nova-coupon-input__applied" role="status">
            <span className="nova-coupon-input__applied-icon" aria-hidden="true">
              <CheckIcon />
            </span>
            <span className="nova-coupon-input__applied-text">
              <span className="nova-coupon-input__applied-code">{appliedCode}</span>
              <span className="nova-coupon-input__applied-message">{successMessage}</span>
            </span>
            {onRemove && (
              <button
                type="button"
                className="nova-coupon-input__remove"
                onClick={onRemove}
                disabled={disabled}
                aria-label={`Remove coupon ${appliedCode}`}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "nova-coupon-input",
          hasError && "nova-coupon-input--error",
          className,
        )}
        {...rest}
      >
        {label !== undefined && (
          <label className="nova-coupon-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="nova-coupon-input__field">
          <input
            ref={ref}
            id={inputId}
            type="text"
            className="nova-coupon-input__input"
            value={value}
            placeholder={placeholder}
            disabled={disabled || loading}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          <button
            type="button"
            className="nova-coupon-input__apply"
            onClick={handleApply}
            disabled={disabled || loading || value.trim() === ""}
          >
            {loading ? (
              <span className="nova-coupon-input__apply-icon" aria-hidden="true">
                <SpinnerIcon />
              </span>
            ) : (
              applyLabel
            )}
          </button>
        </div>
        {hasError && (
          <span id={errorId} className="nova-coupon-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);
