import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PricingCard.css";

export interface PricingFeature {
  /** Feature label. */
  label: React.ReactNode;
  /** Whether this feature is included. Excluded features render muted. @default true */
  included?: boolean;
}

export interface PricingCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Plan name, e.g. "Pro". */
  name: React.ReactNode;
  /** Price amount, e.g. "$29" or 29. */
  price: React.ReactNode;
  /** Billing period suffix, e.g. "/mo". */
  period?: React.ReactNode;
  /** Short plan description. */
  description?: React.ReactNode;
  /** Feature list. Strings are treated as included features. */
  features?: Array<PricingFeature | string>;
  /** CTA element (e.g. a button). Takes precedence over `ctaLabel`. */
  cta?: React.ReactNode;
  /** Convenience label rendering a built-in CTA button. */
  ctaLabel?: React.ReactNode;
  /** Called when the built-in CTA button is clicked. */
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Highlight as the recommended plan (accent border + badge). @default false */
  highlighted?: boolean;
  /** Badge text shown when highlighted. @default "Popular" */
  badge?: React.ReactNode;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DashIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const normalize = (f: PricingFeature | string): PricingFeature =>
  typeof f === "string" ? { label: f, included: true } : { included: true, ...f };

/**
 * PricingCard — a single pricing plan tile with feature list and CTA.
 * Use the `highlighted` variant to mark the recommended plan.
 */
export const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(
  function PricingCard(
    {
      name,
      price,
      period,
      description,
      features,
      cta,
      ctaLabel,
      onCtaClick,
      highlighted = false,
      badge = "Popular",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-pricing-card",
          highlighted && "nova-pricing-card--highlighted",
          className,
        )}
        {...rest}
      >
        {highlighted && badge && (
          <span className="nova-pricing-card__badge">{badge}</span>
        )}

        <div className="nova-pricing-card__header">
          <h3 className="nova-pricing-card__name">{name}</h3>
          {description && (
            <p className="nova-pricing-card__description">{description}</p>
          )}
        </div>

        <div className="nova-pricing-card__price-row">
          <span className="nova-pricing-card__price">{price}</span>
          {period && (
            <span className="nova-pricing-card__period">{period}</span>
          )}
        </div>

        {features && features.length > 0 && (
          <ul className="nova-pricing-card__features">
            {features.map((raw, i) => {
              const f = normalize(raw);
              return (
                <li
                  key={i}
                  className={cn(
                    "nova-pricing-card__feature",
                    !f.included && "nova-pricing-card__feature--excluded",
                  )}
                >
                  <span className="nova-pricing-card__feature-icon" aria-hidden="true">
                    {f.included ? <CheckIcon /> : <DashIcon />}
                  </span>
                  <span>{f.label}</span>
                </li>
              );
            })}
          </ul>
        )}

        {cta ? (
          <div className="nova-pricing-card__cta">{cta}</div>
        ) : ctaLabel ? (
          <button
            type="button"
            className="nova-pricing-card__button"
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
        ) : null}
      </div>
    );
  },
);
