import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DashboardLayout.css";

export interface DashboardLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand slot (logo + name) at the start of the top bar. */
  brand?: React.ReactNode;
  /** Search slot, rendered in the middle of the top bar. */
  search?: React.ReactNode;
  /** Actions / avatar slot at the end of the top bar. */
  actions?: React.ReactNode;
  /** Left sidebar navigation slot, rendered as a `<nav>` landmark. */
  nav?: React.ReactNode;
  /** Optional page header slot above the main content. */
  pageHeader?: React.ReactNode;
  /** Optional right rail slot, rendered as an `<aside>` landmark. */
  rightRail?: React.ReactNode;
  /** Width of the left sidebar (any CSS length). @default "16rem" */
  sidebarWidth?: string;
  /** Width of the right rail (any CSS length). @default "20rem" */
  rightRailWidth?: string;
  /** Height of the top bar (any CSS length). @default "3.5rem" */
  topbarHeight?: string;
  /**
   * Controlled visibility of the sidebar on small screens. When `false` the
   * sidebar is hidden off-canvas. @default true
   */
  sidebarOpen?: boolean;
  /** Fired when the off-canvas scrim is clicked (to close the sidebar). */
  onSidebarClose?: () => void;
  /** Main content. */
  children?: React.ReactNode;
}

/**
 * DashboardLayout — application dashboard shell on CSS grid. A sticky top bar
 * (brand, search, actions), a left navigation sidebar, a main content area with
 * an optional page header, and an optional right rail. On small screens the
 * sidebar becomes off-canvas, toggled via the controlled `sidebarOpen` prop.
 * Each region maps to a semantic landmark. SSR-safe and self-contained.
 */
export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
  function DashboardLayout(
    {
      brand,
      search,
      actions,
      nav,
      pageHeader,
      rightRail,
      sidebarWidth = "16rem",
      rightRailWidth = "20rem",
      topbarHeight = "3.5rem",
      sidebarOpen = true,
      onSidebarClose,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-dashboard",
          nav != null && "nova-dashboard--has-nav",
          rightRail != null && "nova-dashboard--has-rail",
          !sidebarOpen && "nova-dashboard--sidebar-hidden",
          className,
        )}
        style={
          {
            "--nova-dashboard-sidebar-w": sidebarWidth,
            "--nova-dashboard-rail-w": rightRailWidth,
            "--nova-dashboard-topbar-h": topbarHeight,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <header className="nova-dashboard__topbar">
          {brand != null && (
            <div className="nova-dashboard__brand">{brand}</div>
          )}
          {search != null && (
            <div className="nova-dashboard__search">{search}</div>
          )}
          {actions != null && (
            <div className="nova-dashboard__actions">{actions}</div>
          )}
        </header>

        {nav != null && (
          <nav className="nova-dashboard__sidebar">{nav}</nav>
        )}

        {nav != null && (
          <button
            type="button"
            className="nova-dashboard__scrim"
            aria-label="Close navigation"
            tabIndex={sidebarOpen ? 0 : -1}
            onClick={onSidebarClose}
          />
        )}

        <main id="main" className="nova-dashboard__main">
          {pageHeader != null && (
            <div className="nova-dashboard__page-header">{pageHeader}</div>
          )}
          <div className="nova-dashboard__content">{children}</div>
        </main>

        {rightRail != null && (
          <aside className="nova-dashboard__rail">{rightRail}</aside>
        )}
      </div>
    );
  },
);
