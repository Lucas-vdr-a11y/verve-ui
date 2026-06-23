import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ErrorLayout.css";

export interface ErrorLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Big code / illustration slot (e.g. "404" or an SVG graphic). */
  code?: React.ReactNode;
  /** Error / empty-state heading. */
  title?: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Action slot (primary / secondary buttons). */
  actions?: React.ReactNode;
  /** Optional support links slot rendered under the actions. */
  support?: React.ReactNode;
  /** Max width of the centered content (any CSS length). @default "32rem" */
  maxWidth?: string;
  /** Additional content (rendered below the description, above actions). */
  children?: React.ReactNode;
}

/**
 * ErrorLayout — full-page error / empty-state screen. Centers a large code or
 * illustration, a title, a description, action buttons and optional support
 * links. SSR-safe and self-contained.
 */
export const ErrorLayout = forwardRef<HTMLDivElement, ErrorLayoutProps>(
  function ErrorLayout(
    {
      code,
      title,
      description,
      actions,
      support,
      maxWidth = "32rem",
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
        className={cn("nova-error-layout", className)}
        style={
          {
            "--nova-error-layout-max-w": maxWidth,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <main id="main" className="nova-error-layout__main">
          <div className="nova-error-layout__inner">
            {code != null && (
              <div className="nova-error-layout__code">{code}</div>
            )}
            {title != null && (
              <h1 className="nova-error-layout__title">{title}</h1>
            )}
            {description != null && (
              <p className="nova-error-layout__description">{description}</p>
            )}
            {children}
            {actions != null && (
              <div className="nova-error-layout__actions">{actions}</div>
            )}
            {support != null && (
              <div className="nova-error-layout__support">{support}</div>
            )}
          </div>
        </main>
      </div>
    );
  },
);
