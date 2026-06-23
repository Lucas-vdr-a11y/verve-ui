import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ConversationList.css";

export interface ConversationItem {
  /** Unique id. */
  id: string;
  /** Conversation title / contact name. */
  title: React.ReactNode;
  /** Short preview of the last message. */
  preview?: React.ReactNode;
  /** Timestamp of the last activity. */
  timestamp?: React.ReactNode;
  /** Unread count — a badge is shown when > 0. */
  unread?: number;
  /** Avatar slot. */
  avatar?: React.ReactNode;
  /** Marks this conversation as the active one. */
  active?: boolean;
}

export interface ConversationListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** The conversations to render. */
  items: ConversationItem[];
  /** Fires with the conversation id when an item is chosen. */
  onSelect?: (id: string) => void;
  /** Optional slot above the list (e.g. a search input). */
  search?: React.ReactNode;
  /** Rendered when `items` is empty. */
  emptyState?: React.ReactNode;
  /** Accessible label for the list. Defaults to `"Conversations"`. */
  label?: string;
}

export const ConversationList = forwardRef<
  HTMLUListElement,
  ConversationListProps
>(function ConversationList(
  { items, onSelect, search, emptyState, label = "Conversations", className, ...rest },
  ref
) {
  return (
    <div className="nova-conversation-list">
      {search != null && (
        <div className="nova-conversation-list__search">{search}</div>
      )}
      {items.length === 0 && emptyState != null ? (
        <div className="nova-conversation-list__empty">{emptyState}</div>
      ) : (
        <ul
          ref={ref}
          className={cn("nova-conversation-list__items", className)}
          role="listbox"
          aria-label={label}
          {...rest}
        >
          {items.map((item) => (
            <li key={item.id} className="nova-conversation-list__li" role="presentation">
              <button
                type="button"
                className={cn(
                  "nova-conversation-list__item",
                  "nova-focusable",
                  item.active && "nova-conversation-list__item--active"
                )}
                role="option"
                aria-selected={item.active || undefined}
                onClick={() => onSelect?.(item.id)}
              >
                {item.avatar != null && (
                  <span className="nova-conversation-list__avatar">
                    {item.avatar}
                  </span>
                )}
                <span className="nova-conversation-list__body">
                  <span className="nova-conversation-list__top">
                    <span className="nova-conversation-list__title">
                      {item.title}
                    </span>
                    {item.timestamp != null && (
                      <span className="nova-conversation-list__time">
                        {item.timestamp}
                      </span>
                    )}
                  </span>
                  <span className="nova-conversation-list__bottom">
                    {item.preview != null && (
                      <span className="nova-conversation-list__preview">
                        {item.preview}
                      </span>
                    )}
                    {item.unread != null && item.unread > 0 && (
                      <span
                        className="nova-conversation-list__badge"
                        aria-label={`${item.unread} unread`}
                      >
                        {item.unread > 99 ? "99+" : item.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
