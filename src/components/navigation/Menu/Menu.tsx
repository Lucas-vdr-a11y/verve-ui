import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Menu.css";

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
  triggerId: string;
  placement: MenuPlacement;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Menu>.`);
  }
  return ctx;
}

function getMenuItems(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return [];
  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
  );
}

export interface MenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Popover placement relative to the trigger. Defaults to `"bottom-start"`. */
  placement?: MenuPlacement;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom-start",
    className,
    children,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const menuId = `${reactId}-menu`;
  const triggerId = `${reactId}-trigger`;

  const isControlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolled;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  // Click-outside + Escape, SSR-safe with proper cleanup.
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  const ctx = useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      menuId,
      triggerId,
      placement,
      triggerRef,
      menuRef,
      rootRef,
    }),
    [open, setOpen, menuId, triggerId, placement]
  );

  return (
    <MenuContext.Provider value={ctx}>
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("nova-menu", className)}
        data-open={open || undefined}
        {...rest}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
});

export interface MenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger({ className, children, onClick, onKeyDown, ...rest }, ref) {
    const { open, setOpen, menuId, triggerId, triggerRef, menuRef } =
      useMenuContext("MenuTrigger");

    const focusFirst = () => {
      // Defer until the menu has rendered.
      requestAnimationFrame(() => {
        getMenuItems(menuRef.current)[0]?.focus();
      });
    };

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn("nova-menu__trigger", "nova-focusable", className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            focusFirst();
          }
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export interface MenuListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the menu. */
  "aria-label"?: string;
}

export const MenuList = forwardRef<HTMLDivElement, MenuListProps>(
  function MenuList({ className, children, onKeyDown, ...rest }, ref) {
    const { open, menuId, triggerId, placement, menuRef, setOpen } =
      useMenuContext("MenuList");

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        const items = getMenuItems(menuRef.current);
        if (items.length === 0) return;
        const activeIndex = items.indexOf(
          document.activeElement as HTMLElement
        );

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            const next = items[(activeIndex + 1) % items.length] ?? items[0];
            next.focus();
            break;
          }
          case "ArrowUp": {
            event.preventDefault();
            const prev =
              items[(activeIndex - 1 + items.length) % items.length] ??
              items[items.length - 1];
            prev.focus();
            break;
          }
          case "Home":
            event.preventDefault();
            items[0].focus();
            break;
          case "End":
            event.preventDefault();
            items[items.length - 1].focus();
            break;
          case "Tab":
            setOpen(false);
            break;
        }
      },
      [onKeyDown, menuRef, setOpen]
    );

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          menuRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="menu"
        id={menuId}
        aria-labelledby={triggerId}
        tabIndex={-1}
        className={cn(
          "nova-menu__list",
          `nova-menu__list--${placement}`,
          className
        )}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

export interface MenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** Styles the item as a destructive action. */
  danger?: boolean;
  /** Keep the menu open after selecting. Defaults to `false`. */
  closeOnSelect?: boolean;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem(
    {
      icon,
      danger = false,
      closeOnSelect = true,
      disabled,
      className,
      children,
      onClick,
      ...rest
    },
    ref
  ) {
    const { setOpen, triggerRef } = useMenuContext("MenuItem");

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        className={cn(
          "nova-menu__item",
          danger && "nova-menu__item--danger",
          className
        )}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
          if (closeOnSelect && !event.defaultPrevented) {
            setOpen(false);
            triggerRef.current?.focus();
          }
        }}
        {...rest}
      >
        {icon && (
          <span className="nova-menu__item-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="nova-menu__item-label">{children}</span>
      </button>
    );
  }
);

export interface MenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  function MenuSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn("nova-menu__separator", className)}
        {...rest}
      />
    );
  }
);
