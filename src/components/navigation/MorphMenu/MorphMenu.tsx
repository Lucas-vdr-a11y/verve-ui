import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./MorphMenu.css";

export interface MorphMenuItem {
  /** Stable unique key. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Render as a link with this href instead of a button. */
  href?: string;
  /** Disable this item. */
  disabled?: boolean;
}

export interface MorphMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Items shown in the morphed panel. */
  items: MorphMenuItem[];
  /** Trigger label. @default "Menu" */
  label?: React.ReactNode;
  /** Called with an item's value when chosen (buttons only). */
  onSelect?: (value: string) => void;
  /** Open state (controlled). */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Which side the panel grows toward. @default "bottom" */
  placement?: "bottom" | "top";
  /** Size of the trigger + panel. @default "md" */
  size?: "sm" | "md" | "lg";
}

/**
 * MorphMenu — a compact menu button that morphs/expands into a panel of links by
 * animating height + opacity from the button's footprint. Closes on
 * outside-click and Escape. Keyboard: Arrow keys move between items, Home/End
 * jump, Escape closes and restores focus to the trigger.
 */
export const MorphMenu = forwardRef<HTMLDivElement, MorphMenuProps>(
  function MorphMenu(
    {
      items,
      label = "Menu",
      onSelect,
      open,
      defaultOpen = false,
      onOpenChange,
      placement = "bottom",
      size = "md",
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = open !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isOpen = isControlled ? open : uncontrolled;
    const reduced = useReducedMotion();
    const panelId = useId().replace(/[:]/g, "");

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const itemRefs = useRef<(HTMLElement | null)[]>([]);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolled(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    // Outside click + Escape handling while open.
    useEffect(() => {
      if (!isOpen || typeof document === "undefined") return;
      const onPointerDown = (event: PointerEvent) => {
        const root = rootRef.current;
        if (root && !root.contains(event.target as Node)) setOpen(false);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown, true);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [isOpen, setOpen]);

    // Focus first enabled item when the panel opens.
    useEffect(() => {
      if (!isOpen) return;
      const first = items.findIndex((i) => !i.disabled);
      if (first >= 0) itemRefs.current[first]?.focus();
    }, [isOpen, items]);

    const focusItem = (start: number, delta: number) => {
      if (items.length === 0) return;
      let idx = start;
      for (let step = 0; step < items.length; step++) {
        idx = (idx + delta + items.length) % items.length;
        if (!items[idx]?.disabled) break;
      }
      if (!items[idx]?.disabled) itemRefs.current[idx]?.focus();
    };

    const handleItemKeyDown = (
      event: React.KeyboardEvent<HTMLElement>,
      index: number,
    ) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusItem(index, 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          focusItem(index, -1);
          break;
        case "Home":
          event.preventDefault();
          focusItem(-1, 1);
          break;
        case "End":
          event.preventDefault();
          focusItem(0, -1);
          break;
      }
    };

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-morph-menu",
          `nova-morph-menu--${size}`,
          `nova-morph-menu--${placement}`,
          isOpen && "nova-morph-menu--open",
          reduced && "nova-morph-menu--reduced",
          className,
        )}
        {...rest}
      >
        <button
          ref={triggerRef}
          type="button"
          className="nova-morph-menu__trigger"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen(!isOpen)}
        >
          <span className="nova-morph-menu__trigger-label">{label}</span>
          <span className="nova-morph-menu__chevron" aria-hidden="true" />
        </button>

        <div
          id={panelId}
          role="menu"
          aria-label={typeof label === "string" ? label : undefined}
          className="nova-morph-menu__panel"
          aria-hidden={!isOpen}
        >
          <ul className="nova-morph-menu__list">
            {items.map((item, index) => {
              const common = {
                role: "menuitem" as const,
                tabIndex: -1,
                className: cn(
                  "nova-morph-menu__item",
                  item.disabled && "nova-morph-menu__item--disabled",
                ),
                onKeyDown: (event: React.KeyboardEvent<HTMLElement>) =>
                  handleItemKeyDown(event, index),
              };
              return (
                <li key={item.value} role="none">
                  {item.href != null ? (
                    <a
                      {...common}
                      ref={(node) => {
                        itemRefs.current[index] = node;
                      }}
                      href={item.disabled ? undefined : item.href}
                      aria-disabled={item.disabled || undefined}
                      onClick={() => {
                        if (!item.disabled) setOpen(false);
                      }}
                    >
                      {item.icon != null && (
                        <span
                          className="nova-morph-menu__item-icon"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <button
                      {...common}
                      ref={(node) => {
                        itemRefs.current[index] = node;
                      }}
                      type="button"
                      aria-disabled={item.disabled || undefined}
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return;
                        onSelect?.(item.value);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                    >
                      {item.icon != null && (
                        <span
                          className="nova-morph-menu__item-icon"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  },
);
