import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Section.css";

/** Spacing scale keys that map onto the `--nova-space-*` tokens. */
export type SectionSpace = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Section heading. When set (or `description`), a header renders. */
  title?: React.ReactNode;
  /** Supporting text under the title. */
  description?: React.ReactNode;
  /**
   * Vertical (block-axis) padding, from the `--nova-space-*` scale. Drives the
   * page's vertical rhythm. @default 12
   */
  paddingY?: SectionSpace;
  /** Heading level for the title element. @default 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Section — a semantic `<section>` with token-scaled vertical rhythm and an
 * optional title/description header. Use it to break a page into evenly-spaced
 * regions.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    title,
    description,
    paddingY = 12,
    headingLevel = 2,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const hasHeader = title != null || description != null;
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      ref={ref}
      className={cn("nova-section", className)}
      style={
        {
          "--nova-section-py": `var(--nova-space-${paddingY})`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {hasHeader && (
        <div className="nova-section__header">
          {title != null && (
            <Heading className="nova-section__title">{title}</Heading>
          )}
          {description != null && (
            <p className="nova-section__description">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
});
