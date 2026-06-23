import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PageHeader.css";

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Page title. Rendered as an `<h1>` by default. */
  title: React.ReactNode;
  /** Secondary description shown under the title. */
  description?: React.ReactNode;
  /** Breadcrumb navigation slot, rendered above the title. */
  breadcrumbs?: React.ReactNode;
  /** Action slot aligned to the trailing edge (buttons, menus, etc.). */
  actions?: React.ReactNode;
  /** Optional avatar or icon shown to the left of the title block. */
  icon?: React.ReactNode;
  /** Optional slot below the header — typically tabs or meta. */
  footer?: React.ReactNode;
  /** Heading element to render for the title. @default "h1" */
  as?: "h1" | "h2" | "h3";
}

/**
 * PageHeader — a page title block: optional breadcrumbs on top, an optional
 * leading avatar/icon, a title + description, trailing actions, and an optional
 * footer slot (typically tabs). Spacing comes entirely from tokens.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      description,
      breadcrumbs,
      actions,
      icon,
      footer,
      as = "h1",
      className,
      ...rest
    },
    ref,
  ) {
    const Heading = as;

    return (
      <header
        ref={ref}
        className={cn("nova-page-header", className)}
        {...rest}
      >
        {breadcrumbs != null && (
          <div className="nova-page-header__breadcrumbs">{breadcrumbs}</div>
        )}
        <div className="nova-page-header__row">
          {icon != null && (
            <div className="nova-page-header__icon">{icon}</div>
          )}
          <div className="nova-page-header__heading">
            <Heading className="nova-page-header__title">{title}</Heading>
            {description != null && (
              <p className="nova-page-header__description">{description}</p>
            )}
          </div>
          {actions != null && (
            <div className="nova-page-header__actions">{actions}</div>
          )}
        </div>
        {footer != null && (
          <div className="nova-page-header__footer">{footer}</div>
        )}
      </header>
    );
  },
);
