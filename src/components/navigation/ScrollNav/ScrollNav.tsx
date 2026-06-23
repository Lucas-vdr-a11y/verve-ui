import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./ScrollNav.css";

export type ScrollNavSize = "sm" | "md" | "lg";

export interface ScrollNavItem {
  /** Unique value identifying this item. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Disables the item. */
  disabled?: boolean;
}

export interface ScrollNavProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The items to render in the strip. */
  items: ScrollNavItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial active value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value when an item is activated. */
  onChange?: (value: string) => void;
  /** Size on the sm/md/lg scale. @default "md" */
  size?: ScrollNavSize;
  /** Accessible label for the tablist. */
  "aria-label"?: string;
  /** Show fade masks at scrollable edges. @default true */
  fades?: boolean;
}

const SCROLL_FRACTION = 0.75;

/**
 * ScrollNav — a horizontally scrollable nav/tab strip. Left/right scroll
 * buttons appear only when the content overflows, with optional edge fades.
 * Keyboard accessible (arrow / Home / End) following the tablist pattern.
 */
export const ScrollNav = forwardRef<HTMLDivElement, ScrollNavProps>(
  function ScrollNav(
    {
      items,
      value: valueProp,
      defaultValue,
      onChange,
      size = "md",
      fades = true,
      className,
      ...rest
    },
    ref,
  ) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue,
    );
    const value = isControlled ? valueProp : uncontrolled;

    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const setValue = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolled(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const updateOverflow = useCallback(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      setCanLeft(scrollLeft > 1);
      setCanRight(scrollLeft < max - 1);
    }, []);

    useEffect(() => {
      const el = scrollerRef.current;
      if (!el) return;
      updateOverflow();

      el.addEventListener("scroll", updateOverflow, { passive: true });

      let ro: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(updateOverflow);
        ro.observe(el);
      } else if (typeof window !== "undefined") {
        window.addEventListener("resize", updateOverflow);
      }

      return () => {
        el.removeEventListener("scroll", updateOverflow);
        if (ro) ro.disconnect();
        else if (typeof window !== "undefined") {
          window.removeEventListener("resize", updateOverflow);
        }
      };
    }, [updateOverflow, items]);

    const scrollByDir = useCallback((dir: -1 | 1) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({
        left: dir * el.clientWidth * SCROLL_FRACTION,
        behavior: "smooth",
      });
    }, []);

    const focusItem = useCallback((next: string) => {
      const el = scrollerRef.current;
      const node = el?.querySelector<HTMLButtonElement>(
        `[data-scrollnav-value="${CSS.escape(next)}"]`,
      );
      node?.focus();
      node?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    }, []);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        const enabled = items.filter((it) => !it.disabled).map((it) => it.value);
        if (enabled.length === 0) return;
        const current = value ?? enabled[0];
        const idx = enabled.indexOf(current);
        let next: string | undefined;

        if (event.key === "ArrowRight") {
          next = enabled[(idx + 1) % enabled.length];
        } else if (event.key === "ArrowLeft") {
          next = enabled[(idx - 1 + enabled.length) % enabled.length];
        } else if (event.key === "Home") {
          next = enabled[0];
        } else if (event.key === "End") {
          next = enabled[enabled.length - 1];
        }

        if (next !== undefined) {
          event.preventDefault();
          setValue(next);
          focusItem(next);
        }
      },
      [items, value, setValue, focusItem],
    );

    return (
      <div
        ref={ref}
        className={cn(
          "nova-scroll-nav",
          `nova-scroll-nav--${size}`,
          fades && "nova-scroll-nav--fades",
          canLeft && "nova-scroll-nav--overflow-left",
          canRight && "nova-scroll-nav--overflow-right",
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          className="nova-scroll-nav__btn nova-scroll-nav__btn--left nova-focusable"
          aria-label="Scroll left"
          tabIndex={-1}
          disabled={!canLeft}
          aria-hidden={!canLeft}
          onClick={() => scrollByDir(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          ref={scrollerRef}
          className="nova-scroll-nav__scroller"
          role="tablist"
          aria-label={rest["aria-label"]}
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => {
            const isSelected = value === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                data-scrollnav-value={item.value}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                disabled={item.disabled}
                className={cn(
                  "nova-scroll-nav__item",
                  "nova-focusable",
                  isSelected && "nova-scroll-nav__item--selected",
                )}
                onClick={() => {
                  if (!item.disabled) {
                    setValue(item.value);
                    focusItem(item.value);
                  }
                }}
              >
                {item.icon && (
                  <span className="nova-scroll-nav__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label != null && (
                  <span className="nova-scroll-nav__label">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="nova-scroll-nav__btn nova-scroll-nav__btn--right nova-focusable"
          aria-label="Scroll right"
          tabIndex={-1}
          disabled={!canRight}
          aria-hidden={!canRight}
          onClick={() => scrollByDir(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9 18l6-6-6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  },
);
