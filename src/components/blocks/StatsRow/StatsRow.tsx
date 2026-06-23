import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StatsRow.css";

export interface StatsRowItem {
  /** Headline figure (e.g. "99.9%", "12k"). */
  value: React.ReactNode;
  /** Short label under the value. */
  label: React.ReactNode;
  /** Optional supporting detail. */
  description?: React.ReactNode;
}

export interface StatsRowProps extends React.HTMLAttributes<HTMLElement> {
  /** Stats rendered across the band. */
  stats: StatsRowItem[];
  /** Background treatment. @default "subtle" */
  variant?: "subtle" | "plain" | "brand";
  /** Show dividers between stats. @default true */
  dividers?: boolean;
  /** Accessible label for the region. */
  "aria-label"?: string;
}

/**
 * StatsRow — a band of key stats with optional dividers. Reads well placed
 * directly under a hero. Renders as a list of figure/label pairs.
 */
export const StatsRow = forwardRef<HTMLElement, StatsRowProps>(
  function StatsRow(
    {
      stats,
      variant = "subtle",
      dividers = true,
      className,
      "aria-label": ariaLabel = "Key statistics",
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "nova-stats-row",
          `nova-stats-row--${variant}`,
          dividers && "nova-stats-row--dividers",
          className,
        )}
        {...rest}
      >
        <dl className="nova-stats-row__list">
          {stats.map((stat, i) => (
            <div key={i} className="nova-stats-row__item">
              <dt className="nova-stats-row__value">{stat.value}</dt>
              <dd className="nova-stats-row__body">
                <span className="nova-stats-row__label">{stat.label}</span>
                {stat.description && (
                  <span className="nova-stats-row__description">
                    {stat.description}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  },
);
