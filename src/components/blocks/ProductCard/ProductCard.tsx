import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProductCard.css";

export type ProductBadgeTone = "sale" | "new" | "neutral";

export interface ProductCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Image slot (e.g. an <img>). */
  image?: React.ReactNode;
  /** Product title. */
  title: React.ReactNode;
  /** Current price, e.g. "$49". */
  price: React.ReactNode;
  /** Original price shown struck-through (e.g. for sales). */
  originalPrice?: React.ReactNode;
  /** Star rating from 0–5. Renders the star row when provided. */
  rating?: number;
  /** Optional review count shown next to the rating. */
  reviewCount?: React.ReactNode;
  /** Corner badge text, e.g. "Sale". */
  badge?: React.ReactNode;
  /** Badge tone. @default "sale" */
  badgeTone?: ProductBadgeTone;
  /** Add-to-cart label. @default "Add to cart" */
  actionLabel?: React.ReactNode;
  /** Called when the add-to-cart button is clicked. */
  onAddToCart?: React.MouseEventHandler<HTMLButtonElement>;
}

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77 4.8 17.5l.99-5.78L1.58 7.62l5.82-.85L10 1.5z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ProductCard — e-commerce tile: image, title, price, optional rating/badge,
 * and an add-to-cart action. Lifts on hover.
 */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  function ProductCard(
    {
      image,
      title,
      price,
      originalPrice,
      rating,
      reviewCount,
      badge,
      badgeTone = "sale",
      actionLabel = "Add to cart",
      onAddToCart,
      className,
      ...rest
    },
    ref,
  ) {
    const stars =
      rating !== undefined
        ? Math.max(0, Math.min(5, Math.round(rating)))
        : undefined;

    return (
      <div ref={ref} className={cn("nova-product-card", className)} {...rest}>
        <div className="nova-product-card__media">
          {badge && (
            <span
              className={cn(
                "nova-product-card__badge",
                `nova-product-card__badge--${badgeTone}`,
              )}
            >
              {badge}
            </span>
          )}
          {image}
        </div>

        <div className="nova-product-card__body">
          <h3 className="nova-product-card__title">{title}</h3>

          {stars !== undefined && (
            <div className="nova-product-card__rating">
              <span
                className="nova-product-card__stars"
                role="img"
                aria-label={`Rated ${stars} out of 5`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="nova-product-card__star">
                    <Star filled={i < stars} />
                  </span>
                ))}
              </span>
              {reviewCount !== undefined && (
                <span className="nova-product-card__reviews">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}

          <div className="nova-product-card__footer">
            <span className="nova-product-card__price-group">
              <span className="nova-product-card__price">{price}</span>
              {originalPrice && (
                <span className="nova-product-card__original-price">
                  {originalPrice}
                </span>
              )}
            </span>
            <button
              type="button"
              className="nova-product-card__action"
              onClick={onAddToCart}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
