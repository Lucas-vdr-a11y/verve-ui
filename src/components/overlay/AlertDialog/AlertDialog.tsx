import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./AlertDialog.css";

export type AlertDialogTone = "default" | "danger";

export interface AlertDialogProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when the user acknowledges (OK button, Esc, overlay click). */
  onClose?: () => void;
  /** Heading describing what happened. */
  title?: ReactNode;
  /** Supporting copy. */
  description?: ReactNode;
  /** Acknowledge button label. Defaults to `"OK"`. */
  actionText?: ReactNode;
  /** Visual emphasis. Defaults to `"default"`. */
  tone?: AlertDialogTone;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(
    {
      open,
      onClose,
      title,
      description,
      actionText = "OK",
      tone = "default",
      closeOnOverlayClick = true,
      closeOnEsc = true,
      className,
      ...rest
    },
    ref
  ) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const actionRef = useRef<HTMLButtonElement | null>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        dialogRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Escape acknowledges.
    useEffect(() => {
      if (!open || !closeOnEsc || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, closeOnEsc, onClose]);

    // Focus the single action on open; restore on close.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      (actionRef.current ?? dialogRef.current)?.focus();
      return () => {
        restoreFocusRef.current?.focus?.();
      };
    }, [open]);

    // Trap focus: only one action, so keep focus on it.
    const onKeyDownTrap = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Tab") return;
        e.preventDefault();
        actionRef.current?.focus();
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
        className="nova-alert-dialog__overlay"
        onMouseDown={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          ref={setRefs}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title != null ? "nova-alert-dialog-title" : undefined}
          aria-describedby={
            description != null ? "nova-alert-dialog-desc" : undefined
          }
          tabIndex={-1}
          className={cn(
            "nova-alert-dialog",
            `nova-alert-dialog--${tone}`,
            className
          )}
          onKeyDown={onKeyDownTrap}
          {...rest}
        >
          {title != null && (
            <h2 id="nova-alert-dialog-title" className="nova-alert-dialog__title">
              {title}
            </h2>
          )}
          {description != null && (
            <p
              id="nova-alert-dialog-desc"
              className="nova-alert-dialog__description"
            >
              {description}
            </p>
          )}
          <div className="nova-alert-dialog__actions">
            <button
              ref={actionRef}
              type="button"
              className={cn(
                "nova-alert-dialog__button",
                tone === "danger" && "nova-alert-dialog__button--danger"
              )}
              onClick={() => onClose?.()}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(overlay, document.body);
  }
);
