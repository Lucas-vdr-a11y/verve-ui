import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FeatureCard.css";

export interface FeatureCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Feature title. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Optional link label rendered as a CTA at the bottom. */
  linkLabel?: React.ReactNode;
  /** Href for the link. When set, the link renders as an anchor. */
  href?: string;
  /** Click handler for the link (used when no `href`). */
  onLinkClick?: React.MouseEventHandler<HTMLElement>;
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3 8h9M8.5 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * FeatureCard — icon + title + description tile for feature grids.
 * Lifts on hover; renders an optional link/CTA at the bottom.
 */
export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  function FeatureCard(
    { icon, title, description, linkLabel, href, onLinkClick, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn("nova-feature-card", className)} {...rest}>
        {icon && (
          <span className="nova-feature-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <h3 className="nova-feature-card__title">{title}</h3>

        {description && (
          <p className="nova-feature-card__description">{description}</p>
        )}

        {linkLabel &&
          (href ? (
            <a
              className="nova-feature-card__link"
              href={href}
              onClick={onLinkClick}
            >
              <span>{linkLabel}</span>
              <span className="nova-feature-card__link-icon" aria-hidden="true">
                <ArrowIcon />
              </span>
            </a>
          ) : (
            <button
              type="button"
              className="nova-feature-card__link"
              onClick={onLinkClick}
            >
              <span>{linkLabel}</span>
              <span className="nova-feature-card__link-icon" aria-hidden="true">
                <ArrowIcon />
              </span>
            </button>
          ))}
      </div>
    );
  },
);
