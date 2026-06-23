import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./NumberFormat.css";

export type NumberFormatStyle = "decimal" | "currency" | "percent" | "compact";
export type NumberFormatSize = "sm" | "md" | "lg" | "xl";
export type NumberFormatTone =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "danger";

export interface NumberFormatProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** The numeric value to format. */
  value: number;
  /** Formatting style. Defaults to `"decimal"`. */
  format?: NumberFormatStyle;
  /** BCP 47 locale(s). Defaults to the runtime locale. */
  locale?: string | string[];
  /** ISO 4217 currency code. Required when `format` is `"currency"`. */
  currency?: string;
  /** Visual size on the token scale. Defaults to `"md"`. */
  size?: NumberFormatSize;
  /** Semantic color tone. Defaults to `"default"`. */
  tone?: NumberFormatTone;
  /** Override the underlying `Intl.NumberFormat` options. */
  options?: Intl.NumberFormatOptions;
}

/**
 * Formats a number as text via `Intl.NumberFormat` (currency / percent /
 * decimal / compact) with size and tone styling. Pure and static — no
 * animation, unlike `AnimatedCounter`.
 */
export const NumberFormat = forwardRef<HTMLSpanElement, NumberFormatProps>(
  function NumberFormat(
    {
      value,
      format = "decimal",
      locale,
      currency,
      size = "md",
      tone = "default",
      options,
      className,
      ...rest
    },
    ref
  ) {
    const formatted = useMemo(() => {
      const base: Intl.NumberFormatOptions = {};

      if (format === "currency") {
        base.style = "currency";
        base.currency = currency ?? "USD";
      } else if (format === "percent") {
        base.style = "percent";
      } else if (format === "compact") {
        base.notation = "compact";
      }

      try {
        return new Intl.NumberFormat(locale, { ...base, ...options }).format(
          value
        );
      } catch {
        // Invalid options/locale — fall back to a plain rendering.
        return String(value);
      }
    }, [value, format, locale, currency, options]);

    return (
      <span
        ref={ref}
        className={cn(
          "nova-number-format",
          `nova-number-format--${size}`,
          `nova-number-format--${tone}`,
          className
        )}
        {...rest}
      >
        {formatted}
      </span>
    );
  }
);
