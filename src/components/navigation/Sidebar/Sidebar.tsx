import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Sidebar.css";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Collapse to icon-only mode. */
  collapsed?: boolean;
  /** Accessible label for the nav landmark. Defaults to `"Sidebar"`. */
  "aria-label"?: string;
}

/** Vertical application navigation rail. */
const SidebarBase = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsed = false, className, children, "aria-label": ariaLabel, ...rest },
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? "Sidebar"}
      data-collapsed={collapsed || undefined}
      className={cn(
        "nova-sidebar",
        collapsed && "nova-sidebar--collapsed",
        className
      )}
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface SidebarItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Label text (hidden when the sidebar is collapsed). */
  label: React.ReactNode;
  /** Marks the current item. */
  active?: boolean;
  /** Trailing badge content (e.g. a count). */
  badge?: React.ReactNode;
}

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(
  function SidebarItem(
    { icon, label, active = false, badge, className, ...rest },
    ref
  ) {
    return (
      <a
        ref={ref}
        aria-current={active ? "page" : undefined}
        className={cn(
          "nova-sidebar__item",
          active && "nova-sidebar__item--active",
          className
        )}
        title={typeof label === "string" ? label : undefined}
        {...rest}
      >
        {icon && (
          <span className="nova-sidebar__item-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="nova-sidebar__item-label">{label}</span>
        {badge != null && (
          <span className="nova-sidebar__item-badge">{badge}</span>
        )}
      </a>
    );
  }
);

export interface SidebarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Group heading label. */
  label?: React.ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ label, className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn("nova-sidebar__group", className)}
        {...rest}
      >
        {label != null && (
          <div className="nova-sidebar__group-label">{label}</div>
        )}
        <div className="nova-sidebar__group-items">{children}</div>
      </div>
    );
  }
);

type SidebarComponent = typeof SidebarBase & {
  Item: typeof SidebarItem;
  Group: typeof SidebarGroup;
};

const Sidebar = SidebarBase as SidebarComponent;
Sidebar.Item = SidebarItem;
Sidebar.Group = SidebarGroup;

export { Sidebar };
