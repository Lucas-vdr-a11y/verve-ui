import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CartItem.css";

export interface CartItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onChange"> {
  /** Image slot (e.g. an <img>). */
  image?: React.ReactNode;
  /** Product title. */
  title: React.ReactNode;
  /** Variant/options text, e.g. "Size M · Blue". */
  options?: React.ReactNode;
  /** Per-unit price, already formatted (e.g. "$24.00"). */
  unitPrice: React.ReactNode;
  /** Line total, already formatted. Computed by the consumer. */
  lineTotal: React.ReactNode;
  /** Controlled quantity. */
  quantity?: number;
  /** Initial quantity for uncontrolled usage. @default 1 */
  defaultQuantity?: number;
  /** Minimum quantity. @default 1 */
  min?: number;
  /** Maximum quantity. */
  max?: number;
  /** Step for the stepper. @default 1 */
  step?: number;
  /** Called when the quantity changes. */
  onQuantityChange?: (quantity: number) => void;
  /** Called when the remove button is clicked. */
  onRemove?: () => void;
  /** Remove button accessible label. @default "Remove item" */
  removeLabel?: string;
  /** Disable interaction. */
  disabled?: boolean;
}

const MinusIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M2.5 4h11M6 4V2.75A.75.75 0 0 1 6.75 2h2.5a.75.75 0 0 1 .75.75V4M4 4l.6 8.3A1.25 1.25 0 0 0 5.85 13.5h4.3a1.25 1.25 0 0 0 1.25-1.2L12 4M6.5 6.75v4M9.5 6.75v4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function clamp(value: number, min: number, max?: number): number {
  let next = value;
  if (next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
}

/**
 * CartItem — a cart line item: image, title, options, unit price, an inline
 * quantity stepper, line total, and a remove button.
 */
export const CartItem = forwardRef<HTMLDivElement, CartItemProps>(
  function CartItem(
    {
      image,
      title,
      options,
      unitPrice,
      lineTotal,
      quantity,
      defaultQuantity = 1,
      min = 1,
      max,
      step = 1,
      onQuantityChange,
      onRemove,
      removeLabel = "Remove item",
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = quantity !== undefined;
    const [internal, setInternal] = useState<number>(() =>
      clamp(defaultQuantity, min, max),
    );
    const current = isControlled ? clamp(quantity, min, max) : internal;

    const commit = useCallback(
      (next: number) => {
        const clamped = clamp(next, min, max);
        if (!isControlled) setInternal(clamped);
        if (clamped !== current) onQuantityChange?.(clamped);
      },
      [current, isControlled, max, min, onQuantityChange],
    );

    const atMin = current <= min;
    const atMax = max !== undefined && current >= max;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-cart-item",
          disabled && "nova-cart-item--disabled",
          className,
        )}
        {...rest}
      >
        {image !== undefined && (
          <div className="nova-cart-item__media">{image}</div>
        )}

        <div className="nova-cart-item__info">
          <span className="nova-cart-item__title">{title}</span>
          {options !== undefined && (
            <span className="nova-cart-item__options">{options}</span>
          )}
          <span className="nova-cart-item__unit-price">{unitPrice} each</span>
        </div>

        <div className="nova-cart-item__controls">
          <div
            className="nova-cart-item__stepper"
            role="spinbutton"
            aria-label="Quantity"
            aria-valuenow={current}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-disabled={disabled || undefined}
          >
            <button
              type="button"
              className="nova-cart-item__step-btn"
              onClick={() => commit(current - step)}
              disabled={disabled || atMin}
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="nova-cart-item__qty" aria-hidden="true">
              {current}
            </span>
            <button
              type="button"
              className="nova-cart-item__step-btn"
              onClick={() => commit(current + step)}
              disabled={disabled || atMax}
              aria-label="Increase quantity"
            >
              <PlusIcon />
            </button>
          </div>

          <span className="nova-cart-item__total">{lineTotal}</span>

          {onRemove && (
            <button
              type="button"
              className="nova-cart-item__remove"
              onClick={onRemove}
              disabled={disabled}
              aria-label={removeLabel}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    );
  },
);
