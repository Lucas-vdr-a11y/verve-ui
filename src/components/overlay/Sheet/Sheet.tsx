import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Sheet.css";

export interface SheetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the sheet is visible. */
  open: boolean;
  /** Called on overlay click, Esc, drag-dismiss, or close button. */
  onClose?: () => void;
  /** Convenience heading rendered near the drag handle. */
  title?: ReactNode;
  /** Sheet body. */
  children?: ReactNode;
  /** Show the grab affordance at the top. Defaults to `true`. */
  showHandle?: boolean;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DRAG_DISMISS_PX = 80;

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet(
  {
    open,
    onClose,
    title,
    children,
    showHandle = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    className,
    ...rest
  },
  ref
) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragOffset = useRef(0);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      sheetRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // Escape close.
  useEffect(() => {
    if (!open || !closeOnEsc || !canUseDOM()) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  // Focus management.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const node = sheetRef.current;
    if (node) {
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus();
    }
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Focus trap.
  const onKeyDownTrap = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const node = sheetRef.current;
      if (!node) return;
      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
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
    },
    []
  );

  // Scroll lock.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  // Drag-to-dismiss from the handle area (pointer-based).
  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragStartY.current = e.clientY;
      dragOffset.current = 0;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    []
  );

  const onHandlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartY.current == null) return;
      const delta = e.clientY - dragStartY.current;
      dragOffset.current = Math.max(0, delta);
      const node = sheetRef.current;
      if (node) node.style.transform = `translateY(${dragOffset.current}px)`;
    },
    []
  );

  const endDrag = useCallback(() => {
    if (dragStartY.current == null) return;
    const node = sheetRef.current;
    const shouldDismiss = dragOffset.current > DRAG_DISMISS_PX;
    if (node) node.style.transform = "";
    dragStartY.current = null;
    dragOffset.current = 0;
    if (shouldDismiss) onClose?.();
  }, [onClose]);

  if (!open || !canUseDOM()) return null;

  const overlay = (
    <div
      className="nova-sheet__overlay"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? "nova-sheet-title" : undefined}
        tabIndex={-1}
        className={cn("nova-sheet", className)}
        onKeyDown={onKeyDownTrap}
        {...rest}
      >
        {showHandle && (
          <div
            className="nova-sheet__handle-area"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <span className="nova-sheet__handle" aria-hidden="true" />
          </div>
        )}
        {title != null && (
          <div className="nova-sheet__header">
            <h2 id="nova-sheet-title" className="nova-sheet__title">
              {title}
            </h2>
          </div>
        )}
        <div className="nova-sheet__body">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
});
