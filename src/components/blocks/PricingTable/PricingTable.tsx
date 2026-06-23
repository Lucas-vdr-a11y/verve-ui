import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PricingTable.css";

export interface PricingTablePlan {
  /** Plan name (e.g. "Pro"). */
  name: React.ReactNode;
  /** Price string (e.g. "$29"). */
  price: React.ReactNode;
  /** Billing period suffix (e.g. "/mo"). */
  period?: React.ReactNode;
  /** Short plan description. */
  description?: React.ReactNode;
  /** Included features, rendered as a checklist. */
  features: React.ReactNode[];
  /** Marks this plan as featured/recommended. */
  highlighted?: boolean;
  /** Optional badge text for the highlighted plan (e.g. "Most popular"). */
  badge?: React.ReactNode;
  /** Call-to-action slot (e.g. a button). */
  cta?: React.ReactNode;
}

export interface PricingTableProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Section heading. */
  title?: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Plans rendered as stacked cards. */
  plans: PricingTablePlan[];
  /** Billing toggle slot (e.g. a monthly/yearly segmented control). */
  billingToggle?: React.ReactNode;
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M13 4.5 6.5 11 3 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * PricingTable — a self-contained multi-plan pricing section. Renders a header,
 * an optional billing-toggle slot, and a responsive row of stacked plan cards
 * with a per-plan feature checklist and CTA. One plan may be highlighted.
 */
export const PricingTable = forwardRef<HTMLElement, PricingTableProps>(
  function PricingTable(
    { title, subtitle, plans, billingToggle, className, ...rest },
    ref,
  ) {
    const hasHeader = title || subtitle || billingToggle;

    return (
      <section
        ref={ref}
        className={cn("nova-pricing-table", className)}
        {...rest}
      >
        {hasHeader && (
          <header className="nova-pricing-table__header">
            {title && <h2 className="nova-pricing-table__title">{title}</h2>}
            {subtitle && (
              <p className="nova-pricing-table__subtitle">{subtitle}</p>
            )}
            {billingToggle && (
              <div className="nova-pricing-table__toggle">{billingToggle}</div>
            )}
          </header>
        )}

        <div className="nova-pricing-table__plans">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={cn(
                "nova-pricing-table__plan",
                plan.highlighted && "nova-pricing-table__plan--highlighted",
              )}
            >
              {plan.highlighted && plan.badge && (
                <span className="nova-pricing-table__badge">{plan.badge}</span>
              )}

              <div className="nova-pricing-table__plan-head">
                <h3 className="nova-pricing-table__plan-name">{plan.name}</h3>
                {plan.description && (
                  <p className="nova-pricing-table__plan-description">
                    {plan.description}
                  </p>
                )}
              </div>

              <p className="nova-pricing-table__price">
                <span className="nova-pricing-table__price-value">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="nova-pricing-table__price-period">
                    {plan.period}
                  </span>
                )}
              </p>

              <ul className="nova-pricing-table__features" role="list">
                {plan.features.map((feature, j) => (
                  <li key={j} className="nova-pricing-table__feature">
                    <span
                      className="nova-pricing-table__feature-icon"
                      aria-hidden="true"
                    >
                      <CheckIcon />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.cta && (
                <div className="nova-pricing-table__cta">{plan.cta}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  },
);
