import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Dock.css";

export interface DockItem {
  /** Unique key identifying the item. */
  key: string;
  /** Icon rendered inside the dock button. */
  icon: React.ReactNode;
  /** Label shown in the tooltip and used as the accessible name. */
  label: string;
  /** Marks the item as active (shows the indicator dot). */
  active?: boolean;
  /** Disable interaction for this item. */
  disabled?: boolean;
  /** Optional href — renders the item as an anchor. */
  href?: string;
}

export type DockSize = "sm" | "md" | "lg";

export interface DockProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Items to render. */
  items: DockItem[];
  /** Called with the key of the item that was activated. */
  onSelect?: (key: string) => void;
  /** Size of the dock icons. Defaults to `"md"`. */
  size?: DockSize;
  /** Enable the hover magnify effect. Defaults to `true`. */
  magnify?: boolean;
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

export const Dock = forwardRef<HTMLElement, DockProps>(function Dock(
  {
    items,
    onSelect,
    size = "md",
    magnify = true,
    className,
    "aria-label": ariaLabel = "Dock",
    ...rest
  },
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        "nova-dock",
        `nova-dock--${size}`,
        magnify && "nova-dock--magnify",
        className
      )}
      {...rest}
    >
      <ul className="nova-dock__list">
        {items.map((item) => {
          const content = (
            <>
              <span className="nova-dock__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nova-dock__tooltip" role="tooltip">
                {item.label}
              </span>
              {item.active && (
                <span className="nova-dock__dot" aria-hidden="true" />
              )}
            </>
          );

          const shared = {
            className: cn("nova-dock__item", "nova-focusable"),
            "aria-label": item.label,
            "aria-current": item.active ? ("page" as const) : undefined,
          };

          return (
            <li className="nova-dock__cell" key={item.key}>
              {item.href && !item.disabled ? (
                <a
                  {...shared}
                  href={item.href}
                  onClick={() => onSelect?.(item.key)}
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
                    if (!item.disabled) onSelect?.(item.key);
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
});
