import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AuthLayout.css";

export interface AuthLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Brand slot (logo + name), rendered above the card. */
  brand?: React.ReactNode;
  /** Card heading. */
  title?: React.ReactNode;
  /** Supporting copy under the title. */
  subtitle?: React.ReactNode;
  /** Footer slot (links, secondary actions) rendered under the card. */
  footer?: React.ReactNode;
  /** Render a subtle brand gradient background instead of a flat surface. @default true */
  gradient?: boolean;
  /** Max width of the auth card (any CSS length). @default "26rem" */
  maxWidth?: string;
  /** The form / primary content. */
  children?: React.ReactNode;
}

/**
 * AuthLayout — centered authentication shell. A single card floats over a
 * subtle (optionally gradient) background, with brand, title/subtitle, the
 * form (children) and a footer slot. Responsive and SSR-safe. Self-contained:
 * does not import other Verve components.
 */
export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  function AuthLayout(
    {
      brand,
      title,
      subtitle,
      footer,
      gradient = true,
      maxWidth = "26rem",
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
          "nova-auth-layout",
          gradient && "nova-auth-layout--gradient",
          className,
        )}
        style={
          {
            "--nova-auth-layout-max-w": maxWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <main id="main" className="nova-auth-layout__main">
          <div className="nova-auth-layout__inner">
            {brand != null && (
              <div className="nova-auth-layout__brand">{brand}</div>
            )}
            <section className="nova-auth-layout__card">
              {(title != null || subtitle != null) && (
                <header className="nova-auth-layout__head">
                  {title != null && (
                    <h1 className="nova-auth-layout__title">{title}</h1>
                  )}
                  {subtitle != null && (
                    <p className="nova-auth-layout__subtitle">{subtitle}</p>
                  )}
                </header>
              )}
              <div className="nova-auth-layout__body">{children}</div>
            </section>
            {footer != null && (
              <footer className="nova-auth-layout__footer">{footer}</footer>
            )}
          </div>
        </main>
      </div>
    );
  },
);
