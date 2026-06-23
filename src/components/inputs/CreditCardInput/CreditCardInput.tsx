import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CreditCardInput.css";

export type CreditCardInputSize = "sm" | "md" | "lg";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "unknown";

export interface CreditCardChange {
  /** Display value including spacing, e.g. "4242 4242 4242 4242". */
  formatted: string;
  /** Digits only, e.g. "4242424242424242". */
  raw: string;
  /** Detected brand from the leading digits. */
  brand: CardBrand;
  /** Whether the number passes the Luhn checksum and has a plausible length. */
  valid: boolean;
}

export interface CreditCardInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CreditCardInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Controlled raw value (digits only). */
  value?: string;
  /** Uncontrolled initial raw value (digits only). */
  defaultValue?: string;
  /** Called with the formatted value, raw digits, detected brand, and validity. */
  onChange?: (change: CreditCardChange) => void;
}

/** Detect a card brand from its leading digits. */
export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (
    /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)
  )
    return "mastercard";
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return "discover";
  return "unknown";
}

/** Max number of digits a brand permits. */
function maxDigitsFor(brand: CardBrand): number {
  return brand === "amex" ? 15 : 16;
}

/** Acceptable lengths per brand for validity. */
function validLengthsFor(brand: CardBrand): number[] {
  switch (brand) {
    case "amex":
      return [15];
    case "visa":
      return [16];
    case "mastercard":
      return [16];
    case "discover":
      return [16];
    default:
      return [13, 14, 15, 16, 19];
  }
}

/** Luhn checksum validation. */
export function luhnValid(digits: string): boolean {
  if (digits.length === 0) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Format digits into brand-appropriate groups (4-4-4-4, amex 4-6-5). */
export function formatCardNumber(digits: string, brand: CardBrand): string {
  if (brand === "amex") {
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 10);
    const c = digits.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

export function parseCardNumber(input: string): CreditCardChange {
  const allDigits = input.replace(/\D/g, "");
  const brand = detectCardBrand(allDigits);
  const digits = allDigits.slice(0, maxDigitsFor(brand));
  const formatted = formatCardNumber(digits, brand);
  const valid =
    validLengthsFor(brand).includes(digits.length) && luhnValid(digits);
  return { formatted, raw: digits, brand, valid };
}

function BrandIcon({ brand }: { brand: CardBrand }) {
  // Simple wordmark-ish inline SVGs — no external assets.
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 0 48 32" className="nova-cc__brand-svg" aria-hidden="true">
          <rect width="48" height="32" rx="4" fill="#1a1f71" />
          <text
            x="24"
            y="21"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="12"
            fontStyle="italic"
            fontWeight="700"
            fill="#ffffff"
          >
            VISA
          </text>
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 48 32" className="nova-cc__brand-svg" aria-hidden="true">
          <rect width="48" height="32" rx="4" fill="#1a1a1a" />
          <circle cx="20" cy="16" r="8" fill="#eb001b" />
          <circle cx="28" cy="16" r="8" fill="#f79e1b" fillOpacity="0.9" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 48 32" className="nova-cc__brand-svg" aria-hidden="true">
          <rect width="48" height="32" rx="4" fill="#2e77bb" />
          <text
            x="24"
            y="20"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="8"
            fontWeight="700"
            fill="#ffffff"
          >
            AMEX
          </text>
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 48 32" className="nova-cc__brand-svg" aria-hidden="true">
          <rect width="48" height="32" rx="4" fill="#181818" />
          <circle cx="35" cy="16" r="6" fill="#f47216" />
          <text
            x="20"
            y="20"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="7"
            fontWeight="700"
            fill="#ffffff"
          >
            DISC
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 32" className="nova-cc__brand-svg" aria-hidden="true">
          <rect
            x="0.5"
            y="0.5"
            width="47"
            height="31"
            rx="4"
            fill="var(--nova-bg-muted)"
            stroke="var(--nova-border)"
          />
          <rect
            x="6"
            y="11"
            width="36"
            height="4"
            rx="1"
            fill="var(--nova-text-subtle)"
          />
          <rect
            x="6"
            y="20"
            width="14"
            height="3"
            rx="1"
            fill="var(--nova-text-subtle)"
          />
        </svg>
      );
  }
}

export const CreditCardInput = forwardRef<
  HTMLInputElement,
  CreditCardInputProps
>(function CreditCardInput(
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
  const [internalRaw, setInternalRaw] = useState<string>(
    () => parseCardNumber(defaultValue ?? "").raw
  );
  const raw = isControlled ? value : internalRaw;
  const { formatted, brand } = parseCardNumber(raw ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = parseCardNumber(e.target.value);
    if (!isControlled) setInternalRaw(result.raw);
    onChange?.(result);
  };

  return (
    <div
      className={cn(
        "nova-cc",
        `nova-cc--${size}`,
        invalid && "nova-cc--invalid",
        disabled && "nova-cc--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      data-brand={brand}
    >
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="cc-number"
        className="nova-cc__field nova-focusable"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder ?? "Card number"}
      />
      <span
        className="nova-cc__brand"
        aria-label={brand === "unknown" ? "Card" : brand}
      >
        <BrandIcon brand={brand} />
      </span>
    </div>
  );
});
