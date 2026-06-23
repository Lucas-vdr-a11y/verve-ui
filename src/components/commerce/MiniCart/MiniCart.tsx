import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MiniCart.css";

export interface MiniCartLineItem {
  /** Stable id used as the React key. */
  id: string;
  /** Product title. */
  title: string;
  /** Optional variant / option summary, e.g. "Black · M". */
  subtitle?: string;
  /** Thumbnail image URL. */
  imageSrc?: string;
  /** Quantity ordered. */
  quantity: number;
  /** Line unit price (per item), already in major currency units. */
  price: number;
}

export interface MiniCartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Line items in the cart. An empty array renders the empty state. */
  items: MiniCartLineItem[];
  /** Heading shown above the list. @default "Your cart" */
  title?: React.ReactNode;
  /** ISO 4217 currency code. @default "USD" */
  currency?: string;
  /** BCP 47 locale for formatting. @default "en-US" */
  locale?: string;
  /**
   * Subtotal override. When omitted it is computed from items
   * (price × quantity).
   */
  subtotal?: number;
  /** Checkout CTA handler. */
  onCheckout?: () => void;
  /** View-cart CTA handler. */
  onViewCart?: () => void;
  /** Optional per-item remove handler. Renders a remove button when set. */
  onRemoveItem?: (id: string) => void;
  /** Message shown when the cart is empty. @default "Your cart is empty." */
  emptyLabel?: React.ReactNode;
}

const RemoveIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

/**
 * MiniCart — compact cart panel content: line items (image, title, qty, price),
 * subtotal and checkout / view-cart CTAs, with an empty state. This is the
 * content block only — the overlay/dropdown shell is the caller's concern.
 */
export const MiniCart = forwardRef<HTMLDivElement, MiniCartProps>(function MiniCart(
  {
    items,
    title = "Your cart",
    currency = "USD",
    locale = "en-US",
    subtotal,
    onCheckout,
    onViewCart,
    onRemoveItem,
    emptyLabel = "Your cart is empty.",
    className,
    ...rest
  },
  ref,
) {
  const isEmpty = items.length === 0;
  const computedSubtotal =
    subtotal ?? items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div ref={ref} className={cn("nova-mini-cart", className)} {...rest}>
      <div className="nova-mini-cart__header">
        <span className="nova-mini-cart__title">{title}</span>
        {!isEmpty && (
          <span className="nova-mini-cart__count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="nova-mini-cart__empty">
          <span className="nova-mini-cart__empty-text">{emptyLabel}</span>
        </div>
      ) : (
        <>
          <ul className="nova-mini-cart__list">
            {items.map((item) => (
              <li key={item.id} className="nova-mini-cart__item">
                <div className="nova-mini-cart__thumb" aria-hidden="true">
                  {item.imageSrc && (
                    <img
                      src={item.imageSrc}
                      alt=""
                      className="nova-mini-cart__thumb-img"
                    />
                  )}
                </div>
                <div className="nova-mini-cart__info">
                  <span className="nova-mini-cart__item-title">{item.title}</span>
                  {item.subtitle && (
                    <span className="nova-mini-cart__item-subtitle">
                      {item.subtitle}
                    </span>
                  )}
                  <span className="nova-mini-cart__item-qty">
                    Qty {item.quantity}
                  </span>
                </div>
                <div className="nova-mini-cart__item-end">
                  <span className="nova-mini-cart__item-price">
                    {formatPrice(item.price * item.quantity, currency, locale)}
                  </span>
                  {onRemoveItem && (
                    <button
                      type="button"
                      className="nova-mini-cart__remove"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <RemoveIcon />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="nova-mini-cart__subtotal">
            <span className="nova-mini-cart__subtotal-label">Subtotal</span>
            <span className="nova-mini-cart__subtotal-value">
              {formatPrice(computedSubtotal, currency, locale)}
            </span>
          </div>

          <div className="nova-mini-cart__actions">
            <button
              type="button"
              className="nova-mini-cart__cta nova-mini-cart__cta--primary"
              onClick={onCheckout}
            >
              Checkout
            </button>
            <button
              type="button"
              className="nova-mini-cart__cta nova-mini-cart__cta--secondary"
              onClick={onViewCart}
            >
              View cart
            </button>
          </div>
        </>
      )}
    </div>
  );
});
