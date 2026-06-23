import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./ConfirmDialog.css";

export type ConfirmDialogTone = "default" | "danger";

export interface ConfirmDialogProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when the user confirms the action. */
  onConfirm?: () => void;
  /** Called when the user cancels (Esc, overlay click, cancel button). */
  onCancel?: () => void;
  /** Heading describing the action. */
  title?: ReactNode;
  /** Supporting copy explaining consequences. */
  description?: ReactNode;
  /** Confirm button label. Defaults to `"Confirm"`. */
  confirmText?: ReactNode;
  /** Cancel button label. Defaults to `"Cancel"`. */
  cancelText?: ReactNode;
  /** Visual emphasis. Defaults to `"default"`. */
  tone?: ConfirmDialogTone;
  /** Shows a busy state on the confirm button and blocks confirm. */
  loading?: boolean;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      open,
      onConfirm,
      onCancel,
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      tone = "default",
      loading = false,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      className,
      ...rest
    },
    ref
  ) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const confirmRef = useRef<HTMLButtonElement | null>(null);
    const cancelRef = useRef<HTMLButtonElement | null>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        dialogRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Escape cancels.
    useEffect(() => {
      if (!open || !closeOnEsc || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel?.();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, closeOnEsc, onCancel]);

    // Focus the safest action on open; for danger, prefer cancel.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      const target =
        tone === "danger" ? cancelRef.current : confirmRef.current;
      (target ?? dialogRef.current)?.focus();
      return () => {
        restoreFocusRef.current?.focus?.();
      };
    }, [open, tone]);

    // Basic focus trap.
    const onKeyDownTrap = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Tab") return;
        const node = dialogRef.current;
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

    if (!open || !canUseDOM()) return null;

    const overlay = (
      <div
        className="nova-confirm-dialog__overlay"
        onMouseDown={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget && !loading)
            onCancel?.();
        }}
      >
        <div
          ref={setRefs}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title != null ? "nova-confirm-dialog-title" : undefined}
          aria-describedby={
            description != null ? "nova-confirm-dialog-desc" : undefined
          }
          tabIndex={-1}
          className={cn(
            "nova-confirm-dialog",
            `nova-confirm-dialog--${tone}`,
            className
          )}
          onKeyDown={onKeyDownTrap}
          {...rest}
        >
          {title != null && (
            <h2 id="nova-confirm-dialog-title" className="nova-confirm-dialog__title">
              {title}
            </h2>
          )}
          {description != null && (
            <p
              id="nova-confirm-dialog-desc"
              className="nova-confirm-dialog__description"
            >
              {description}
            </p>
          )}
          <div className="nova-confirm-dialog__actions">
            <button
              ref={cancelRef}
              type="button"
              className="nova-confirm-dialog__button nova-confirm-dialog__button--cancel"
              onClick={() => onCancel?.()}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              type="button"
              className={cn(
                "nova-confirm-dialog__button",
                "nova-confirm-dialog__button--confirm",
                tone === "danger" && "nova-confirm-dialog__button--danger"
              )}
              onClick={() => onConfirm?.()}
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading && (
                <span
                  className="nova-confirm-dialog__spinner"
                  aria-hidden="true"
                />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(overlay, document.body);
  }
);
