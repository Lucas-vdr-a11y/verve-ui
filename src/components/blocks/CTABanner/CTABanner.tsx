import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CTABanner.css";

export type CTABannerVariant = "gradient" | "subtle" | "solid";
export type CTABannerAlign = "start" | "center";

export interface CTABannerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Headline. */
  title: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Primary action slot (e.g. a button). */
  primaryAction?: React.ReactNode;
  /** Secondary action slot. */
  secondaryAction?: React.ReactNode;
  /** Background treatment. @default "gradient" */
  variant?: CTABannerVariant;
  /** Content alignment. @default "center" */
  align?: CTABannerAlign;
}

/**
 * CTABanner — a call-to-action section with title, subtitle and action slots.
 * Supports a brand gradient, subtle, or solid background and start/center align.
 */
export const CTABanner = forwardRef<HTMLElement, CTABannerProps>(
  function CTABanner(
    {
      title,
      subtitle,
      primaryAction,
      secondaryAction,
      variant = "gradient",
      align = "center",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          "nova-cta-banner",
          `nova-cta-banner--${variant}`,
          `nova-cta-banner--${align}`,
          className,
        )}
        {...rest}
      >
        <div className="nova-cta-banner__content">
          <h2 className="nova-cta-banner__title">{title}</h2>
          {subtitle && (
            <p className="nova-cta-banner__subtitle">{subtitle}</p>
          )}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="nova-cta-banner__actions">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </section>
    );
  },
);
