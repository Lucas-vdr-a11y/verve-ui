import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./GlowMenu.css";

export interface GlowMenuItem {
  /** Stable value emitted on selection. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Disable this item. */
  disabled?: boolean;
}

export interface GlowMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Items to render. */
  items: GlowMenuItem[];
  /** Controlled active value. */
  value: string;
  /** Selection change handler. */
  onChange: (value: string) => void;
  /** Semantic role of the bar. `"tablist"` adds tab roles; `"nav"` is plain navigation. Defaults `"tablist"`. */
  as?: "tablist" | "nav";
  /** Size. Defaults `"md"`. */
  size?: "sm" | "md" | "lg";
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Horizontal nav / tab bar where the active item is highlighted by a glowing
 * pill that slides between items (Linear/Family-style animated highlight). The
 * pill position/size is measured from the active button and applied via CSS
 * custom properties.
 *
 * Keyboard: Arrow keys move between (enabled) items, Home/End jump to the ends.
 * With `as="tablist"` items get `role="tab"`/`aria-selected`; the pill is
 * decorative. SSR-safe and reduced-motion aware (the pill jumps instead of
 * sliding).
 */
export const GlowMenu = forwardRef<HTMLDivElement, GlowMenuProps>(
  function GlowMenu(
    { items, value, onChange, as = "tablist", size = "md", className, ...rest },
    ref
  ) {
    const listRef = useRef<HTMLDivElement | null>(null);
    const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [pill, setPill] = useState<{ left: number; width: number } | null>(
      null
    );

    const activeIndex = items.findIndex((it) => it.value === value);

    const measure = useCallback(() => {
      const list = listRef.current;
      const btn = btnRefs.current[activeIndex];
      if (!list || !btn) return;
      setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    }, [activeIndex]);

    useIsoLayoutEffect(() => {
      measure();
    }, [measure, items.length]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const onResize = () => measure();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [measure]);

    const moveFocus = (from: number, dir: 1 | -1) => {
      const n = items.length;
      for (let step = 1; step <= n; step++) {
        const idx = (from + dir * step + n) % n;
        if (!items[idx].disabled) {
          btnRefs.current[idx]?.focus();
          onChange(items[idx].value);
          return;
        }
      }
    };

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          moveFocus(index, 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          moveFocus(index, -1);
          break;
        case "Home":
          e.preventDefault();
          moveFocus(-1, 1);
          break;
        case "End":
          e.preventDefault();
          moveFocus(0, -1);
          break;
        default:
          break;
      }
    };

    const isTabs = as === "tablist";

    return (
      <div
        ref={mergeRefs(ref, listRef)}
        role={isTabs ? "tablist" : undefined}
        aria-orientation={isTabs ? "horizontal" : undefined}
        className={cn("nova-glow-menu", `nova-glow-menu--${size}`, className)}
        style={
          pill
            ? ({
                "--nova-glow-menu-x": `${pill.left}px`,
                "--nova-glow-menu-w": `${pill.width}px`,
              } as React.CSSProperties)
            : undefined
        }
        {...rest}
      >
        {pill && (
          <span
            className={cn(
              "nova-glow-menu__pill",
              pill && "nova-glow-menu__pill--ready"
            )}
            aria-hidden="true"
          />
        )}
        {items.map((item, i) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              role={isTabs ? "tab" : undefined}
              aria-selected={isTabs ? selected : undefined}
              aria-current={!isTabs && selected ? "page" : undefined}
              tabIndex={isTabs ? (selected ? 0 : -1) : 0}
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              className={cn(
                "nova-glow-menu__item",
                "nova-focusable",
                selected && "nova-glow-menu__item--active"
              )}
              onClick={() => !item.disabled && onChange(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.icon && (
                <span className="nova-glow-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nova-glow-menu__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

/** Merge a forwarded ref with a local one. */
function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
