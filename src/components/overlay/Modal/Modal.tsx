import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Modal.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user requests to close (overlay click, Esc, close button). */
  onClose?: () => void;
  /** Width preset. Defaults to `"md"`. */
  size?: ModalSize;
  /** Convenience title rendered in a default header. */
  title?: ReactNode;
  /** Convenience footer content rendered in a default footer. */
  footer?: ReactNode;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
  /** Modal body / sub-parts. */
  children?: ReactNode;
}

/** Returns true when running in a browser with a DOM available. */
const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Locks body scroll for as long as `active` is true, restoring on cleanup. */
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // Escape-to-close.
  useEffect(() => {
    if (!open || !closeOnEsc || !canUseDOM()) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  // Focus management: focus first focusable on open, restore on close.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    if (node) {
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus();
    }
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Basic focus trap: keep Tab cycling inside the dialog.
  const onKeyDownTrap = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const node = dialogRef.current;
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
      className="nova-modal__overlay"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn("nova-modal", `nova-modal--${size}`, className)}
        onKeyDown={onKeyDownTrap}
        {...rest}
      >
        {title != null && (
          <ModalHeader>
            <h2 className="nova-modal__title">{title}</h2>
          </ModalHeader>
        )}
        {children}
        {footer != null && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}) as ModalComponent;

export interface ModalSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalSectionProps>(
  function ModalHeader({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("nova-modal__header", className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

export const ModalBody = forwardRef<HTMLDivElement, ModalSectionProps>(
  function ModalBody({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("nova-modal__body", className)} {...rest}>
        {children}
      </div>
    );
  }
);

export const ModalFooter = forwardRef<HTMLDivElement, ModalSectionProps>(
  function ModalFooter({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("nova-modal__footer", className)} {...rest}>
        {children}
      </div>
    );
  }
);

interface ModalComponent
  extends React.ForwardRefExoticComponent<
    ModalProps & React.RefAttributes<HTMLDivElement>
  > {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
