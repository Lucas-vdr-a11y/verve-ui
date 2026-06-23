import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Snackbar.css";

export type SnackbarPlacement =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export interface SnackbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the snackbar is visible. */
  open: boolean;
  /** Called when the snackbar requests to close (auto-hide or dismiss). */
  onClose?: () => void;
  /** Message content. */
  message: ReactNode;
  /** Optional single action button label. */
  actionLabel?: string;
  /** Invoked when the action button is pressed. */
  onAction?: () => void;
  /**
   * Auto-hide after this many milliseconds. Set `null` to disable.
   * Defaults to `5000`.
   */
  autoHideDuration?: number | null;
  /** Where the snackbar appears. Defaults to `"bottom-center"`. */
  placement?: SnackbarPlacement;
  /** Show a dismiss (close) button. Defaults to `true`. */
  dismissible?: boolean;
  /** Render into a portal at document.body. Defaults to `true`. */
  portal?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  function Snackbar(
    {
      open,
      onClose,
      message,
      actionLabel,
      onAction,
      autoHideDuration = 5000,
      placement = "bottom-center",
      dismissible = true,
      portal = true,
      className,
      ...rest
    },
    ref
  ) {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Auto-hide timer.
    useEffect(() => {
      if (!open || autoHideDuration == null) return;
      const id = window.setTimeout(() => onCloseRef.current?.(), autoHideDuration);
      return () => window.clearTimeout(id);
    }, [open, autoHideDuration]);

    const handleAction = useCallback(() => {
      onAction?.();
      onClose?.();
    }, [onAction, onClose]);

    if (!open || !canUseDOM()) return null;

    const node = (
      <div
        className={cn(
          "nova-snackbar-region",
          `nova-snackbar-region--${placement}`
        )}
      >
        <div
          ref={ref}
          role="status"
          aria-live="polite"
          className={cn("nova-snackbar", className)}
          {...rest}
        >
          <div className="nova-snackbar__message">{message}</div>
          {(actionLabel || dismissible) && (
            <div className="nova-snackbar__actions">
              {actionLabel && (
                <button
                  type="button"
                  className={cn("nova-snackbar__action", "nova-focusable")}
                  onClick={handleAction}
                >
                  {actionLabel}
                </button>
              )}
              {dismissible && (
                <button
                  type="button"
                  aria-label="Dismiss"
                  className={cn("nova-snackbar__dismiss", "nova-focusable")}
                  onClick={() => onClose?.()}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );

    if (!portal) return node;
    return ReactDOM.createPortal(node, document.body);
  }
);
