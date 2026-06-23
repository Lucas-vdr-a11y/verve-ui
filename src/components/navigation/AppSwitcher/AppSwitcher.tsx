import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./AppSwitcher.css";

export interface AppSwitcherItem {
  /** Stable unique id used for selection. */
  id: string;
  /** Display name. */
  name: string;
  /** Optional icon/avatar rendered before the name. */
  icon?: React.ReactNode;
  /** Optional secondary line (e.g. plan, role). */
  description?: React.ReactNode;
  /** Disable selection of this item. */
  disabled?: boolean;
}

export interface AppSwitcherProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onSelect"
  > {
  /** Apps/workspaces to choose from. */
  items: AppSwitcherItem[];
  /** Id of the currently selected item (controlled). */
  value?: string;
  /** Initial selected id when uncontrolled. */
  defaultValue?: string;
  /** Called with the id when a selection is made. */
  onChange?: (id: string) => void;
  /** Accessible label for the popover list. @default "Switch workspace" */
  label?: string;
  /** Label for the "create new" action. When set, the action is shown. */
  createLabel?: React.ReactNode;
  /** Called when the "create new" action is chosen. */
  onCreate?: () => void;
  /** Popover alignment relative to the trigger. @default "start" */
  align?: "start" | "end";
}

/**
 * AppSwitcher — a workspace/app switcher. The current item is a button that
 * opens a popover list of apps with keyboard navigation and a selected check.
 * Optionally exposes a "create new" action. SSR-safe.
 */
export const AppSwitcher = forwardRef<HTMLDivElement, AppSwitcherProps>(
  function AppSwitcher(
    {
      items,
      value,
      defaultValue,
      onChange,
      label = "Switch workspace",
      createLabel,
      onCreate,
      align = "start",
      className,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const listId = `${reactId}-list`;
    const triggerId = `${reactId}-trigger`;

    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(
      defaultValue ?? items[0]?.id,
    );
    const selectedId = isControlled ? value : uncontrolled;

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const selectable = items.filter((i) => !i.disabled);
    const current = items.find((i) => i.id === selectedId) ?? items[0];

    const select = useCallback(
      (id: string) => {
        if (!isControlled) setUncontrolled(id);
        onChange?.(id);
      },
      [isControlled, onChange],
    );

    const close = useCallback((focusTrigger = true) => {
      setOpen(false);
      if (focusTrigger) triggerRef.current?.focus();
    }, []);

    // Click-outside + Escape, SSR-safe.
    useEffect(() => {
      if (!open) return;
      if (typeof document === "undefined") return;

      const handlePointerDown = (event: PointerEvent) => {
        const root = rootRef.current;
        if (
          root &&
          event.target instanceof Node &&
          !root.contains(event.target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("pointerdown", handlePointerDown, true);
      return () =>
        document.removeEventListener("pointerdown", handlePointerDown, true);
    }, [open]);

    // When opening, point the active index at the selected item and focus it.
    useEffect(() => {
      if (!open) return;
      const idx = Math.max(
        0,
        items.findIndex((i) => i.id === selectedId && !i.disabled),
      );
      setActiveIndex(idx);
      requestAnimationFrame(() => {
        optionRefs.current[idx]?.focus();
      });
    }, [open, items, selectedId]);

    const moveActive = (delta: number) => {
      if (items.length === 0) return;
      let idx = activeIndex;
      for (let step = 0; step < items.length; step++) {
        idx = (idx + delta + items.length) % items.length;
        if (!items[idx]?.disabled) break;
      }
      setActiveIndex(idx);
      optionRefs.current[idx]?.focus();
    };

    const handleListKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveActive(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveActive(-1);
          break;
        case "Home":
          event.preventDefault();
          setActiveIndex(0);
          optionRefs.current[0]?.focus();
          break;
        case "End": {
          event.preventDefault();
          const last = items.length - 1;
          setActiveIndex(last);
          optionRefs.current[last]?.focus();
          break;
        }
        case "Escape":
          event.preventDefault();
          close();
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("nova-app-switcher", className)}
        data-open={open || undefined}
        {...rest}
      >
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          className={cn("nova-app-switcher__trigger", "nova-focusable")}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          {current?.icon != null && (
            <span className="nova-app-switcher__trigger-icon" aria-hidden="true">
              {current.icon}
            </span>
          )}
          <span className="nova-app-switcher__trigger-name">
            {current?.name}
          </span>
          <span className="nova-app-switcher__chevron" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            id={listId}
            aria-label={label}
            aria-activedescendant={
              selectable.length > 0
                ? `${reactId}-opt-${activeIndex}`
                : undefined
            }
            tabIndex={-1}
            className={cn(
              "nova-app-switcher__popover",
              `nova-app-switcher__popover--${align}`,
            )}
            onKeyDown={handleListKeyDown}
          >
            <ul className="nova-app-switcher__list">
              {items.map((item, index) => {
                const isSelected = item.id === selectedId;
                return (
                  <li key={item.id} className="nova-app-switcher__list-item">
                    <button
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      type="button"
                      id={`${reactId}-opt-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      disabled={item.disabled}
                      aria-disabled={item.disabled || undefined}
                      tabIndex={-1}
                      className={cn(
                        "nova-app-switcher__option",
                        isSelected && "nova-app-switcher__option--selected",
                      )}
                      onClick={() => {
                        if (item.disabled) return;
                        select(item.id);
                        close();
                      }}
                    >
                      {item.icon != null && (
                        <span
                          className="nova-app-switcher__option-icon"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="nova-app-switcher__option-body">
                        <span className="nova-app-switcher__option-name">
                          {item.name}
                        </span>
                        {item.description != null && (
                          <span className="nova-app-switcher__option-desc">
                            {item.description}
                          </span>
                        )}
                      </span>
                      <span
                        className="nova-app-switcher__check"
                        aria-hidden={!isSelected}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 16 16"
                            width="16"
                            height="16"
                            fill="none"
                          >
                            <path
                              d="M3.5 8.5l3 3 6-6.5"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {createLabel != null && (
              <>
                <div
                  className="nova-app-switcher__separator"
                  role="separator"
                />
                <button
                  type="button"
                  className="nova-app-switcher__create"
                  onClick={() => {
                    onCreate?.();
                    close();
                  }}
                >
                  <span
                    className="nova-app-switcher__create-icon"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <path
                        d="M8 3.5v9M3.5 8h9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="nova-app-switcher__create-label">
                    {createLabel}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);
