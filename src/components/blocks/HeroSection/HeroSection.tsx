import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./HeroSection.css";

export type HeroSectionLayout = "centered" | "split";
export type HeroSectionBackground = "plain" | "subtle" | "gradient";

export interface HeroSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Small label above the title. */
  eyebrow?: React.ReactNode;
  /** Big headline. */
  title: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Primary action slot (e.g. a button). */
  primaryAction?: React.ReactNode;
  /** Secondary action slot. */
  secondaryAction?: React.ReactNode;
  /** Media/screenshot slot (shown beside the copy when layout is "split"). */
  media?: React.ReactNode;
  /** Trust badges / logos row beneath the actions. */
  trustBadges?: React.ReactNode;
  /** Layout: centered stack or split copy/media. @default "centered" */
  layout?: HeroSectionLayout;
  /** Background treatment. @default "subtle" */
  background?: HeroSectionBackground;
}

/**
 * HeroSection — a complete marketing hero: eyebrow, big title, subtitle, primary
 * and secondary CTA slots, an optional media/screenshot slot, and a trust-badges
 * row. Supports a centered or split layout and subtle/gradient backgrounds.
 */
export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection(
    {
      eyebrow,
      title,
      subtitle,
      primaryAction,
      secondaryAction,
      media,
      trustBadges,
      layout = "centered",
      background = "subtle",
      className,
      ...rest
    },
    ref,
  ) {
    const effectiveLayout = media ? layout : "centered";

    return (
      <section
        ref={ref}
        className={cn(
          "nova-hero",
          `nova-hero--${effectiveLayout}`,
          `nova-hero--bg-${background}`,
          className,
        )}
        {...rest}
      >
        <div className="nova-hero__inner">
          <div className="nova-hero__copy">
            {eyebrow && <p className="nova-hero__eyebrow">{eyebrow}</p>}
            <h1 className="nova-hero__title">{title}</h1>
            {subtitle && <p className="nova-hero__subtitle">{subtitle}</p>}

            {(primaryAction || secondaryAction) && (
              <div className="nova-hero__actions">
                {primaryAction}
                {secondaryAction}
              </div>
            )}

            {trustBadges && (
              <div className="nova-hero__trust">{trustBadges}</div>
            )}
          </div>

          {media && effectiveLayout === "split" && (
            <div className="nova-hero__media">{media}</div>
          )}
        </div>

        {media && effectiveLayout === "centered" && (
          <div className="nova-hero__media nova-hero__media--centered">
            {media}
          </div>
        )}
      </section>
    );
  },
);
