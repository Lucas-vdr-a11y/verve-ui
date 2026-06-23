import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Alert.css";

export type AlertTone = "info" | "success" | "warning" | "danger";
export type AlertVariant = "solid" | "soft" | "outline";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Color tone. Defaults to `"info"`. */
  tone?: AlertTone;
  /** Visual style. Defaults to `"soft"`. */
  variant?: AlertVariant;
  /** Bold heading rendered above the body. */
  title?: React.ReactNode;
  /** Leading icon. Pass `null` to omit the default slot entirely. */
  icon?: React.ReactNode;
  /** Renders a dismiss button and wires `onDismiss`. */
  dismissible?: boolean;
  /** Called when the dismiss button is activated. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    tone = "info",
    variant = "soft",
    title,
    icon,
    dismissible = false,
    onDismiss,
    dismissLabel = "Dismiss",
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "nova-alert",
        `nova-alert--${tone}`,
        `nova-alert--${variant}`,
        className
      )}
      {...rest}
    >
      {icon != null && (
        <span className="nova-alert__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="nova-alert__content">
        {title != null && <div className="nova-alert__title">{title}</div>}
        {children != null && <div className="nova-alert__body">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          className="nova-alert__dismiss nova-focusable"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});
