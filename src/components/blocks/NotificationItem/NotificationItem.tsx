import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./NotificationItem.css";

export interface NotificationItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Leading icon or avatar slot. */
  icon?: React.ReactNode;
  /** Notification title / headline. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Relative or absolute timestamp, e.g. "2h ago". */
  timestamp?: React.ReactNode;
  /** Whether the notification is unread (shows a dot + emphasis). @default false */
  unread?: boolean;
  /** Custom action slot, rendered on the trailing edge. Overrides the built-ins. */
  actions?: React.ReactNode;
  /** Show the built-in "mark as read" action. Ignored when `actions` is set. */
  onMarkRead?: React.MouseEventHandler<HTMLButtonElement>;
  /** Show the built-in "dismiss" action. Ignored when `actions` is set. */
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * NotificationItem — a single notification row for lists and dropdowns:
 * icon/avatar, title, description, timestamp, unread dot and actions.
 */
export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  function NotificationItem(
    {
      icon,
      title,
      description,
      timestamp,
      unread = false,
      actions,
      onMarkRead,
      onDismiss,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-notification-item",
          unread && "nova-notification-item--unread",
          className,
        )}
        {...rest}
      >
        <span className="nova-notification-item__dot-col" aria-hidden="true">
          {unread && <span className="nova-notification-item__dot" />}
        </span>

        {icon && (
          <span className="nova-notification-item__media" aria-hidden="true">
            {icon}
          </span>
        )}

        <div className="nova-notification-item__body">
          <div className="nova-notification-item__title">
            {title}
            {unread && (
              <span className="nova-notification-item__sr-only">
                {" "}
                (unread)
              </span>
            )}
          </div>
          {description && (
            <div className="nova-notification-item__description">
              {description}
            </div>
          )}
          {timestamp && (
            <div className="nova-notification-item__timestamp">{timestamp}</div>
          )}
        </div>

        {actions ? (
          <div className="nova-notification-item__actions">{actions}</div>
        ) : (
          (onMarkRead || onDismiss) && (
            <div className="nova-notification-item__actions">
              {onMarkRead && (
                <button
                  type="button"
                  className="nova-notification-item__action"
                  onClick={onMarkRead}
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <CheckIcon />
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  className="nova-notification-item__action"
                  onClick={onDismiss}
                  aria-label="Dismiss"
                  title="Dismiss"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )
        )}
      </div>
    );
  },
);
