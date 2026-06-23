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
import "./TubelightNav.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TubelightNavItem {
  /** Stable unique value used for selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Disable this item. */
  disabled?: boolean;
}

export interface TubelightNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Items to render. */
  items: TubelightNavItem[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the value when the active item changes. */
  onChange?: (value: string) => void;
  /** Size of the nav. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Where the glowing tube sits relative to the active item. @default "top" */
  glowPosition?: "top" | "bottom";
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

/**
 * TubelightNav — a pill navigation with a glowing "tubelight" bar that slides to
 * the active item, casting a soft light bloom (a radial glow plus a bright bar).
 * Keyboard: arrow keys move between items, Home/End jump to the ends.
 */
export const TubelightNav = forwardRef<HTMLElement, TubelightNavProps>(
  function TubelightNav(
    {
      items,
      value,
      defaultValue,
      onChange,
      size = "md",
      glowPosition = "top",
      className,
      "aria-label": ariaLabel = "Primary",
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
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [tube, setTube] = useState<{ left: number; width: number } | null>(
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
      const active = activeValue ? itemRefs.current[activeValue] : null;
      if (!list || !active) {
        setTube(null);
        return;
      }
      setTube({ left: active.offsetLeft, width: active.offsetWidth });
    }, [activeValue]);

    useIsomorphicLayoutEffect(() => {
      measure();
    }, [measure, items, size]);

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
        itemRefs.current[target.value]?.focus();
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
            itemRefs.current[items[first].value]?.focus();
            select(items[first].value);
          }
          break;
        }
        case "End": {
          event.preventDefault();
          for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].disabled) {
              itemRefs.current[items[i].value]?.focus();
              select(items[i].value);
              break;
            }
          }
          break;
        }
      }
    };

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "nova-tubelight-nav",
          `nova-tubelight-nav--${size}`,
          `nova-tubelight-nav--glow-${glowPosition}`,
          reduced && "nova-tubelight-nav--reduced",
          className,
        )}
        {...rest}
      >
        <div ref={listRef} className="nova-tubelight-nav__list">
          <span
            className="nova-tubelight-nav__tube"
            aria-hidden="true"
            style={
              tube
                ? {
                    transform: `translateX(${tube.left}px)`,
                    width: `${tube.width}px`,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
          >
            <span className="nova-tubelight-nav__bar" />
            <span className="nova-tubelight-nav__bloom" />
          </span>

          {items.map((item, index) => {
            const selected = item.value === activeValue;
            return (
              <button
                key={item.value}
                ref={(node) => {
                  itemRefs.current[item.value] = node;
                }}
                type="button"
                aria-current={selected ? "page" : undefined}
                aria-disabled={item.disabled || undefined}
                disabled={item.disabled}
                tabIndex={selected ? 0 : -1}
                className={cn(
                  "nova-tubelight-nav__item",
                  selected && "nova-tubelight-nav__item--active",
                )}
                onClick={() => {
                  if (!item.disabled) select(item.value);
                }}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {item.icon != null && (
                  <span className="nova-tubelight-nav__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="nova-tubelight-nav__label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  },
);
