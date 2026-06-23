import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { cn } from "../../../utils/cn";
import "./ChatMessageList.css";

/** SSR-safe layout effect — falls back to a no-op effect on the server. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ChatMessageListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Auto-scroll to the bottom when content changes, but only if the user was
   * already near the bottom. Defaults to `true`.
   */
  autoScroll?: boolean;
  /**
   * How close (in px) to the bottom counts as "near the bottom" for the
   * auto-scroll heuristic. Defaults to `120`.
   */
  threshold?: number;
  /** Rendered when there are no children (e.g. a welcome / empty prompt). */
  emptyState?: React.ReactNode;
  /** Accessible label for the log region. Defaults to `"Messages"`. */
  label?: string;
}

export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  function ChatMessageList(
    {
      autoScroll = true,
      threshold = 120,
      emptyState,
      label = "Messages",
      className,
      children,
      ...rest
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const isEmpty =
      children == null ||
      (Array.isArray(children) && children.length === 0);

    // Scroll to bottom on content change, but only when already near the bottom.
    useIsoLayoutEffect(() => {
      if (!autoScroll) return;
      const el = innerRef.current;
      if (!el) return;
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distance <= threshold) {
        el.scrollTop = el.scrollHeight;
      }
    }, [autoScroll, threshold, children]);

    return (
      <div
        ref={setRef}
        className={cn("nova-chat-message-list", className)}
        role="log"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions"
        {...rest}
      >
        {isEmpty && emptyState != null ? (
          <div className="nova-chat-message-list__empty">{emptyState}</div>
        ) : (
          <div className="nova-chat-message-list__items">{children}</div>
        )}
      </div>
    );
  }
);

export interface ChatDateSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Label shown in the divider (e.g. a date). */
  label?: React.ReactNode;
}

export const ChatDateSeparator = forwardRef<
  HTMLDivElement,
  ChatDateSeparatorProps
>(function ChatDateSeparator({ label, className, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn("nova-chat-date-separator", className)}
      role="separator"
      {...rest}
    >
      <span className="nova-chat-date-separator__label">
        {label ?? children}
      </span>
    </div>
  );
});
