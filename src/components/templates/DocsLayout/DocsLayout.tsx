import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DocsLayout.css";

export interface DocsLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Top bar slot (brand, search, version switcher). */
  topbar?: React.ReactNode;
  /** Left navigation sidebar slot, rendered as a `<nav>` landmark. */
  nav?: React.ReactNode;
  /** Right "on this page" table-of-contents rail. */
  toc?: React.ReactNode;
  /** Width of the left navigation sidebar (any CSS length). @default "16rem" */
  navWidth?: string;
  /** Width of the right TOC rail (any CSS length). @default "15rem" */
  tocWidth?: string;
  /** Height of the top bar (any CSS length). @default "3.5rem" */
  topbarHeight?: string;
  /** Max width of the center content column (any CSS length). @default "48rem" */
  contentMaxWidth?: string;
  /** Documentation content. */
  children?: React.ReactNode;
}

/**
 * DocsLayout — documentation shell on CSS grid. A left navigation sidebar, a
 * centered content column (children) and a right "on this page" TOC rail, under
 * an optional sticky top bar. Both rails hide on small screens, leaving the
 * content full-width. Landmarks for nav/main/aside. SSR-safe, self-contained.
 */
export const DocsLayout = forwardRef<HTMLDivElement, DocsLayoutProps>(
  function DocsLayout(
    {
      topbar,
      nav,
      toc,
      navWidth = "16rem",
      tocWidth = "15rem",
      topbarHeight = "3.5rem",
      contentMaxWidth = "48rem",
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
          "nova-docs",
          topbar != null && "nova-docs--has-topbar",
          nav != null && "nova-docs--has-nav",
          toc != null && "nova-docs--has-toc",
          className,
        )}
        style={
          {
            "--nova-docs-nav-w": navWidth,
            "--nova-docs-toc-w": tocWidth,
            "--nova-docs-topbar-h": topbarHeight,
            "--nova-docs-content-max-w": contentMaxWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {topbar != null && (
          <header className="nova-docs__topbar">{topbar}</header>
        )}
        {nav != null && <nav className="nova-docs__nav">{nav}</nav>}
        <main id="main" className="nova-docs__main">
          <div className="nova-docs__content">{children}</div>
        </main>
        {toc != null && (
          <aside className="nova-docs__toc" aria-label="On this page">
            {toc}
          </aside>
        )}
      </div>
    );
  },
);
