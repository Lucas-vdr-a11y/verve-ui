import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AppShell.css";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header slot, rendered as a `<header>` landmark across the top. */
  header?: React.ReactNode;
  /** Left sidebar slot, rendered as a `<nav>` landmark. */
  sidebar?: React.ReactNode;
  /** Optional right aside slot, rendered as an `<aside>` landmark. */
  aside?: React.ReactNode;
  /** Footer slot, rendered as a `<footer>` landmark across the bottom. */
  footer?: React.ReactNode;
  /** Width of the left sidebar (any CSS length). @default "16rem" */
  sidebarWidth?: string;
  /** Width of the left sidebar when collapsed (any CSS length). @default "4rem" */
  sidebarCollapsedWidth?: string;
  /** Height of the header (any CSS length). @default "3.5rem" */
  headerHeight?: string;
  /** Width of the right aside (any CSS length). @default "18rem" */
  asideWidth?: string;
  /** Collapse the sidebar to its rail width. @default false */
  collapsed?: boolean;
  /** Make the header stick to the top while content scrolls. @default true */
  stickyHeader?: boolean;
  /**
   * Controlled visibility of the sidebar on small screens. When `false` the
   * sidebar is hidden off-canvas. Defaults to visible.
   * @default true
   */
  sidebarOpen?: boolean;
  /** Main content. */
  children?: React.ReactNode;
}

/**
 * AppShell — responsive application layout built on CSS grid. Composes a sticky
 * header, a collapsible left sidebar, an optional right aside, a footer and the
 * main content region. Each region maps to a semantic landmark. On small
 * screens the sidebar can be hidden off-canvas via the controlled
 * `sidebarOpen` prop. SSR-safe (no `window`/`document` access).
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      header,
      sidebar,
      aside,
      footer,
      sidebarWidth = "16rem",
      sidebarCollapsedWidth = "4rem",
      headerHeight = "3.5rem",
      asideWidth = "18rem",
      collapsed = false,
      stickyHeader = true,
      sidebarOpen = true,
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
          "nova-app-shell",
          sidebar != null && "nova-app-shell--has-sidebar",
          aside != null && "nova-app-shell--has-aside",
          collapsed && "nova-app-shell--collapsed",
          !sidebarOpen && "nova-app-shell--sidebar-hidden",
          className,
        )}
        style={
          {
            "--nova-app-shell-sidebar-w": collapsed
              ? sidebarCollapsedWidth
              : sidebarWidth,
            "--nova-app-shell-header-h": headerHeight,
            "--nova-app-shell-aside-w": asideWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {header != null && (
          <header
            className={cn(
              "nova-app-shell__header",
              stickyHeader && "nova-app-shell__header--sticky",
            )}
          >
            {header}
          </header>
        )}
        {sidebar != null && (
          <nav className="nova-app-shell__sidebar">{sidebar}</nav>
        )}
        <main className="nova-app-shell__main">{children}</main>
        {aside != null && (
          <aside className="nova-app-shell__aside">{aside}</aside>
        )}
        {footer != null && (
          <footer className="nova-app-shell__footer">{footer}</footer>
        )}
      </div>
    );
  },
);
