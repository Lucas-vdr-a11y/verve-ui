import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MessageActions.css";

export interface MessageActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Fires when the copy button is pressed. Omit to hide it. */
  onCopy?: () => void;
  /** Fires when retry / regenerate is pressed. Omit to hide it. */
  onRetry?: () => void;
  /** Fires on thumbs-up. Omit to hide it. */
  onThumbsUp?: () => void;
  /** Fires on thumbs-down. Omit to hide it. */
  onThumbsDown?: () => void;
  /** Fires on the "more" button. Omit to hide it. */
  onMore?: () => void;
  /** Reflect a chosen feedback state for active styling. */
  feedback?: "up" | "down" | null;
  /** Only reveal on hover/focus of the parent `.nova-chat-bubble`. */
  revealOnHover?: boolean;
  /** Show the copy button in its "copied" state. */
  copied?: boolean;
  /** Accessible label for the toolbar. Defaults to `"Message actions"`. */
  label?: string;
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5.5A1.5 1.5 0 0 0 4 11h1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RetryIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThumbUpIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M5 7l2.5-4.5A1.2 1.2 0 0 1 9.7 3l-.5 3H13a1.2 1.2 0 0 1 1.2 1.5l-1 4A1.5 1.5 0 0 1 11.7 13H5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 7v6H3a.8.8 0 0 1-.8-.8V7.8A.8.8 0 0 1 3 7z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const ThumbDownIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M11 9L8.5 13.5A1.2 1.2 0 0 1 6.3 13l.5-3H3a1.2 1.2 0 0 1-1.2-1.5l1-4A1.5 1.5 0 0 1 4.3 3H11z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M11 9V3h2a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
  </svg>
);

interface ActionButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ActionButton({ label, active, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "nova-message-actions__btn",
        "nova-focusable",
        active && "nova-message-actions__btn--active"
      )}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
    >
      {children}
    </button>
  );
}

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
  function MessageActions(
    {
      onCopy,
      onRetry,
      onThumbsUp,
      onThumbsDown,
      onMore,
      feedback,
      revealOnHover = false,
      copied = false,
      label = "Message actions",
      className,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-message-actions",
          revealOnHover && "nova-message-actions--reveal",
          className
        )}
        role="toolbar"
        aria-label={label}
        {...rest}
      >
        {onCopy && (
          <ActionButton label={copied ? "Copied" : "Copy"} onClick={onCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ActionButton>
        )}
        {onRetry && (
          <ActionButton label="Regenerate" onClick={onRetry}>
            <RetryIcon />
          </ActionButton>
        )}
        {onThumbsUp && (
          <ActionButton
            label="Good response"
            active={feedback === "up"}
            onClick={onThumbsUp}
          >
            <ThumbUpIcon />
          </ActionButton>
        )}
        {onThumbsDown && (
          <ActionButton
            label="Bad response"
            active={feedback === "down"}
            onClick={onThumbsDown}
          >
            <ThumbDownIcon />
          </ActionButton>
        )}
        {onMore && (
          <ActionButton label="More actions" onClick={onMore}>
            <MoreIcon />
          </ActionButton>
        )}
        {children}
      </div>
    );
  }
);
