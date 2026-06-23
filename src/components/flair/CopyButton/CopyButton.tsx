import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./CopyButton.css";

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Text to copy to the clipboard on click. */
  value: string;
  /** Tooltip text shown after a successful copy. Defaults `"Copied!"`. */
  copiedLabel?: string;
  /** How long (ms) the copied state persists. Defaults `1600`. */
  resetDelay?: number;
  /** Called after a successful copy. */
  onCopied?: (value: string) => void;
}

/**
 * A button whose icon morphs from a "copy" glyph to an animated checkmark on a
 * successful clipboard write, showing a "Copied!" tooltip. Copy is guarded:
 * it tries `navigator.clipboard.writeText` and falls back to a temporary
 * textarea + `execCommand`, all SSR-safe. The success state auto-resets via a
 * cleaned-up timer.
 *
 * Real `<button>` with `aria-live` feedback. The check draw-in is instant under
 * reduced motion.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      copiedLabel = "Copied!",
      resetDelay = 1600,
      onCopied,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      []
    );

    const writeClipboard = useCallback(async (text: string) => {
      if (typeof navigator === "undefined" || typeof document === "undefined")
        return false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch {
        /* fall through to legacy path */
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }, []);

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const ok = await writeClipboard(value);
        if (!ok) return;
        onCopied?.(value);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetDelay);
      },
      [onClick, onCopied, resetDelay, value, writeClipboard]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-copy", copied && "nova-copy--copied", className)}
        onClick={handleClick}
        aria-label={ariaLabel ?? (copied ? copiedLabel : "Copy")}
        {...rest}
      >
        <span className="nova-copy__icons" aria-hidden="true">
          <svg
            className="nova-copy__icon nova-copy__icon--copy"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          <svg
            className="nova-copy__icon nova-copy__icon--check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="nova-copy__check-path" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="nova-copy__tooltip" role="status" aria-live="polite">
          {copied ? copiedLabel : ""}
        </span>
      </button>
    );
  }
);
