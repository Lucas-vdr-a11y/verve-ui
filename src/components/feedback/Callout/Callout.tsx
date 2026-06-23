import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Callout.css";

export type CalloutTone =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface CalloutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Color tone. Defaults to `"info"`. */
  tone?: CalloutTone;
  /** Bold heading rendered above the body. */
  title?: React.ReactNode;
  /** Leading icon. Pass `null` to omit the icon slot entirely. */
  icon?: React.ReactNode;
}

/**
 * Callout — a boxed, docs-style highlighted note with a left accent border,
 * icon, title and rich body. Content-focused; not dismissible.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { tone = "info", title, icon, className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role="note"
      className={cn("nova-callout", `nova-callout--${tone}`, className)}
      {...rest}
    >
      {icon != null && (
        <span className="nova-callout__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="nova-callout__content">
        {title != null && <div className="nova-callout__title">{title}</div>}
        {children != null && (
          <div className="nova-callout__body">{children}</div>
        )}
      </div>
    </div>
  );
});
