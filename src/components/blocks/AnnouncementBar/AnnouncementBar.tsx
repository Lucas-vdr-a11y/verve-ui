import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./AnnouncementBar.css";

export type AnnouncementBarTone = "gradient" | "brand" | "neutral";

export interface AnnouncementBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The announcement message. */
  message: React.ReactNode;
  /** Optional CTA/link slot rendered after the message. */
  action?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Background treatment. @default "gradient" */
  tone?: AnnouncementBarTone;
  /** Show a dismiss button. @default false */
  dismissible?: boolean;
  /** Called when the bar is dismissed. */
  onDismiss?: () => void;
  /** Label for the dismiss button. @default "Dismiss announcement" */
  dismissLabel?: string;
}

const CloseIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * AnnouncementBar — a slim, centered, marketing-flavored strip for the top of a
 * page. Supports a gradient/brand/neutral tone, an optional CTA, and an
 * optional dismiss button. Hides itself once dismissed.
 */
export const AnnouncementBar = forwardRef<HTMLDivElement, AnnouncementBarProps>(
  function AnnouncementBar(
    {
      message,
      action,
      icon,
      tone = "gradient",
      dismissible = false,
      onDismiss,
      dismissLabel = "Dismiss announcement",
      className,
      ...rest
    },
    ref,
  ) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Announcement"
        className={cn(
          "nova-announcement-bar",
          `nova-announcement-bar--${tone}`,
          dismissible && "nova-announcement-bar--dismissible",
          className,
        )}
        {...rest}
      >
        <p className="nova-announcement-bar__content">
          {icon && (
            <span className="nova-announcement-bar__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="nova-announcement-bar__message">{message}</span>
          {action && (
            <span className="nova-announcement-bar__action">{action}</span>
          )}
        </p>

        {dismissible && (
          <button
            type="button"
            className="nova-announcement-bar__dismiss"
            onClick={handleDismiss}
            aria-label={dismissLabel}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  },
);
