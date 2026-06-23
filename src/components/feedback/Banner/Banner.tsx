import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Banner.css";

export type BannerTone = "info" | "success" | "warning" | "danger" | "neutral";

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Color tone. Defaults to `"info"`. */
  tone?: BannerTone;
  /** Leading icon. Pass `null` to omit the icon slot entirely. */
  icon?: React.ReactNode;
  /** Optional trailing action (link or button) rendered after the message. */
  action?: React.ReactNode;
  /** Renders a dismiss button and wires `onDismiss`. */
  dismissible?: boolean;
  /** Called when the dismiss button is activated. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
  /** Center the message horizontally. Defaults to `false`. */
  center?: boolean;
}

/**
 * Banner — full-width, edge-to-edge announcement bar for the top of a page.
 * Slimmer and flatter than Alert; not boxed.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    tone = "info",
    icon,
    action,
    dismissible = false,
    onDismiss,
    dismissLabel = "Dismiss",
    center = false,
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        "nova-banner",
        `nova-banner--${tone}`,
        center && "nova-banner--center",
        className
      )}
      {...rest}
    >
      <div className="nova-banner__inner">
        {icon != null && (
          <span className="nova-banner__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="nova-banner__message">{children}</span>
        {action != null && <span className="nova-banner__action">{action}</span>}
      </div>
      {dismissible && (
        <button
          type="button"
          className="nova-banner__dismiss nova-focusable"
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
