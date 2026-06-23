import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ChatBubble.css";

export type ChatRole = "user" | "assistant" | "system";
export type ChatBubbleTone = "default" | "primary" | "success" | "danger";
export type ChatStatus = "sending" | "sent" | "error";

export interface ChatBubbleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** Who authored the message. Drives alignment + tone. Defaults to `"assistant"`. */
  role?: ChatRole;
  /** Visual tone of the bubble. Defaults to a role-appropriate tone. */
  tone?: ChatBubbleTone;
  /** Avatar slot (e.g. an `<Avatar />`). */
  avatar?: React.ReactNode;
  /** Display name shown above the content. */
  name?: React.ReactNode;
  /** Timestamp shown next to the name. */
  timestamp?: React.ReactNode;
  /** Message body — plain text or arbitrary node. */
  content?: React.ReactNode;
  /** Show the little pointer tail on the bubble. Defaults to `true`. */
  tail?: boolean;
  /** Delivery status indicator (user messages). */
  status?: ChatStatus;
  /** Action row rendered under the bubble (e.g. `<MessageActions />`). */
  actions?: React.ReactNode;
}

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3l2 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M3 8.5l3 3 7-7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3.5M8 11h.01" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const STATUS_LABEL: Record<ChatStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  error: "Failed to send",
};

const STATUS_ICON: Record<ChatStatus, React.ReactNode> = {
  sending: <ClockIcon />,
  sent: <CheckIcon />,
  error: <AlertIcon />,
};

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  function ChatBubble(
    {
      role = "assistant",
      tone,
      avatar,
      name,
      timestamp,
      content,
      tail = true,
      status,
      actions,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const resolvedTone: ChatBubbleTone =
      tone ?? (role === "user" ? "primary" : "default");
    const body = content ?? children;
    const hasHeader = name != null || timestamp != null;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-chat-bubble",
          `nova-chat-bubble--${role}`,
          `nova-chat-bubble--tone-${resolvedTone}`,
          tail && "nova-chat-bubble--tail",
          className
        )}
        data-role={role}
        {...rest}
      >
        {avatar != null && (
          <div className="nova-chat-bubble__avatar">{avatar}</div>
        )}
        <div className="nova-chat-bubble__main">
          {hasHeader && (
            <div className="nova-chat-bubble__header">
              {name != null && (
                <span className="nova-chat-bubble__name">{name}</span>
              )}
              {timestamp != null && (
                <span className="nova-chat-bubble__time">{timestamp}</span>
              )}
            </div>
          )}
          <div className="nova-chat-bubble__bubble">
            <div className="nova-chat-bubble__content">{body}</div>
          </div>
          {(status || actions) && (
            <div className="nova-chat-bubble__footer">
              {actions && (
                <div className="nova-chat-bubble__actions">{actions}</div>
              )}
              {status && (
                <span
                  className={cn(
                    "nova-chat-bubble__status",
                    `nova-chat-bubble__status--${status}`
                  )}
                >
                  <span
                    className="nova-chat-bubble__status-icon"
                    aria-hidden="true"
                  >
                    {STATUS_ICON[status]}
                  </span>
                  <span className="nova-chat-bubble__status-label">
                    {STATUS_LABEL[status]}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
