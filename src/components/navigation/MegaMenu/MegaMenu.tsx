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
import "./MegaMenu.css";

interface MegaMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  panelId: string;
  triggerId: string;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  panelRef: React.MutableRefObject<HTMLDivElement | null>;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
  openTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

const MegaMenuContext = createContext<MegaMenuContextValue | null>(null);

function useMegaMenuContext(component: string): MegaMenuContextValue {
  const ctx = useContext(MegaMenuContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <MegaMenu>.`);
  }
  return ctx;
}

function getPanelLinks(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      '[data-mega-link]:not([aria-disabled="true"])',
    ),
  );
}

export interface MegaMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Delay in ms before opening/closing on hover. @default 120 */
  hoverDelay?: number;
}

/**
 * MegaMenu — a wide dropdown panel triggered by a top-level nav item. Holds
 * multi-column sections of links plus an optional featured slot. Opens on hover
 * and keyboard, closes on click-outside / Escape. SSR-safe.
 */
export const MegaMenu = forwardRef<HTMLDivElement, MegaMenuProps>(
  function MegaMenu(
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      hoverDelay = 120,
      className,
      children,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const panelId = `${reactId}-panel`;
    const triggerId = `${reactId}-trigger`;

    const isControlled = openProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const open = isControlled ? openProp : uncontrolled;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolled(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const clearTimer = useCallback(() => {
      if (openTimer.current) {
        clearTimeout(openTimer.current);
        openTimer.current = null;
      }
    }, []);

    // Click-outside + Escape, SSR-safe with cleanup.
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

    // Clean up any pending hover timer on unmount.
    useEffect(() => clearTimer, [clearTimer]);

    const ctx = useMemo<MegaMenuContextValue>(
      () => ({
        open,
        setOpen,
        panelId,
        triggerId,
        triggerRef,
        panelRef,
        rootRef,
        openTimer,
      }),
      [open, setOpen, panelId, triggerId],
    );

    const scheduleOpen = (next: boolean) => {
      clearTimer();
      openTimer.current = setTimeout(() => setOpen(next), hoverDelay);
    };

    return (
      <MegaMenuContext.Provider value={ctx}>
        <div
          ref={(node) => {
            rootRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          className={cn("nova-mega-menu", className)}
          data-open={open || undefined}
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            scheduleOpen(true);
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            scheduleOpen(false);
          }}
          {...rest}
        >
          {children}
        </div>
      </MegaMenuContext.Provider>
    );
  },
);

export interface MegaMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const MegaMenuTrigger = forwardRef<
  HTMLButtonElement,
  MegaMenuTriggerProps
>(function MegaMenuTrigger(
  { className, children, onClick, onKeyDown, onFocus, ...rest },
  ref,
) {
  const { open, setOpen, panelId, triggerId, triggerRef, panelRef } =
    useMegaMenuContext("MegaMenuTrigger");

  const focusFirst = () => {
    requestAnimationFrame(() => {
      getPanelLinks(panelRef.current)[0]?.focus();
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
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      className={cn("nova-mega-menu__trigger", "nova-focusable", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown") {
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
});

export interface MegaMenuPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of link columns. @default 3 */
  columns?: number;
  /** Optional featured/promo slot rendered alongside the columns. */
  featured?: React.ReactNode;
}

export const MegaMenuPanel = forwardRef<HTMLDivElement, MegaMenuPanelProps>(
  function MegaMenuPanel(
    { columns = 3, featured, className, style, children, onKeyDown, ...rest },
    ref,
  ) {
    const { open, panelId, triggerId, panelRef, setOpen, triggerRef } =
      useMegaMenuContext("MegaMenuPanel");

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        const links = getPanelLinks(panelRef.current);
        if (links.length === 0) return;
        const activeIndex = links.indexOf(
          document.activeElement as HTMLElement,
        );

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            (links[(activeIndex + 1) % links.length] ?? links[0]).focus();
            break;
          }
          case "ArrowUp": {
            event.preventDefault();
            (
              links[(activeIndex - 1 + links.length) % links.length] ??
              links[links.length - 1]
            ).focus();
            break;
          }
          case "Home":
            event.preventDefault();
            links[0].focus();
            break;
          case "End":
            event.preventDefault();
            links[links.length - 1].focus();
            break;
          case "Tab":
            setOpen(false);
            break;
        }
      },
      [onKeyDown, panelRef, setOpen],
    );

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn("nova-mega-menu__panel", className)}
        style={
          {
            "--nova-mega-menu-columns": columns,
            ...style,
          } as React.CSSProperties
        }
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          // Close when focus leaves the panel for a non-trigger element.
          const next = event.relatedTarget as Node | null;
          const root = panelRef.current?.parentElement;
          if (
            next &&
            root &&
            !root.contains(next) &&
            next !== triggerRef.current
          ) {
            setOpen(false);
          }
        }}
        {...rest}
      >
        <div className="nova-mega-menu__columns">{children}</div>
        {featured != null && (
          <div className="nova-mega-menu__featured">{featured}</div>
        )}
      </div>
    );
  },
);

export interface MegaMenuSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Heading for this column of links. */
  title?: React.ReactNode;
}

export const MegaMenuSection = forwardRef<HTMLDivElement, MegaMenuSectionProps>(
  function MegaMenuSection({ title, className, children, ...rest }, ref) {
    const headingId = useId();
    return (
      <div
        ref={ref}
        className={cn("nova-mega-menu__section", className)}
        aria-labelledby={title != null ? headingId : undefined}
        {...rest}
      >
        {title != null && (
          <p id={headingId} className="nova-mega-menu__section-title">
            {title}
          </p>
        )}
        <ul className="nova-mega-menu__list">{children}</ul>
      </div>
    );
  },
);

export interface MegaMenuItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** Primary label. */
  label: React.ReactNode;
  /** Optional supporting description below the label. */
  description?: React.ReactNode;
  /** Disable the link. */
  disabled?: boolean;
}

export const MegaMenuItem = forwardRef<HTMLAnchorElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { icon, label, description, disabled, className, onClick, ...rest },
    ref,
  ) {
    const { setOpen, triggerRef } = useMegaMenuContext("MegaMenuItem");
    return (
      <li className="nova-mega-menu__list-item">
        <a
          ref={ref}
          data-mega-link=""
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          className={cn(
            "nova-mega-menu__item",
            "nova-focusable",
            disabled && "nova-mega-menu__item--disabled",
            className,
          )}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              return;
            }
            onClick?.(event);
            if (!event.defaultPrevented) {
              setOpen(false);
              triggerRef.current?.focus();
            }
          }}
          {...rest}
        >
          {icon != null && (
            <span className="nova-mega-menu__item-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="nova-mega-menu__item-body">
            <span className="nova-mega-menu__item-label">{label}</span>
            {description != null && (
              <span className="nova-mega-menu__item-desc">{description}</span>
            )}
          </span>
        </a>
      </li>
    );
  },
);
