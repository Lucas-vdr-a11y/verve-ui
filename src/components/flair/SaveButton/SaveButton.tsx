import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./SaveButton.css";

export type SaveStatus = "idle" | "saving" | "saved";

export interface SaveButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Controlled status. When provided, the button reflects it directly. */
  status?: SaveStatus;
  /** Async save handler. Drives idle→saving→saved automatically when uncontrolled. */
  onSave?: () => void | Promise<void>;
  /** Label for each phase. */
  idleLabel?: React.ReactNode;
  savingLabel?: React.ReactNode;
  savedLabel?: React.ReactNode;
  /** How long (ms) the saved state lingers before returning to idle (uncontrolled). Defaults `1600`. */
  resetDelay?: number;
}

/**
 * A stateful save button that animates idle → saving (spinner) → saved (a
 * check that draws in). Either drive it with a controlled `status`, or pass an
 * async `onSave`: the button shows the spinner while the promise is pending,
 * morphs to the check on resolve, then returns to idle after `resetDelay`. The
 * pending timer is cleared on unmount and a mounted-guard avoids state updates
 * after teardown.
 *
 * Real `<button>`, disabled while saving. Spinner/draw are instant under reduced
 * motion (handled in CSS).
 */
export const SaveButton = forwardRef<HTMLButtonElement, SaveButtonProps>(
  function SaveButton(
    {
      status: statusProp,
      onSave,
      idleLabel = "Save",
      savingLabel = "Saving",
      savedLabel = "Saved",
      resetDelay = 1600,
      className,
      type,
      disabled,
      ...rest
    },
    ref
  ) {
    const isControlled = statusProp !== undefined;
    const [internal, setInternal] = useState<SaveStatus>("idle");
    const status = isControlled ? statusProp : internal;

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const handleClick = useCallback(async () => {
      if (status === "saving") return;
      if (isControlled) {
        await onSave?.();
        return;
      }
      setInternal("saving");
      try {
        await onSave?.();
      } finally {
        if (!mountedRef.current) return;
        setInternal("saved");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) setInternal("idle");
        }, resetDelay);
      }
    }, [isControlled, onSave, resetDelay, status]);

    const label =
      status === "saving"
        ? savingLabel
        : status === "saved"
          ? savedLabel
          : idleLabel;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-save", `nova-save--${status}`, className)}
        onClick={handleClick}
        disabled={disabled || status === "saving"}
        aria-live="polite"
        {...rest}
      >
        <span className="nova-save__icon" aria-hidden="true">
          <span className="nova-save__disk">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3h11l3 3v15H5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M8 3v5h7V3M8 21v-6h8v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="nova-save__spinner" />
          <svg className="nova-save__check" viewBox="0 0 24 24">
            <path
              className="nova-save__check-path"
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="nova-save__label">{label}</span>
      </button>
    );
  }
);
