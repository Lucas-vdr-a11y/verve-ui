import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TimelineSection.css";

export interface TimelineMilestone {
  /** Date or stage label (e.g. "2021", "Q3"). */
  date: React.ReactNode;
  /** Milestone title. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Optional icon shown in the marker. */
  icon?: React.ReactNode;
}

export interface TimelineSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Section heading. */
  title?: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Milestones in chronological order. */
  milestones: TimelineMilestone[];
  /** Layout: single-side or alternating sides. @default "vertical" */
  layout?: "vertical" | "alternating";
}

/**
 * TimelineSection — a vertical or alternating timeline of milestones, ideal for
 * an "our story" or roadmap section. Each milestone has a date, title, optional
 * description, and an optional marker icon.
 */
export const TimelineSection = forwardRef<HTMLElement, TimelineSectionProps>(
  function TimelineSection(
    {
      title,
      subtitle,
      milestones,
      layout = "vertical",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          "nova-timeline",
          `nova-timeline--${layout}`,
          className,
        )}
        {...rest}
      >
        {(title || subtitle) && (
          <header className="nova-timeline__header">
            {title && <h2 className="nova-timeline__title">{title}</h2>}
            {subtitle && (
              <p className="nova-timeline__subtitle">{subtitle}</p>
            )}
          </header>
        )}

        <ol className="nova-timeline__list">
          {milestones.map((m, i) => (
            <li key={i} className="nova-timeline__item">
              <div className="nova-timeline__marker" aria-hidden="true">
                {m.icon ? (
                  <span className="nova-timeline__icon">{m.icon}</span>
                ) : (
                  <span className="nova-timeline__dot" />
                )}
              </div>
              <div className="nova-timeline__content">
                <p className="nova-timeline__date">{m.date}</p>
                <h3 className="nova-timeline__item-title">{m.title}</h3>
                {m.description && (
                  <p className="nova-timeline__description">{m.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  },
);
