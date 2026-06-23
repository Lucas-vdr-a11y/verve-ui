import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./VirtualList.css";

export interface VirtualListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Row data. */
  items: T[];
  /** Fixed row height in px. Provide this OR `estimateSize`. Defaults to `40`. */
  itemHeight?: number;
  /**
   * Estimated row height in px when rows are not strictly fixed. Used as the
   * row height for windowing math. Takes precedence over `itemHeight`.
   */
  estimateSize?: number;
  /** Viewport height in px (the scroll container). Defaults to `320`. */
  height?: number;
  /** Renders a single row. Receives the item and its absolute index. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Extra rows rendered above/below the visible window. Defaults to `3`. */
  overscan?: number;
  /** Stable row key. Defaults to the item index. */
  itemKey?: (item: T, index: number) => string | number;
  /** Accessible label for the listbox/list container. */
  "aria-label"?: string;
}

const getRowHeight = (itemHeight?: number, estimateSize?: number): number => {
  if (typeof estimateSize === "number" && estimateSize > 0) return estimateSize;
  if (typeof itemHeight === "number" && itemHeight > 0) return itemHeight;
  return 40;
};

function VirtualListInner<T>(
  {
    items,
    itemHeight,
    estimateSize,
    height = 320,
    renderItem,
    overscan = 3,
    itemKey,
    className,
    style,
    onScroll,
    ...rest
  }: VirtualListProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  const rowHeight = getRowHeight(itemHeight, estimateSize);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Assign both the forwarded ref and our internal ref.
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref]
  );

  // SSR-safe: read the real scroll position after mount in case the container
  // was rendered scrolled (e.g. restored position).
  useEffect(() => {
    const node = innerRef.current;
    if (node && node.scrollTop !== scrollTop) {
      setScrollTop(node.scrollTop);
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    onScroll?.(e);
  };

  const total = items.length;
  const totalHeight = total * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
  const endIndex = Math.min(total, startIndex + visibleCount);

  const offsetTop = startIndex * rowHeight;
  const rows: React.ReactNode[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    const item = items[i];
    const key = itemKey ? itemKey(item, i) : i;
    rows.push(
      <div
        key={key}
        className="nova-virtual-list__item"
        role="option"
        aria-setsize={total}
        aria-posinset={i + 1}
        style={{ height: rowHeight }}
      >
        {renderItem(item, i)}
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      className={cn("nova-virtual-list", className)}
      role="listbox"
      tabIndex={0}
      style={{ height, ...style }}
      onScroll={handleScroll}
      {...rest}
    >
      <div
        className="nova-virtual-list__sizer"
        style={{ height: totalHeight }}
        aria-hidden={total === 0 ? true : undefined}
      >
        <div
          className="nova-virtual-list__window"
          style={{ transform: `translateY(${offsetTop}px)` }}
        >
          {rows}
        </div>
      </div>
    </div>
  );
}

/**
 * VirtualList — windowed list that renders only the rows inside (and just
 * around) the viewport, so very large datasets stay performant.
 */
export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
