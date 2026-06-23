import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Drawer.css";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Called when the user requests to close. */
  onClose?: () => void;
  /** Edge the sheet slides in from. Defaults to `"right"`. */
  placement?: DrawerPlacement;
  /** Size of the sheet on its sliding axis. Defaults to `"md"`. */
  size?: DrawerSize;
  /** Convenience title rendered in a default header. */
  title?: ReactNode;
  /** Convenience footer content. */
  footer?: ReactNode;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
  /** Drawer body content. */
  children?: ReactNode;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || !canUseDOM()) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [active]);
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onClose,
    placement = "right",
    size = "md",
    title,
    footer,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    className,
    children,
    ...rest
  },
  ref
) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  useEffect(() => {
    if (!open || !closeOnEsc || !canUseDOM()) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open || !canUseDOM()) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    if (node) {
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus();
    }
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  const onKeyDownTrap = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const node = panelRef.current;
    if (!node) return;
    const focusables = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (focusables.length === 0) {
      e.preventDefault();
      node.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useScrollLock(open);

  if (!open || !canUseDOM()) return null;

  const overlay = (
    <div
      className="nova-drawer__overlay"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "nova-drawer",
          `nova-drawer--${placement}`,
          `nova-drawer--${size}`,
          className
        )}
        onKeyDown={onKeyDownTrap}
        {...rest}
      >
        {title != null && (
          <div className="nova-drawer__header">
            <h2 className="nova-drawer__title">{title}</h2>
          </div>
        )}
        <div className="nova-drawer__body">{children}</div>
        {footer != null && <div className="nova-drawer__footer">{footer}</div>}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
});
