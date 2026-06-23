import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "../Input/Input.css";
import "./CurrencyInput.css";

export type CurrencyInputSize = "sm" | "md" | "lg";

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "value" | "defaultValue" | "type"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CurrencyInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** ISO 4217 currency code, e.g. "USD", "EUR". Defaults to `"USD"`. */
  currency?: string;
  /** BCP 47 locale used for formatting. Defaults to runtime/`"en-US"`. */
  locale?: string;
  /** Number of fraction digits. Defaults to the currency's standard. */
  fractionDigits?: number;
  /** Controlled numeric value (`null` = empty). */
  value?: number | null;
  /** Uncontrolled initial numeric value. */
  defaultValue?: number | null;
  /** Called with the parsed numeric value (`null` when the field is empty). */
  onChange?: (value: number | null) => void;
  /** Hide the currency symbol prefix. */
  hideSymbol?: boolean;
}

const DEFAULT_LOCALE =
  typeof navigator !== "undefined" && navigator.language
    ? navigator.language
    : "en-US";

/** Resolve the currency symbol for a locale/currency pair. */
function getCurrencySymbol(locale: string, currency: string): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Parse a free-typed string into a number, tolerating grouping/symbols. */
function parseNumeric(input: string): number | null {
  // Keep digits, separators, and a leading sign.
  const cleaned = input.replace(/[^0-9.,-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === ",")
    return null;

  // Determine the decimal separator: the last occurring '.' or ','.
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  const decimalSep = lastDot > lastComma ? "." : lastComma > -1 ? "," : "";

  let normalized = cleaned;
  if (decimalSep) {
    const groupSep = decimalSep === "." ? "," : ".";
    normalized = cleaned.split(groupSep).join("");
    normalized = normalized.replace(decimalSep, ".");
  } else {
    // No decimal separator: strip both grouping characters.
    normalized = cleaned.replace(/[.,]/g, "");
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      size = "md",
      invalid = false,
      currency = "USD",
      locale = DEFAULT_LOCALE,
      fractionDigits,
      value,
      defaultValue,
      onChange,
      hideSymbol = false,
      disabled,
      className,
      onBlur,
      onFocus,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number | null>(
      defaultValue ?? null
    );
    const numeric = isControlled ? value ?? null : internal;

    const [focused, setFocused] = useState(false);
    // What the user is actively typing while focused (kept verbatim).
    const [draft, setDraft] = useState<string>("");

    const formatter = useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          currencyDisplay: "code",
          ...(fractionDigits != null
            ? {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
              }
            : {}),
        }),
      [locale, currency, fractionDigits]
    );

    const symbol = useMemo(
      () => getCurrencySymbol(locale, currency),
      [locale, currency]
    );

    // Display: while focused show the raw draft; when blurred show grouped
    // number (without the symbol, which lives in the prefix addon).
    const displayValue = focused
      ? draft
      : numeric == null
        ? ""
        : formatter
            .formatToParts(numeric)
            .filter((p) => p.type !== "currency" && p.type !== "literal")
            .map((p) => p.value)
            .join("");

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setDraft(numeric == null ? "" : String(numeric));
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setDraft(text);
      const parsed = parseNumeric(text);
      if (!isControlled) setInternal(parsed);
      onChange?.(parsed);
    };

    return (
      <div
        className={cn(
          "nova-input",
          "nova-currency",
          `nova-input--${size}`,
          invalid && "nova-input--invalid",
          disabled && "nova-input--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        {!hideSymbol && (
          <span
            className="nova-input__addon nova-input__addon--left nova-currency__symbol"
            aria-hidden="true"
          >
            {symbol}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className="nova-input__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </div>
    );
  }
);
