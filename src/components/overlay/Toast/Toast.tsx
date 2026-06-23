import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Toast.css";

export type ToastTone = "info" | "success" | "warning" | "danger";

export type ToastPlacement =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToastOptions {
  /** Bold heading line. */
  title?: ReactNode;
  /** Secondary descriptive line. */
  description?: ReactNode;
  /** Visual tone. Defaults to `"info"`. */
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. `0` disables auto-dismiss. Defaults to `5000`. */
  duration?: number;
}

export interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  /** Enqueue a toast; returns its id. */
  toast: (options: ToastOptions) => string;
  /** Dismiss a toast by id. */
  dismiss: (id: string) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Where the stack is anchored. Defaults to `"top-right"`. */
  placement?: ToastPlacement;
  /** Default auto-dismiss duration in ms. Defaults to `5000`. */
  defaultDuration?: number;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

export function ToastProvider({
  children,
  placement = "top-right",
  defaultDuration = 5000,
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer]
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `nova-toast-${++toastCounter}`;
      const duration = options.duration ?? defaultDuration;
      const record: ToastRecord = { tone: "info", ...options, id, duration };
      setToasts((prev) => [...prev, record]);
      if (duration > 0 && canUseDOM()) {
        const handle = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, handle);
      }
      return id;
    },
    [defaultDuration, dismiss]
  );

  // Clean up any outstanding timers on unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((handle) => clearTimeout(handle));
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {canUseDOM() &&
        ReactDOM.createPortal(
          <div
            className={cn(
              "nova-toast-viewport",
              `nova-toast-viewport--${placement}`
            )}
            role="region"
            aria-label="Notifications"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps): React.ReactElement {
  const tone = toast.tone ?? "info";
  return (
    <div
      className={cn("nova-toast", `nova-toast--${tone}`)}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={tone === "danger" || tone === "warning" ? "assertive" : "polite"}
    >
      <div className="nova-toast__content">
        {toast.title != null && (
          <div className="nova-toast__title">{toast.title}</div>
        )}
        {toast.description != null && (
          <div className="nova-toast__description">{toast.description}</div>
        )}
      </div>
      <button
        type="button"
        className="nova-toast__close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.5 3.5l7 7M10.5 3.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/** Access the toast API. Must be used under a `ToastProvider`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>.");
  }
  return ctx;
}
