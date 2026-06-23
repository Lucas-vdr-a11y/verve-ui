import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./SegmentedTabs.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface SegmentedTabsItem {
  /** Stable unique value used for selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered above/before the label. */
  icon?: React.ReactNode;
  /** Disable this segment. */
  disabled?: boolean;
}

export interface SegmentedTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Segments to render. */
  items: SegmentedTabsItem[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the value when the active segment changes. */
  onChange?: (value: string) => void;
  /** Size of the control. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stack icon above the label instead of inline. @default false */
  stacked?: boolean;
  /** Stretch segments to fill the width. @default true */
  fullWidth?: boolean;
  /** Accessible label for the tablist. */
  "aria-label"?: string;
}

/**
 * SegmentedTabs — an iOS-style segmented control with a sliding selected segment
 * (measured transform) plus a subtle press-scale and a soft brand glow on the
 * thumb. Route/nav-flavored: each segment takes an icon + label. Keyboard: arrow
 * keys move between segments, Home/End jump to the ends.
 */
export const SegmentedTabs = forwardRef<HTMLDivElement, SegmentedTabsProps>(
  function SegmentedTabs(
    {
      items,
      value,
      defaultValue,
      onChange,
      size = "md",
      stacked = false,
      fullWidth = true,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue ?? items.find((i) => !i.disabled)?.value,
    );
    const activeValue = isControlled ? value : uncontrolled;
    const reduced = useReducedMotion();

    const listRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
      null,
    );
    const [pressed, setPressed] = useState(false);

    const select = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolled(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const measure = useCallback(() => {
      const list = listRef.current;
      const active = activeValue ? tabRefs.current[activeValue] : null;
      if (!list || !active) {
        setThumb(null);
        return;
      }
      setThumb({ left: active.offsetLeft, width: active.offsetWidth });
    }, [activeValue]);

    useIsomorphicLayoutEffect(() => {
      measure();
    }, [measure, items, size, stacked, fullWidth]);

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
          "nova-segmented-tabs",
          `nova-segmented-tabs--${size}`,
          stacked && "nova-segmented-tabs--stacked",
          fullWidth && "nova-segmented-tabs--full",
          pressed && "nova-segmented-tabs--pressed",
          reduced && "nova-segmented-tabs--reduced",
          className,
        )}
        {...rest}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label={ariaLabel}
          className="nova-segmented-tabs__list"
        >
          <span
            className="nova-segmented-tabs__thumb"
            aria-hidden="true"
            style={
              thumb
                ? {
                    transform: `translateX(${thumb.left}px)`,
                    width: `${thumb.width}px`,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
          />
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
                  "nova-segmented-tabs__segment",
                  selected && "nova-segmented-tabs__segment--active",
                )}
                onClick={() => {
                  if (!item.disabled) select(item.value);
                }}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPointerDown={() => setPressed(true)}
                onPointerUp={() => setPressed(false)}
                onPointerLeave={() => setPressed(false)}
              >
                {item.icon != null && (
                  <span
                    className="nova-segmented-tabs__icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                <span className="nova-segmented-tabs__label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
