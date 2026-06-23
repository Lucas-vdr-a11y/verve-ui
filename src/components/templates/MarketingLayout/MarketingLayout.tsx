import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MarketingLayout.css";

export interface MarketingLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand slot (logo + name) at the start of the nav. */
  brand?: React.ReactNode;
  /** Primary navigation links slot, rendered as a `<nav>` landmark. */
  links?: React.ReactNode;
  /** Call-to-action slot at the end of the nav. */
  cta?: React.ReactNode;
  /** Footer slot, rendered as a `<footer>` landmark. */
  footer?: React.ReactNode;
  /**
   * Render the nav with a solid surface from the start instead of the
   * transparent-to-solid scroll treatment. @default false
   */
  solidNav?: boolean;
  /** Height of the sticky nav (any CSS length). @default "4rem" */
  navHeight?: string;
  /** Landing-page content. */
  children?: React.ReactNode;
}

/**
 * MarketingLayout — landing-page wrapper. A sticky nav (brand, links, CTA) that
 * transitions from transparent to a solid surface as the page scrolls (pure CSS
 * via a sentinel + sticky element), the main content, and a footer. SSR-safe
 * and self-contained.
 */
export const MarketingLayout = forwardRef<HTMLDivElement, MarketingLayoutProps>(
  function MarketingLayout(
    {
      brand,
      links,
      cta,
      footer,
      solidNav = false,
      navHeight = "4rem",
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
          "nova-marketing",
          solidNav && "nova-marketing--solid-nav",
          className,
        )}
        style={
          {
            "--nova-marketing-nav-h": navHeight,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {/* Sentinel: when scrolled out of view the sticky nav reads as solid. */}
        <div className="nova-marketing__sentinel" aria-hidden="true" />
        <header className="nova-marketing__nav">
          <div className="nova-marketing__nav-inner">
            {brand != null && (
              <div className="nova-marketing__brand">{brand}</div>
            )}
            {links != null && (
              <nav className="nova-marketing__links" aria-label="Primary">
                {links}
              </nav>
            )}
            {cta != null && <div className="nova-marketing__cta">{cta}</div>}
          </div>
        </header>
        <main id="main" className="nova-marketing__main">
          {children}
        </main>
        {footer != null && (
          <footer className="nova-marketing__footer">{footer}</footer>
        )}
      </div>
    );
  },
);
