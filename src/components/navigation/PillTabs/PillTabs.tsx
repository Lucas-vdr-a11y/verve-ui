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
import "./PillTabs.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface PillTabsItem {
  /** Stable unique value used for selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Disable this tab. */
  disabled?: boolean;
}

export interface PillTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tabs to render. */
  items: PillTabsItem[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the value when the active tab changes. */
  onChange?: (value: string) => void;
  /** Size of the control. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch tabs to fill the available width. @default false */
  fullWidth?: boolean;
  /** Accessible label for the tablist. */
  "aria-label"?: string;
}

/**
 * PillTabs — tabs where the active background is a single sliding pill. The pill
 * is positioned with a measured FLIP-style transform/scale (one shared element
 * translates + resizes between tabs) so it glides smoothly. Keyboard: arrow
 * keys move between tabs, Home/End jump to the ends.
 */
export const PillTabs = forwardRef<HTMLDivElement, PillTabsProps>(
  function PillTabs(
    {
      items,
      value,
      defaultValue,
      onChange,
      size = "md",
      fullWidth = false,
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
    const [pill, setPill] = useState<{ left: number; width: number } | null>(
      null,
    );

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
        setPill(null);
        return;
      }
      setPill({ left: active.offsetLeft, width: active.offsetWidth });
    }, [activeValue]);

    useIsomorphicLayoutEffect(() => {
      measure();
    }, [measure, items, size, fullWidth]);

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
          "nova-pill-tabs",
          `nova-pill-tabs--${size}`,
          fullWidth && "nova-pill-tabs--full",
          reduced && "nova-pill-tabs--reduced",
          className,
        )}
        {...rest}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label={ariaLabel}
          className="nova-pill-tabs__list"
        >
          <span
            className="nova-pill-tabs__pill"
            aria-hidden="true"
            style={
              pill
                ? {
                    transform: `translateX(${pill.left}px)`,
                    width: `${pill.width}px`,
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
                  "nova-pill-tabs__tab",
                  selected && "nova-pill-tabs__tab--active",
                )}
                onClick={() => {
                  if (!item.disabled) select(item.value);
                }}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {item.icon != null && (
                  <span className="nova-pill-tabs__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="nova-pill-tabs__label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
