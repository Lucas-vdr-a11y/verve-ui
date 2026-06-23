import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AddToCartButton.css";

export type AddToCartState = "idle" | "loading" | "added";
export type AddToCartSize = "sm" | "md" | "lg";

export interface AddToCartButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Current state. @default "idle" */
  state?: AddToCartState;
  /** Size variant. @default "md" */
  size?: AddToCartSize;
  /** Idle label. @default "Add to cart" */
  label?: React.ReactNode;
  /** Loading label (announced via aria-live). @default "Adding…" */
  loadingLabel?: React.ReactNode;
  /** Added/success label (announced via aria-live). @default "Added" */
  addedLabel?: React.ReactNode;
  /** Optional quantity badge shown before the label. */
  quantity?: number;
  /** Optional formatted price shown after the label. */
  price?: React.ReactNode;
  /** Make the button stretch to fill its container. */
  fullWidth?: boolean;
}

const CartIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M2 2.5h2l1.6 9.2a1.25 1.25 0 0 0 1.23 1.05h6.84a1.25 1.25 0 0 0 1.23-1.02l1.05-5.73H5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="17" r="1.1" fill="currentColor" />
    <circle cx="15" cy="17" r="1.1" fill="currentColor" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="nova-add-to-cart__check"
    viewBox="0 0 20 20"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 10.5l4 4 8-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className="nova-add-to-cart__spinner"
    viewBox="0 0 20 20"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.25" />
    <path d="M10 3a7 7 0 0 1 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * AddToCartButton — button with idle / loading / added states. The added state
 * animates a check icon. State changes are announced via an aria-live region.
 */
export const AddToCartButton = forwardRef<
  HTMLButtonElement,
  AddToCartButtonProps
>(function AddToCartButton(
  {
    state = "idle",
    size = "md",
    label = "Add to cart",
    loadingLabel = "Adding…",
    addedLabel = "Added",
    quantity,
    price,
    fullWidth = false,
    disabled,
    className,
    type,
    ...rest
  },
  ref,
) {
  const isBusy = state === "loading";
  const isAdded = state === "added";

  const liveLabel = isBusy ? loadingLabel : isAdded ? addedLabel : label;

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "nova-add-to-cart",
        `nova-add-to-cart--${size}`,
        `nova-add-to-cart--${state}`,
        fullWidth && "nova-add-to-cart--full",
        className,
      )}
      disabled={disabled || isBusy}
      aria-disabled={disabled || isBusy || undefined}
      aria-busy={isBusy || undefined}
      {...rest}
    >
      <span className="nova-add-to-cart__icon" aria-hidden="true">
        {isBusy ? <SpinnerIcon /> : isAdded ? <CheckIcon /> : <CartIcon />}
      </span>

      <span className="nova-add-to-cart__content">
        {quantity !== undefined && !isBusy && !isAdded && (
          <span className="nova-add-to-cart__qty">{quantity}</span>
        )}
        <span className="nova-add-to-cart__label">{liveLabel}</span>
        {price !== undefined && !isBusy && !isAdded && (
          <span className="nova-add-to-cart__price">{price}</span>
        )}
      </span>

      <span className="nova-add-to-cart__sr-live" aria-live="polite">
        {isBusy ? loadingLabel : isAdded ? addedLabel : null}
      </span>
    </button>
  );
});
