import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FeatureGrid.css";

export interface FeatureGridItem {
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Feature title. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
}

export type FeatureGridColumns = 2 | 3 | 4;

export interface FeatureGridProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Small label above the title. */
  eyebrow?: React.ReactNode;
  /** Section heading. */
  title?: React.ReactNode;
  /** Supporting subtitle below the heading. */
  subtitle?: React.ReactNode;
  /** Feature items rendered into the grid. */
  items: FeatureGridItem[];
  /** Number of columns at the widest breakpoint. @default 3 */
  columns?: FeatureGridColumns;
  /** Content alignment for the header + items. @default "start" */
  align?: "start" | "center";
}

/**
 * FeatureGrid — a section with an optional eyebrow/title/subtitle header and a
 * responsive grid of feature items. The feature-item look is composed inline.
 */
export const FeatureGrid = forwardRef<HTMLElement, FeatureGridProps>(
  function FeatureGrid(
    {
      eyebrow,
      title,
      subtitle,
      items,
      columns = 3,
      align = "start",
      className,
      ...rest
    },
    ref,
  ) {
    const hasHeader = eyebrow || title || subtitle;

    return (
      <section
        ref={ref}
        className={cn(
          "nova-feature-grid",
          `nova-feature-grid--cols-${columns}`,
          `nova-feature-grid--${align}`,
          className,
        )}
        {...rest}
      >
        {hasHeader && (
          <header className="nova-feature-grid__header">
            {eyebrow && (
              <p className="nova-feature-grid__eyebrow">{eyebrow}</p>
            )}
            {title && <h2 className="nova-feature-grid__title">{title}</h2>}
            {subtitle && (
              <p className="nova-feature-grid__subtitle">{subtitle}</p>
            )}
          </header>
        )}

        <ul className="nova-feature-grid__grid" role="list">
          {items.map((item, i) => (
            <li key={i} className="nova-feature-grid__item">
              {item.icon && (
                <span className="nova-feature-grid__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <h3 className="nova-feature-grid__item-title">{item.title}</h3>
              {item.description && (
                <p className="nova-feature-grid__item-description">
                  {item.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
