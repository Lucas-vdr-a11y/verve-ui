import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BottomNav.css";

export interface BottomNavItem {
  /** Unique key identifying the item. */
  key: string;
  /** Icon rendered above the label. */
  icon: React.ReactNode;
  /** Text label shown below the icon. */
  label: React.ReactNode;
  /** Optional badge content (number or short text). */
  badge?: React.ReactNode;
  /** Disable interaction for this item. */
  disabled?: boolean;
  /** Optional href — renders the item as an anchor. */
  href?: string;
}

export interface BottomNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Items to render. */
  items: BottomNavItem[];
  /** Key of the currently active item. */
  value?: string;
  /** Called with the key of the item that was activated. */
  onChange?: (key: string) => void;
  /** Pin to the bottom of the viewport. Defaults to `false`. */
  fixed?: boolean;
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  function BottomNav(
    {
      items,
      value,
      onChange,
      fixed = false,
      className,
      "aria-label": ariaLabel = "Bottom navigation",
      ...rest
    },
    ref
  ) {
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "nova-bottom-nav",
          fixed && "nova-bottom-nav--fixed",
          className
        )}
        {...rest}
      >
        <ul className="nova-bottom-nav__list">
          {items.map((item) => {
            const isActive = item.key === value;
            const content = (
              <>
                <span className="nova-bottom-nav__icon" aria-hidden="true">
                  {item.icon}
                  {item.badge != null && (
                    <span className="nova-bottom-nav__badge">{item.badge}</span>
                  )}
                </span>
                <span className="nova-bottom-nav__label">{item.label}</span>
              </>
            );

            const shared = {
              className: cn(
                "nova-bottom-nav__item",
                "nova-focusable",
                isActive && "nova-bottom-nav__item--active"
              ),
              "aria-current": isActive ? ("page" as const) : undefined,
            };

            return (
              <li className="nova-bottom-nav__cell" key={item.key}>
                {item.href && !item.disabled ? (
                  <a
                    {...shared}
                    href={item.href}
                    onClick={() => onChange?.(item.key)}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    {...shared}
                    type="button"
                    disabled={item.disabled}
                    aria-disabled={item.disabled || undefined}
                    onClick={() => {
                      if (!item.disabled) onChange?.(item.key);
                    }}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
);
