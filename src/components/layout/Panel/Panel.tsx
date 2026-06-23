import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Panel.css";

export type PanelVariant = "subtle" | "outlined";

export interface PanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visual treatment. @default "subtle" */
  variant?: PanelVariant;
  /** Header title. When set (or `actions`/`description`), a header renders. */
  title?: React.ReactNode;
  /** Secondary line under the title. */
  description?: React.ReactNode;
  /** Header actions, aligned to the trailing edge (buttons, menus, etc.). */
  actions?: React.ReactNode;
  /** Optional footer content rendered below the body. */
  footer?: React.ReactNode;
}

/**
 * Panel — a sectioned surface, lighter than `Card`. Renders an optional header
 * (title + description + trailing actions), a body, and an optional footer.
 * Good for dashboard sections. Variants: `subtle` (soft fill) | `outlined`.
 */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  {
    variant = "subtle",
    title,
    description,
    actions,
    footer,
    className,
    children,
    ...rest
  },
  ref,
) {
  const hasHeader =
    title != null || description != null || actions != null;

  return (
    <div
      ref={ref}
      className={cn("nova-panel", `nova-panel--${variant}`, className)}
      {...rest}
    >
      {hasHeader && (
        <div className="nova-panel__header">
          <div className="nova-panel__heading">
            {title != null && <div className="nova-panel__title">{title}</div>}
            {description != null && (
              <div className="nova-panel__description">{description}</div>
            )}
          </div>
          {actions != null && (
            <div className="nova-panel__actions">{actions}</div>
          )}
        </div>
      )}
      <div className="nova-panel__body">{children}</div>
      {footer != null && <div className="nova-panel__footer">{footer}</div>}
    </div>
  );
});
