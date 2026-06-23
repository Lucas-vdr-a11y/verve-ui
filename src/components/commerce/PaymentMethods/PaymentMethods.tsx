import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./PaymentMethods.css";

export type PaymentMethodId =
  | "card"
  | "paypal"
  | "applepay"
  | "googlepay"
  | (string & {});

export interface PaymentMethodOption {
  /** Stable value committed via onChange. */
  value: PaymentMethodId;
  /** Visible label. Defaults to a friendly name for known methods. */
  label?: string;
  /**
   * Override the icon. Built-in icons exist for card / paypal / applepay /
   * googlepay; pass a node for custom methods.
   */
  icon?: React.ReactNode;
  /** Selectable but disabled. */
  disabled?: boolean;
}

export interface PaymentMethodsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Available payment method options. */
  options: PaymentMethodOption[];
  /** Controlled selected value. */
  value?: PaymentMethodId;
  /** Called with the newly selected value. */
  onChange?: (value: PaymentMethodId) => void;
  /** Accessible label for the group. @default "Payment method" */
  label?: string;
  /** Disable the whole control. */
  disabled?: boolean;
}

const DEFAULT_LABELS: Record<string, string> = {
  card: "Card",
  paypal: "PayPal",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
};

const CardIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PaypalIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
    <path
      d="M8.4 19l.5-3.1h2.6c3.3 0 5.6-1.6 6.1-4.7.5-2.8-1-4.2-3.9-4.2H8.6c-.4 0-.7.3-.8.7L6 18.4c0 .3.2.6.5.6h1.9z"
      fill="currentColor"
      opacity="0.55"
    />
    <path
      d="M10.4 17l.5-3.1h2.6c3.3 0 5.6-1.6 6.1-4.7.1-.3.1-.6.1-.9.6.4 1 1.1.8 2.3-.5 3.1-2.8 4.7-6.1 4.7H11.8l-.6 3.6c0 .3-.3.5-.6.5h-.2z"
      fill="currentColor"
    />
  </svg>
);

const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
    <path
      d="M16.3 12.6c0-2 1.6-2.9 1.7-3-.9-1.3-2.3-1.5-2.8-1.6-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.7-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.4 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2-.1 0-2-.8-2-3z"
      fill="currentColor"
    />
    <path
      d="M14.6 6.9c.5-.6.8-1.5.7-2.4-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.3.8.1 1.6-.4 2.2-1z"
      fill="currentColor"
    />
  </svg>
);

const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
    <path
      d="M12 10.4v3.3h4.6c-.2 1.1-.8 2-1.7 2.6v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2 0-.6-.1-1.2-.2-1.8H12z"
      fill="currentColor"
    />
    <path
      d="M12 20c2.3 0 4.2-.8 5.6-2.1l-2.7-2.1c-.8.5-1.7.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H4.4v2.2C5.8 18.1 8.7 20 12 20z"
      fill="currentColor"
      opacity="0.7"
    />
    <path
      d="M7.2 13.1c-.2-.5-.3-1.1-.3-1.6s.1-1.1.3-1.6V7.7H4.4C3.9 8.8 3.6 10 3.6 11.5s.3 2.7.8 3.8l2.8-2.2z"
      fill="currentColor"
      opacity="0.5"
    />
    <path
      d="M12 6.3c1.3 0 2.4.4 3.3 1.3l2.4-2.4C16.2 3.9 14.3 3 12 3 8.7 3 5.8 4.9 4.4 7.7l2.8 2.2C7.9 7.9 9.8 6.3 12 6.3z"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
);

function builtInIcon(value: string): React.ReactNode {
  switch (value) {
    case "card":
      return <CardIcon />;
    case "paypal":
      return <PaypalIcon />;
    case "applepay":
      return <ApplePayIcon />;
    case "googlepay":
      return <GooglePayIcon />;
    default:
      return <CardIcon />;
  }
}

/**
 * PaymentMethods — a radiogroup of selectable payment methods (card, PayPal,
 * Apple Pay, Google Pay or custom) with icons. Keyboard operable.
 */
export const PaymentMethods = forwardRef<HTMLDivElement, PaymentMethodsProps>(
  function PaymentMethods(
    { options, value, onChange, label = "Payment method", disabled = false, className, ...rest },
    ref,
  ) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const enabledIndexes = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled)
      .map(({ i }) => i);

    const select = (opt: PaymentMethodOption) => {
      if (disabled || opt.disabled) return;
      if (opt.value !== value) onChange?.(opt.value);
    };

    const focusAndSelect = (index: number) => {
      refs.current[index]?.focus();
      select(options[index]);
    };

    const moveFocus = (fromIndex: number, dir: 1 | -1) => {
      if (enabledIndexes.length === 0) return;
      const pos = enabledIndexes.indexOf(fromIndex);
      const start = pos === -1 ? (dir === 1 ? -1 : 0) : pos;
      const nextPos = (start + dir + enabledIndexes.length) % enabledIndexes.length;
      focusAndSelect(enabledIndexes[nextPos]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          moveFocus(index, 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          moveFocus(index, -1);
          break;
        case "Home":
          e.preventDefault();
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[0]);
          break;
        case "End":
          e.preventDefault();
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[enabledIndexes.length - 1]);
          break;
        default:
          break;
      }
    };

    const hasSelection = options.some((o) => o.value === value);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-payment-methods",
          disabled && "nova-payment-methods--disabled",
          className,
        )}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {options.map((opt, index) => {
          const checked = opt.value === value;
          const text = opt.label ?? DEFAULT_LABELS[opt.value] ?? opt.value;
          const isTabStop = checked || (!hasSelection && index === enabledIndexes[0]);
          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-disabled={opt.disabled || disabled || undefined}
              aria-label={text}
              tabIndex={disabled ? -1 : isTabStop ? 0 : -1}
              className={cn(
                "nova-payment-methods__option",
                checked && "nova-payment-methods__option--selected",
              )}
              disabled={disabled || opt.disabled}
              onClick={() => select(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span className="nova-payment-methods__icon" aria-hidden="true">
                {opt.icon ?? builtInIcon(opt.value)}
              </span>
              <span className="nova-payment-methods__label">{text}</span>
            </button>
          );
        })}
      </div>
    );
  },
);
