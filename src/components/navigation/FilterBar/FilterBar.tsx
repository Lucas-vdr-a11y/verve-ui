import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FilterBar.css";

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of active filters. When > 0 a count badge and the clear-all
   * control are shown.
   */
  activeCount?: number;
  /** Called when the clear-all control is activated. */
  onClearAll?: () => void;
  /** Label for the clear-all control. @default "Clear all" */
  clearLabel?: string;
  /** Optional leading content (e.g. a "Filters" label or search input). */
  label?: React.ReactNode;
  /** Accessible label for the toolbar. @default "Filters" */
  "aria-label"?: string;
}

/**
 * FilterBar — a horizontal toolbar that holds filter pills/chips, shows an
 * active-filter count and a clear-all control. Sits above tables and lists.
 */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  function FilterBar(
    {
      activeCount = 0,
      onClearAll,
      clearLabel = "Clear all",
      label,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const hasActive = activeCount > 0;
    return (
      <div
        ref={ref}
        className={cn("nova-filter-bar", className)}
        role="toolbar"
        aria-label={rest["aria-label"] ?? "Filters"}
        {...rest}
      >
        {label != null && (
          <div className="nova-filter-bar__label">
            {label}
            {hasActive && (
              <span
                className="nova-filter-bar__count"
                aria-label={`${activeCount} active filters`}
              >
                {activeCount}
              </span>
            )}
          </div>
        )}

        <div className="nova-filter-bar__pills">{children}</div>

        {hasActive && onClearAll && (
          <button
            type="button"
            className="nova-filter-bar__clear nova-focusable"
            onClick={onClearAll}
          >
            {clearLabel}
          </button>
        )}
      </div>
    );
  },
);

export type FilterPillVariant = "outline" | "soft";

export interface FilterPillProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  /** Whether the pill is active/selected. */
  active?: boolean;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Visual style. @default "outline" */
  variant?: FilterPillVariant;
  /**
   * When set, renders a remove (×) affordance. Called when it's activated.
   * Use for applied-filter chips that can be dismissed.
   */
  onRemove?: () => void;
  /** Accessible label for the remove control. @default "Remove filter" */
  removeLabel?: string;
}

/**
 * FilterPill — a toggleable / removable filter chip for use inside FilterBar.
 * Toggle via `active` + `onClick`; make it removable via `onRemove`.
 */
export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  function FilterPill(
    {
      active = false,
      icon,
      variant = "outline",
      onRemove,
      removeLabel = "Remove filter",
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <span
        className={cn(
          "nova-filter-bar__pill",
          `nova-filter-bar__pill--${variant}`,
          active && "nova-filter-bar__pill--active",
        )}
      >
        <button
          ref={ref}
          type="button"
          className="nova-filter-bar__pill-btn nova-focusable"
          aria-pressed={active}
          {...rest}
        >
          {icon && (
            <span className="nova-filter-bar__pill-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="nova-filter-bar__pill-label">{children}</span>
        </button>
        {onRemove && (
          <button
            type="button"
            className="nova-filter-bar__pill-remove nova-focusable"
            aria-label={removeLabel}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );
  },
);
