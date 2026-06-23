import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SplitAuthLayout.css";

export interface SplitAuthLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Brand slot (logo + name) shown above the form. */
  brand?: React.ReactNode;
  /** Form heading. */
  title?: React.ReactNode;
  /** Supporting copy under the title. */
  subtitle?: React.ReactNode;
  /** Footer slot under the form (links, secondary actions). */
  footer?: React.ReactNode;
  /** Decorative / marketing visual panel (media + copy). */
  aside?: React.ReactNode;
  /** Place the aside panel before the form (visual on the left). @default false */
  reverse?: boolean;
  /** Width of the aside panel on wide screens (any CSS length). @default "44%" */
  asideWidth?: string;
  /** The form / primary content. */
  children?: React.ReactNode;
}

/**
 * SplitAuthLayout — two-column authentication shell. One column hosts the
 * brand + form, the other a decorative marketing panel. Collapses to a single
 * column on small screens (the aside drops below the form, or hides if empty).
 * Reversible via `reverse`. SSR-safe and self-contained.
 */
export const SplitAuthLayout = forwardRef<HTMLDivElement, SplitAuthLayoutProps>(
  function SplitAuthLayout(
    {
      brand,
      title,
      subtitle,
      footer,
      aside,
      reverse = false,
      asideWidth = "44%",
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
          "nova-split-auth",
          aside != null && "nova-split-auth--has-aside",
          reverse && "nova-split-auth--reverse",
          className,
        )}
        style={
          {
            "--nova-split-auth-aside-w": asideWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <main id="main" className="nova-split-auth__form-panel">
          <div className="nova-split-auth__form-inner">
            {brand != null && (
              <div className="nova-split-auth__brand">{brand}</div>
            )}
            {(title != null || subtitle != null) && (
              <header className="nova-split-auth__head">
                {title != null && (
                  <h1 className="nova-split-auth__title">{title}</h1>
                )}
                {subtitle != null && (
                  <p className="nova-split-auth__subtitle">{subtitle}</p>
                )}
              </header>
            )}
            <div className="nova-split-auth__body">{children}</div>
            {footer != null && (
              <footer className="nova-split-auth__footer">{footer}</footer>
            )}
          </div>
        </main>
        {aside != null && (
          <aside className="nova-split-auth__aside">{aside}</aside>
        )}
      </div>
    );
  },
);
