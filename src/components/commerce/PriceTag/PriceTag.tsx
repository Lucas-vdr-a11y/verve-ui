import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PriceTag.css";

export type PriceTagSize = "sm" | "md" | "lg";

export interface PriceTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Current price as a number (formatted via Intl.NumberFormat). */
  amount: number;
  /** Original price shown struck-through when greater than `amount`. */
  originalAmount?: number;
  /** ISO 4217 currency code, e.g. "USD", "EUR". @default "USD" */
  currency?: string;
  /** BCP 47 locale for formatting, e.g. "en-US". @default "en-US" */
  locale?: string;
  /** Size variant. @default "md" */
  size?: PriceTagSize;
  /**
   * Show the savings as a discount percentage badge when an
   * `originalAmount` is supplied. @default true
   */
  showDiscount?: boolean;
  /** Override the computed discount label, e.g. "-20%". */
  discountLabel?: React.ReactNode;
}

function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Invalid currency/locale — fall back to a plain number.
    return amount.toFixed(2);
  }
}

/**
 * PriceTag — a formatted price with optional strike-through original price
 * and discount badge. On sale (original > current) it switches to sale styling.
 */
export const PriceTag = forwardRef<HTMLSpanElement, PriceTagProps>(
  function PriceTag(
    {
      amount,
      originalAmount,
      currency = "USD",
      locale = "en-US",
      size = "md",
      showDiscount = true,
      discountLabel,
      className,
      ...rest
    },
    ref,
  ) {
    const onSale =
      originalAmount !== undefined && originalAmount > amount && amount >= 0;

    const discountPct = onSale
      ? Math.round(((originalAmount - amount) / originalAmount) * 100)
      : 0;

    const current = formatPrice(amount, currency, locale);
    const original =
      originalAmount !== undefined
        ? formatPrice(originalAmount, currency, locale)
        : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          "nova-price-tag",
          `nova-price-tag--${size}`,
          onSale && "nova-price-tag--sale",
          className,
        )}
        {...rest}
      >
        <span className="nova-price-tag__current">{current}</span>
        {onSale && original && (
          <span className="nova-price-tag__original">
            <span className="nova-price-tag__sr-only">Original price </span>
            {original}
          </span>
        )}
        {onSale && showDiscount && (
          <span className="nova-price-tag__discount">
            {discountLabel ?? `-${discountPct}%`}
          </span>
        )}
      </span>
    );
  },
);
