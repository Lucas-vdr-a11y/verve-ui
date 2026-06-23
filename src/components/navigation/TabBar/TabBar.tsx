import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./TabBar.css";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TabBarItem {
  /** Stable unique value used for selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Disable this tab. */
  disabled?: boolean;
}

export interface TabBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tabs to render. */
  items: TabBarItem[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the value when the active tab changes. */
  onChange?: (value: string) => void;
  /** Size of the bar. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch tabs to fill the available width. @default false */
  fullWidth?: boolean;
  /** Accessible label for the tablist. */
  "aria-label"?: string;
}

/**
 * TabBar — a lightweight segmented top tab bar with an animated underline
 * indicator that slides to the active tab. Unlike Tabs it renders no panels;
 * it only manages a `value`. Keyboard: arrow keys move between tabs.
 */
export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(function TabBar(
  {
    items,
    value,
    defaultValue,
    onChange,
    size = "md",
    fullWidth = false,
    className,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(
    defaultValue ?? items.find((i) => !i.disabled)?.value,
  );
  const activeValue = isControlled ? value : uncontrolled;

  const listRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  // Position the sliding indicator under the active tab.
  const measure = useCallback(() => {
    const list = listRef.current;
    const active = activeValue ? tabRefs.current[activeValue] : null;
    if (!list || !active) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [activeValue]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, items]);

  // Re-measure on container resize, SSR-guarded.
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  const moveFocus = (currentIndex: number, delta: number) => {
    if (items.length === 0) return;
    let idx = currentIndex;
    for (let step = 0; step < items.length; step++) {
      idx = (idx + delta + items.length) % items.length;
      if (!items[idx]?.disabled) break;
    }
    const target = items[idx];
    if (target && !target.disabled) {
      tabRefs.current[target.value]?.focus();
      select(target.value);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveFocus(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveFocus(index, -1);
        break;
      case "Home": {
        event.preventDefault();
        const first = items.findIndex((i) => !i.disabled);
        if (first >= 0) {
          tabRefs.current[items[first].value]?.focus();
          select(items[first].value);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        for (let i = items.length - 1; i >= 0; i--) {
          if (!items[i].disabled) {
            tabRefs.current[items[i].value]?.focus();
            select(items[i].value);
            break;
          }
        }
        break;
      }
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "nova-tab-bar",
        `nova-tab-bar--${size}`,
        fullWidth && "nova-tab-bar--full",
        className,
      )}
      {...rest}
    >
      <div ref={listRef} role="tablist" className="nova-tab-bar__list">
        {items.map((item, index) => {
          const selected = item.value === activeValue;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[item.value] = node;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "nova-tab-bar__tab",
                selected && "nova-tab-bar__tab--active",
              )}
              onClick={() => {
                if (!item.disabled) select(item.value);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.icon != null && (
                <span className="nova-tab-bar__tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nova-tab-bar__tab-label">{item.label}</span>
            </button>
          );
        })}
        <span
          className="nova-tab-bar__indicator"
          aria-hidden="true"
          style={
            indicator
              ? {
                  transform: `translateX(${indicator.left}px)`,
                  width: `${indicator.width}px`,
                  opacity: 1,
                }
              : { opacity: 0 }
          }
        />
      </div>
    </div>
  );
});
