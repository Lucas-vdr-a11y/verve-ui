import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./EmptyState.css";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Icon or illustration slot, centered above the title. */
  icon?: React.ReactNode;
  /** Headline. */
  title: React.ReactNode;
  /** Supporting description text. */
  description?: React.ReactNode;
  /** Action slot (buttons, links). */
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { icon, title, description, action, className, children, ...rest },
    ref
  ) {
    return (
      <div ref={ref} className={cn("nova-empty-state", className)} {...rest}>
        {icon && (
          <div className="nova-empty-state__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 className="nova-empty-state__title">{title}</h3>
        {description && (
          <p className="nova-empty-state__description">{description}</p>
        )}
        {children}
        {action && <div className="nova-empty-state__action">{action}</div>}
      </div>
    );
  }
);
