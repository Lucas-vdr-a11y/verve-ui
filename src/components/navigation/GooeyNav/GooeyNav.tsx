import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./GooeyNav.css";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface GooeyNavItem {
  /** Stable unique value used for selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Disable this item. */
  disabled?: boolean;
}

export interface GooeyNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Items to render. */
  items: GooeyNavItem[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the value when the active item changes. */
  onChange?: (value: string) => void;
  /** Size of the nav. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
}

/**
 * GooeyNav — a navigation bar whose active highlight is a gooey blob built with
 * an SVG gooey filter. As the blob slides between items it stretches and merges
 * with a trailing droplet, producing a liquid morph. Keyboard: arrow keys move
 * between items, Home/End jump to the ends.
 */
export const GooeyNav = forwardRef<HTMLElement, GooeyNavProps>(function GooeyNav(
  {
    items,
    value,
    defaultValue,
    onChange,
    size = "md",
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
  const filterId = useId().replace(/[:]/g, "");

  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [blob, setBlob] = useState<{ left: number; width: number } | null>(null);

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
      setBlob(null);
      return;
    }
    setBlob({ left: active.offsetLeft, width: active.offsetWidth });
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
        "nova-gooey-nav",
        `nova-gooey-nav--${size}`,
        reduced && "nova-gooey-nav--reduced",
        className,
      )}
      {...rest}
    >
      <svg
        className="nova-gooey-nav__defs"
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
      >
        <defs>
          <filter id={`gooey-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div ref={listRef} className="nova-gooey-nav__list">
        <span
          className="nova-gooey-nav__goo"
          aria-hidden="true"
          style={{ filter: `url(#gooey-${filterId})` }}
        >
          <span
            className="nova-gooey-nav__blob"
            style={
              blob
                ? {
                    transform: `translateX(${blob.left}px)`,
                    width: `${blob.width}px`,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
          />
          <span
            className="nova-gooey-nav__blob nova-gooey-nav__blob--trail"
            style={
              blob
                ? {
                    transform: `translateX(${blob.left}px)`,
                    width: `${blob.width}px`,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
          />
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
                "nova-gooey-nav__item",
                selected && "nova-gooey-nav__item--active",
              )}
              onClick={() => {
                if (!item.disabled) select(item.value);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.icon != null && (
                <span className="nova-gooey-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nova-gooey-nav__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
