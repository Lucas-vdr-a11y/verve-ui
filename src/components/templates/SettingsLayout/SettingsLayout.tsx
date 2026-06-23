import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SettingsLayout.css";

export interface SettingsLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Page title shown above the content panel. */
  title?: React.ReactNode;
  /** Supporting copy under the page title. */
  description?: React.ReactNode;
  /** Vertical section navigation slot, rendered as a `<nav>` landmark. */
  nav?: React.ReactNode;
  /** Optional actions slot rendered alongside the page title. */
  actions?: React.ReactNode;
  /** Width of the section nav column (any CSS length). @default "15rem" */
  navWidth?: string;
  /** Max width of the content panel (any CSS length). @default "44rem" */
  contentMaxWidth?: string;
  /** Settings content. */
  children?: React.ReactNode;
}

/**
 * SettingsLayout — settings page shell on CSS grid. A vertical section nav on
 * the left and a content panel on the right with a page title. On small screens
 * the nav becomes a horizontal scroller above the panel. Landmarks for
 * nav/main. SSR-safe and self-contained.
 */
export const SettingsLayout = forwardRef<HTMLDivElement, SettingsLayoutProps>(
  function SettingsLayout(
    {
      title,
      description,
      nav,
      actions,
      navWidth = "15rem",
      contentMaxWidth = "44rem",
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
          "nova-settings",
          nav != null && "nova-settings--has-nav",
          className,
        )}
        style={
          {
            "--nova-settings-nav-w": navWidth,
            "--nova-settings-content-max-w": contentMaxWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {nav != null && (
          <nav className="nova-settings__nav" aria-label="Settings sections">
            {nav}
          </nav>
        )}
        <main id="main" className="nova-settings__main">
          <div className="nova-settings__panel">
            {(title != null || description != null || actions != null) && (
              <header className="nova-settings__head">
                <div className="nova-settings__heading">
                  {title != null && (
                    <h1 className="nova-settings__title">{title}</h1>
                  )}
                  {description != null && (
                    <p className="nova-settings__description">{description}</p>
                  )}
                </div>
                {actions != null && (
                  <div className="nova-settings__actions">{actions}</div>
                )}
              </header>
            )}
            <div className="nova-settings__body">{children}</div>
          </div>
        </main>
      </div>
    );
  },
);
