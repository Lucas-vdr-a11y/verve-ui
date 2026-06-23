import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./ContextMenu.css";

/** A single actionable row or a separator. */
export type ContextMenuItem =
  | {
      /** Stable identifier. */
      id: string;
      /** Renders a divider; no other fields apply. */
      separator?: false;
      /** Row label. */
      label: ReactNode;
      /** Optional leading icon. */
      icon?: ReactNode;
      /** Disables interaction. */
      disabled?: boolean;
      /** Styles the row as destructive. */
      danger?: boolean;
      /** Invoked on selection. */
      onSelect?: () => void;
    }
  | { id: string; separator: true };

export interface ContextMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Menu rows. */
  items: ContextMenuItem[];
  /** The element whose right-click opens the menu. */
  children: ReactNode;
}

interface Position {
  x: number;
  y: number;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

function isActionable(
  item: ContextMenuItem
): item is Extract<ContextMenuItem, { separator?: false }> {
  return !("separator" in item && item.separator);
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  function ContextMenu({ items, children, className, ...rest }, ref) {
    const [position, setPosition] = useState<Position | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        menuRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const open = position !== null;

    const close = useCallback(() => {
      setPosition(null);
      setActiveIndex(-1);
    }, []);

    const actionableIndexes = items.reduce<number[]>((acc, item, i) => {
      if (isActionable(item) && !item.disabled) acc.push(i);
      return acc;
    }, []);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setActiveIndex(-1);
      },
      []
    );

    const selectItem = useCallback(
      (item: ContextMenuItem) => {
        if (isActionable(item) && !item.disabled) {
          item.onSelect?.();
          close();
        }
      },
      [close]
    );

    // Click-outside + Esc + resize/scroll close while open.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onPointerDown = (e: MouseEvent) => {
        const node = menuRef.current;
        if (node && !node.contains(e.target as Node)) close();
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          close();
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (actionableIndexes.length === 0) return;
          setActiveIndex((prev) => {
            const pos = actionableIndexes.indexOf(prev);
            if (e.key === "ArrowDown") {
              const next = pos < 0 ? 0 : (pos + 1) % actionableIndexes.length;
              return actionableIndexes[next];
            }
            const next =
              pos <= 0 ? actionableIndexes.length - 1 : pos - 1;
            return actionableIndexes[next];
          });
        } else if (e.key === "Enter" || e.key === " ") {
          if (activeIndex >= 0) {
            e.preventDefault();
            selectItem(items[activeIndex]);
          }
        } else if (e.key === "Home") {
          e.preventDefault();
          if (actionableIndexes.length) setActiveIndex(actionableIndexes[0]);
        } else if (e.key === "End") {
          e.preventDefault();
          if (actionableIndexes.length)
            setActiveIndex(actionableIndexes[actionableIndexes.length - 1]);
        }
      };
      const onScroll = () => close();
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", close);
      window.addEventListener("scroll", onScroll, true);
      return () => {
        document.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", close);
        window.removeEventListener("scroll", onScroll, true);
      };
    }, [open, close, actionableIndexes, activeIndex, items, selectItem]);

    // Keep the menu within the viewport once measured.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const node = menuRef.current;
      if (!node || !position) return;
      const rect = node.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 4;
      const maxY = window.innerHeight - rect.height - 4;
      const clampedX = Math.max(4, Math.min(position.x, maxX));
      const clampedY = Math.max(4, Math.min(position.y, maxY));
      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY });
      }
    }, [open, position]);

    // Focus menu on open for keyboard nav.
    useEffect(() => {
      if (open) menuRef.current?.focus();
    }, [open]);

    const menu =
      open && canUseDOM()
        ? ReactDOM.createPortal(
            <div
              ref={setRefs}
              role="menu"
              tabIndex={-1}
              className={cn("nova-context-menu", className)}
              style={{ left: position!.x, top: position!.y }}
              {...rest}
            >
              {items.map((item, i) => {
                if (!isActionable(item)) {
                  return (
                    <div
                      key={item.id}
                      role="separator"
                      className="nova-context-menu__separator"
                    />
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={cn(
                      "nova-context-menu__item",
                      item.danger && "nova-context-menu__item--danger",
                      i === activeIndex && "nova-context-menu__item--active"
                    )}
                    disabled={item.disabled}
                    aria-disabled={item.disabled || undefined}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => selectItem(item)}
                  >
                    {item.icon != null && (
                      <span className="nova-context-menu__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="nova-context-menu__label">{item.label}</span>
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null;

    return (
      <>
        <div
          className="nova-context-menu__trigger"
          onContextMenu={handleContextMenu}
        >
          {children}
        </div>
        {menu}
      </>
    );
  }
);
