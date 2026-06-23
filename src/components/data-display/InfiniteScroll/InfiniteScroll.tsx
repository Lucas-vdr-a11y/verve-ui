import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./InfiniteScroll.css";

export interface InfiniteScrollProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether more items can be loaded. When `false`, the sentinel stops firing. */
  hasMore: boolean;
  /** Whether a load is currently in flight. Prevents duplicate `onLoadMore`. */
  loading?: boolean;
  /** Called when the bottom (or top, if `reverse`) sentinel intersects. */
  onLoadMore: () => void;
  /** Loader shown while `loading`. */
  loader?: React.ReactNode;
  /** Content shown when `hasMore` is false (end of list). */
  endMessage?: React.ReactNode;
  /**
   * Root margin passed to the IntersectionObserver, e.g. `"200px"` to start
   * loading before the sentinel is fully on screen. Defaults to `"0px"`.
   */
  rootMargin?: string;
  /**
   * Reverse mode (chat-style): sentinel sits at the top and `onLoadMore` fires
   * when scrolling up. Defaults to `false`.
   */
  reverse?: boolean;
  /**
   * Scroll root. `null` (default) observes against the document viewport;
   * provide a ref to a scrollable ancestor to scope intersection to it.
   */
  scrollRoot?: React.RefObject<Element | null>;
}

const DefaultLoader = () => (
  <span className="nova-infinite-scroll__spinner" aria-hidden="true" />
);

export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(
  function InfiniteScroll(
    {
      hasMore,
      loading = false,
      onLoadMore,
      loader,
      endMessage,
      rootMargin = "0px",
      reverse = false,
      scrollRoot,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    // Keep the latest callback/flags without re-subscribing the observer.
    const stateRef = useRef({ hasMore, loading, onLoadMore });
    stateRef.current = { hasMore, loading, onLoadMore };

    useEffect(() => {
      if (typeof IntersectionObserver === "undefined") return;
      const node = sentinelRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;
          const { hasMore: hm, loading: ld, onLoadMore: cb } = stateRef.current;
          if (hm && !ld) cb();
        },
        {
          root: scrollRoot?.current ?? null,
          rootMargin,
          threshold: 0,
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [rootMargin, scrollRoot]);

    const sentinel = (
      <div
        ref={sentinelRef}
        className="nova-infinite-scroll__sentinel"
        aria-hidden="true"
      />
    );

    const status = (
      <div
        className="nova-infinite-scroll__status"
        role="status"
        aria-live="polite"
      >
        {loading
          ? loader ?? <DefaultLoader />
          : !hasMore && endMessage
            ? <span className="nova-infinite-scroll__end">{endMessage}</span>
            : null}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "nova-infinite-scroll",
          reverse && "nova-infinite-scroll--reverse",
          className
        )}
        {...rest}
      >
        {reverse && hasMore && sentinel}
        {reverse && status}
        {children}
        {!reverse && status}
        {!reverse && hasMore && sentinel}
      </div>
    );
  }
);
