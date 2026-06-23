import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CheckoutSummary.css";

export interface CheckoutLine {
  /** Row label, e.g. "Subtotal". */
  label: React.ReactNode;
  /** Row amount, already formatted, e.g. "$120.00". */
  amount: React.ReactNode;
  /** Optional secondary note shown under the label. */
  note?: React.ReactNode;
}

export interface CheckoutSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel heading. @default "Order summary" */
  heading?: React.ReactNode;
  /** Free-form line items rendered above the totals (e.g. per-product rows). */
  items?: CheckoutLine[];
  /** Subtotal amount, already formatted. */
  subtotal?: React.ReactNode;
  /** Shipping amount, already formatted (e.g. "Free"). */
  shipping?: React.ReactNode;
  /** Tax amount, already formatted. */
  tax?: React.ReactNode;
  /** Discount amount, already formatted (e.g. "-$10.00"). */
  discount?: React.ReactNode;
  /** Total amount, already formatted. Emphasized. */
  total: React.ReactNode;
  /** Optional promo / message row content (e.g. a CouponInput). */
  promo?: React.ReactNode;
  /** Optional CTA slot, rendered at the bottom (e.g. a checkout button). */
  cta?: React.ReactNode;
}

interface RowProps {
  label: React.ReactNode;
  amount: React.ReactNode;
  note?: React.ReactNode;
  variant?: "default" | "discount";
}

const Row = ({ label, amount, note, variant = "default" }: RowProps) => (
  <div
    className={cn(
      "nova-checkout-summary__row",
      variant === "discount" && "nova-checkout-summary__row--discount",
    )}
  >
    <span className="nova-checkout-summary__row-label">
      {label}
      {note !== undefined && (
        <span className="nova-checkout-summary__row-note">{note}</span>
      )}
    </span>
    <span className="nova-checkout-summary__row-amount">{amount}</span>
  </div>
);

/**
 * CheckoutSummary — order summary panel: optional line items, subtotal,
 * shipping, tax, discount, an emphasized total, plus optional promo + CTA slots.
 */
export const CheckoutSummary = forwardRef<HTMLDivElement, CheckoutSummaryProps>(
  function CheckoutSummary(
    {
      heading = "Order summary",
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      promo,
      cta,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-checkout-summary", className)}
        {...rest}
      >
        {heading !== undefined && heading !== null && (
          <h3 className="nova-checkout-summary__heading">{heading}</h3>
        )}

        {items && items.length > 0 && (
          <div className="nova-checkout-summary__items">
            {items.map((item, i) => (
              <Row
                key={i}
                label={item.label}
                amount={item.amount}
                note={item.note}
              />
            ))}
          </div>
        )}

        <div className="nova-checkout-summary__lines">
          {subtotal !== undefined && (
            <Row label="Subtotal" amount={subtotal} />
          )}
          {shipping !== undefined && (
            <Row label="Shipping" amount={shipping} />
          )}
          {tax !== undefined && <Row label="Tax" amount={tax} />}
          {discount !== undefined && (
            <Row label="Discount" amount={discount} variant="discount" />
          )}
        </div>

        {promo !== undefined && (
          <div className="nova-checkout-summary__promo">{promo}</div>
        )}

        <div className="nova-checkout-summary__total">
          <span className="nova-checkout-summary__total-label">Total</span>
          <span className="nova-checkout-summary__total-amount">{total}</span>
        </div>

        {cta !== undefined && (
          <div className="nova-checkout-summary__cta">{cta}</div>
        )}
      </div>
    );
  },
);
