import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./NavList.css";

export interface NavListProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

const NavListRoot = forwardRef<HTMLElement, NavListProps>(function NavList(
  { className, children, "aria-label": ariaLabel, ...rest },
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn("nova-nav-list", className)}
      {...rest}
    >
      <ul className="nova-nav-list__group" role="list">
        {children}
      </ul>
    </nav>
  );
});

export interface NavListSectionProps
  extends React.HTMLAttributes<HTMLLIElement> {
  /** Heading text for the section. */
  heading?: React.ReactNode;
}

export const NavListSection = forwardRef<HTMLLIElement, NavListSectionProps>(
  function NavListSection({ heading, className, children, ...rest }, ref) {
    return (
      <li
        ref={ref}
        className={cn("nova-nav-list__section", className)}
        {...rest}
      >
        {heading != null && (
          <span className="nova-nav-list__heading" role="presentation">
            {heading}
          </span>
        )}
        <ul className="nova-nav-list__group" role="list">
          {children}
        </ul>
      </li>
    );
  }
);

export interface NavListItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "label"> {
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Item text label. */
  label: React.ReactNode;
  /** Marks the item as the current page. */
  active?: boolean;
  /** Optional trailing badge content. */
  badge?: React.ReactNode;
  /** Disable interaction. */
  disabled?: boolean;
}

export const NavListItem = forwardRef<HTMLAnchorElement, NavListItemProps>(
  function NavListItem(
    { icon, label, active = false, badge, disabled, className, href, ...rest },
    ref
  ) {
    return (
      <li className="nova-nav-list__cell">
        <a
          ref={ref}
          href={disabled ? undefined : href}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          className={cn(
            "nova-nav-list__item",
            "nova-focusable",
            active && "nova-nav-list__item--active",
            disabled && "nova-nav-list__item--disabled",
            className
          )}
          {...rest}
        >
          {icon != null && (
            <span className="nova-nav-list__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="nova-nav-list__label">{label}</span>
          {badge != null && (
            <span className="nova-nav-list__badge">{badge}</span>
          )}
        </a>
      </li>
    );
  }
);

export const NavList = Object.assign(NavListRoot, {
  Section: NavListSection,
  Item: NavListItem,
});
