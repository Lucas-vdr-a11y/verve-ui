import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./NotificationCard.css";

export type NotificationCardTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface NotificationCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Color tone. Defaults to `"neutral"`. */
  tone?: NotificationCardTone;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Heading text. */
  title?: React.ReactNode;
  /** Body / supporting text. */
  description?: React.ReactNode;
  /** Action controls (buttons, links) rendered below the description. */
  actions?: React.ReactNode;
  /** Show a dismiss button. Defaults to `true`. */
  dismissible?: boolean;
  /** Called when the dismiss button is pressed or auto-dismiss elapses. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
  /**
   * Auto-dismiss after this many ms, showing a countdown progress bar.
   * Omit to disable.
   */
  autoDismissMs?: number;
}

const DEFAULT_ICONS: Record<NotificationCardTone, string | null> = {
  neutral: null,
  primary: "M10 13a1 1 0 100-2 1 1 0 000 2zm0-9v5",
  info: "M10 9v5m0-9a1 1 0 100 2 1 1 0 000-2z",
  success: "M5 10.5l3 3 7-7",
  warning: "M10 6v5m0 3h.01",
  danger: "M6.5 6.5l7 7m0-7l-7 7",
};

export const NotificationCard = forwardRef<
  HTMLDivElement,
  NotificationCardProps
>(function NotificationCard(
  {
    tone = "neutral",
    icon,
    title,
    description,
    actions,
    dismissible = true,
    onDismiss,
    dismissLabel = "Dismiss",
    autoDismissMs,
    className,
    children,
    ...rest
  },
  ref
) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (autoDismissMs == null || autoDismissMs <= 0) return;
    const id = setTimeout(() => onDismissRef.current?.(), autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs]);

  const iconPath = DEFAULT_ICONS[tone];
  const resolvedIcon =
    icon !== undefined
      ? icon
      : iconPath && (
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d={iconPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

  return (
    <div
      ref={ref}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={tone === "danger" || tone === "warning" ? "assertive" : "polite"}
      className={cn(
        "nova-notification-card",
        `nova-notification-card--${tone}`,
        className
      )}
      {...rest}
    >
      {resolvedIcon && (
        <span className="nova-notification-card__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      )}

      <div className="nova-notification-card__content">
        {title != null && (
          <div className="nova-notification-card__title">{title}</div>
        )}
        {description != null && (
          <div className="nova-notification-card__description">
            {description}
          </div>
        )}
        {children}
        {actions != null && (
          <div className="nova-notification-card__actions">{actions}</div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          className="nova-notification-card__dismiss nova-focusable"
          aria-label={dismissLabel}
          onClick={() => onDismiss?.()}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M6 6l8 8M14 6l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {autoDismissMs != null && autoDismissMs > 0 && (
        <span
          className="nova-notification-card__timer"
          style={
            {
              "--nova-notification-card-duration": `${autoDismissMs}ms`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      )}
    </div>
  );
});
