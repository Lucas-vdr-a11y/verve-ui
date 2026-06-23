import { forwardRef, useCallback, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ExpandableCard.css";

export interface ExpandableCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "title"> {
  /** Header content, always visible. Acts as the toggle. */
  header: React.ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called with the next expanded state when toggled. */
  onChange?: (expanded: boolean) => void;
  /** Prevent toggling. */
  disabled?: boolean;
}

/**
 * A card whose body expands/collapses via an always-visible header toggle. The
 * body animates open with a grid-rows height transition. Good for settings rows
 * and list items.
 */
export const ExpandableCard = forwardRef<HTMLDivElement, ExpandableCardProps>(
  function ExpandableCard(
    {
      header,
      expanded: expandedProp,
      defaultExpanded = false,
      onChange,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const baseId = useId();
    const triggerId = `${baseId}-trigger`;
    const contentId = `${baseId}-content`;

    const isControlled = expandedProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
    const expanded = isControlled ? expandedProp : uncontrolled;

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !expanded;
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    }, [disabled, expanded, isControlled, onChange]);

    return (
      <div
        ref={ref}
        className={cn("nova-expandable-card", className)}
        data-state={expanded ? "open" : "closed"}
        {...rest}
      >
        <button
          type="button"
          id={triggerId}
          className={cn("nova-expandable-card__header", "nova-focusable")}
          aria-expanded={expanded}
          aria-controls={contentId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={toggle}
        >
          <span className="nova-expandable-card__header-content">{header}</span>
          <svg
            className="nova-expandable-card__chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className="nova-expandable-card__body"
          data-state={expanded ? "open" : "closed"}
          aria-hidden={!expanded}
        >
          <div className="nova-expandable-card__body-clip">
            <div
              className="nova-expandable-card__body-inner"
              {...(!expanded ? { inert: "true" } : {})}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
