import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Navbar.css";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand / logo slot, rendered at the start. */
  brand?: React.ReactNode;
  /** Action slot (buttons, avatar, menu), rendered at the end. */
  actions?: React.ReactNode;
  /** Stick the bar to the top of the viewport on scroll. Defaults to `false`. */
  sticky?: boolean;
  /** Draw a bottom border. Defaults to `true`. */
  bordered?: boolean;
}

/**
 * Horizontal application bar. Pass nav links as `children` (typically a
 * `<NavbarLink>` list); `brand` and `actions` fill the start/end slots.
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  {
    brand,
    actions,
    sticky = false,
    bordered = true,
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <header
      ref={ref}
      className={cn(
        "nova-navbar",
        sticky && "nova-navbar--sticky",
        bordered && "nova-navbar--bordered",
        className
      )}
      {...rest}
    >
      {brand != null && <div className="nova-navbar__brand">{brand}</div>}

      {children != null && (
        <nav className="nova-navbar__nav" aria-label="Main">
          <ul className="nova-navbar__links">{children}</ul>
        </nav>
      )}

      {actions != null && <div className="nova-navbar__actions">{actions}</div>}
    </header>
  );
});

export interface NavbarLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks this link as the current page. */
  active?: boolean;
}

export const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  function NavbarLink({ active = false, className, children, ...rest }, ref) {
    return (
      <li className="nova-navbar__item">
        <a
          ref={ref}
          className={cn(
            "nova-navbar__link",
            "nova-focusable",
            active && "nova-navbar__link--active",
            className
          )}
          aria-current={active ? "page" : undefined}
          {...rest}
        >
          {children}
        </a>
      </li>
    );
  }
);
