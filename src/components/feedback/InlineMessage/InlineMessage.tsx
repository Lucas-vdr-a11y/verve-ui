import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./InlineMessage.css";

export type InlineMessageTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface InlineMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Color tone. Defaults to `"neutral"`. */
  tone?: InlineMessageTone;
  /**
   * Leading icon. Pass a node to override, `null` to omit. When omitted, a
   * built-in tone icon is shown for non-neutral tones.
   */
  icon?: React.ReactNode;
}

const toneIcon: Record<InlineMessageTone, React.ReactNode> = {
  neutral: null,
  info: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5M12 7.5v.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4l9 16H3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v4M12 17.5v.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5v5M12 16v.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * InlineMessage — compact inline validation/help text, e.g. under a form field.
 * `danger` and `warning` tones announce assertively for accessibility.
 */
export const InlineMessage = forwardRef<HTMLParagraphElement, InlineMessageProps>(
  function InlineMessage(
    { tone = "neutral", icon, className, children, ...rest },
    ref
  ) {
    const resolvedIcon = icon !== undefined ? icon : toneIcon[tone];
    const assertive = tone === "danger" || tone === "warning";
    return (
      <p
        ref={ref}
        role="status"
        aria-live={assertive ? "assertive" : "polite"}
        className={cn(
          "nova-inline-message",
          `nova-inline-message--${tone}`,
          className
        )}
        {...rest}
      >
        {resolvedIcon != null && (
          <span className="nova-inline-message__icon" aria-hidden="true">
            {resolvedIcon}
          </span>
        )}
        <span className="nova-inline-message__text">{children}</span>
      </p>
    );
  }
);
