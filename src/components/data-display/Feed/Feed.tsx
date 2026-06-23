import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Feed.css";

export interface FeedProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Add connecting lines between items for a threaded look. Defaults to `false`. */
  connected?: boolean;
}

export const Feed = forwardRef<HTMLUListElement, FeedProps>(function Feed(
  { connected = false, className, children, ...rest },
  ref
) {
  return (
    <ul
      ref={ref}
      className={cn("nova-feed", connected && "nova-feed--connected", className)}
      {...rest}
    >
      {children}
    </ul>
  );
});

export interface CommentProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Avatar slot (e.g. a `<Avatar />`). */
  avatar?: React.ReactNode;
  /** Author name / display element. */
  author: React.ReactNode;
  /** Timestamp shown next to the author. */
  timestamp?: React.ReactNode;
  /** Optional meta line under the author (role, handle, etc.). */
  meta?: React.ReactNode;
  /** Action slot, typically buttons (reply, like). */
  actions?: React.ReactNode;
  /** Nested replies or follow-up content. */
  footer?: React.ReactNode;
}

export const Comment = forwardRef<HTMLLIElement, CommentProps>(function Comment(
  { avatar, author, timestamp, meta, actions, footer, className, children, ...rest },
  ref
) {
  return (
    <li ref={ref} className={cn("nova-comment", className)} {...rest}>
      {avatar && (
        <div className="nova-comment__avatar">{avatar}</div>
      )}
      <div className="nova-comment__main">
        <div className="nova-comment__header">
          <span className="nova-comment__author">{author}</span>
          {meta && <span className="nova-comment__meta">{meta}</span>}
          {timestamp && (
            <span className="nova-comment__timestamp">{timestamp}</span>
          )}
        </div>
        {children != null && (
          <div className="nova-comment__body">{children}</div>
        )}
        {actions && <div className="nova-comment__actions">{actions}</div>}
        {footer && <div className="nova-comment__footer">{footer}</div>}
      </div>
    </li>
  );
});
