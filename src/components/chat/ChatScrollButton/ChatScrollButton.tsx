import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ChatScrollButton.css";

export interface ChatScrollButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the message list is scrolled up — controls visibility. */
  scrolledUp: boolean;
  /** Number of unread/new messages; shown as a badge when > 0. */
  count?: number;
  /** Accessible label. Defaults to `"Scroll to latest"`. */
  label?: string;
}

const ArrowDownIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M10 4v11M5 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatScrollButton = forwardRef<
  HTMLButtonElement,
  ChatScrollButtonProps
>(function ChatScrollButton(
  { scrolledUp, count = 0, label = "Scroll to latest", className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "nova-chat-scroll-button",
        scrolledUp && "nova-chat-scroll-button--visible",
        count > 0 && "nova-chat-scroll-button--has-count",
        className
      )}
      aria-label={label}
      aria-hidden={!scrolledUp}
      tabIndex={scrolledUp ? undefined : -1}
      {...rest}
    >
      <ArrowDownIcon />
      {count > 0 && (
        <span className="nova-chat-scroll-button__badge">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
});
