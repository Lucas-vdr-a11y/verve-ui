import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ChatHeader.css";

export type ChatHeaderStatus = "online" | "offline" | "away" | "busy";

export interface ChatHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Avatar slot. */
  avatar?: React.ReactNode;
  /** Conversation title / contact name. */
  title: React.ReactNode;
  /** Secondary line (e.g. "online", "last seen 2h ago", member count). */
  subtitle?: React.ReactNode;
  /** Presence dot next to the title. */
  status?: ChatHeaderStatus;
  /** Trailing actions slot (icon buttons, menu, etc.). */
  actions?: React.ReactNode;
  /** Leading slot before the avatar (e.g. a back button on mobile). */
  leading?: React.ReactNode;
}

export const ChatHeader = forwardRef<HTMLElement, ChatHeaderProps>(
  function ChatHeader(
    { avatar, title, subtitle, status, actions, leading, className, ...rest },
    ref
  ) {
    return (
      <header
        ref={ref}
        className={cn("nova-chat-header", className)}
        {...rest}
      >
        {leading != null && (
          <div className="nova-chat-header__leading">{leading}</div>
        )}
        {avatar != null && (
          <div className="nova-chat-header__avatar">
            {avatar}
            {status && (
              <span
                className={cn(
                  "nova-chat-header__presence",
                  `nova-chat-header__presence--${status}`
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )}
        <div className="nova-chat-header__text">
          <span className="nova-chat-header__title">{title}</span>
          {subtitle != null && (
            <span className="nova-chat-header__subtitle">
              {status && !avatar && (
                <span
                  className={cn(
                    "nova-chat-header__dot",
                    `nova-chat-header__dot--${status}`
                  )}
                  aria-hidden="true"
                />
              )}
              {subtitle}
            </span>
          )}
        </div>
        {actions != null && (
          <div className="nova-chat-header__actions">{actions}</div>
        )}
      </header>
    );
  }
);
