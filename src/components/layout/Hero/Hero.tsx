import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Hero.css";

export type HeroAlign = "start" | "center";
export type HeroSize = "sm" | "md" | "lg";
export type HeroBackground = "none" | "subtle" | "gradient";

export interface HeroProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Small label above the title. */
  eyebrow?: React.ReactNode;
  /** Main hero title. Rendered as an `<h1>` by default. */
  title: React.ReactNode;
  /** Supporting subtitle beneath the title. */
  subtitle?: React.ReactNode;
  /** Action slot (call-to-action buttons, links, etc.). */
  actions?: React.ReactNode;
  /** Optional media/visual slot. When set, the hero uses a split layout. */
  media?: React.ReactNode;
  /** Text alignment of the content column. @default "start" */
  align?: HeroAlign;
  /** Vertical scale (padding + type size). @default "md" */
  size?: HeroSize;
  /** Background treatment. @default "none" */
  background?: HeroBackground;
  /** Heading element to render for the title. @default "h1" */
  as?: "h1" | "h2";
}

/**
 * Hero — a large section header: optional eyebrow, a title + subtitle, an
 * actions slot, and an optional media/visual that switches the layout to a
 * two-column split. Supports `start`/`center` alignment, three sizes and an
 * optional subtle or brand `gradient` background.
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    eyebrow,
    title,
    subtitle,
    actions,
    media,
    align = "start",
    size = "md",
    background = "none",
    as = "h1",
    className,
    ...rest
  },
  ref,
) {
  const Heading = as;
  const hasMedia = media != null;

  return (
    <section
      ref={ref}
      className={cn(
        "nova-hero",
        `nova-hero--${align}`,
        `nova-hero--${size}`,
        `nova-hero--bg-${background}`,
        hasMedia && "nova-hero--split",
        className,
      )}
      {...rest}
    >
      <div className="nova-hero__content">
        {eyebrow != null && (
          <p className="nova-hero__eyebrow">{eyebrow}</p>
        )}
        <Heading className="nova-hero__title">{title}</Heading>
        {subtitle != null && (
          <p className="nova-hero__subtitle">{subtitle}</p>
        )}
        {actions != null && (
          <div className="nova-hero__actions">{actions}</div>
        )}
      </div>
      {hasMedia && <div className="nova-hero__media">{media}</div>}
    </section>
  );
});
