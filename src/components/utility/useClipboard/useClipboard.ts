import { useCallback, useEffect, useRef, useState } from "react";

export interface UseClipboardOptions {
  /**
   * How long (ms) `copied` stays `true` after a successful copy before
   * resetting back to `false`. Defaults to `2000`.
   */
  timeout?: number;
}

export interface UseClipboardReturn {
  /** Copy `text` to the clipboard. Resolves to `true` on success. */
  copy: (text: string) => Promise<boolean>;
  /** `true` for `timeout` ms after a successful copy. */
  copied: boolean;
  /** The error thrown by the last failed copy, or `null`. */
  error: Error | null;
}

/**
 * Copy text to the clipboard with transient `copied` feedback.
 *
 * SSR-safe: guards `navigator.clipboard` (and falls back to a hidden
 * `textarea` + `execCommand` where the async API is unavailable). The `copied`
 * flag auto-resets after `timeout` ms; the reset timer is cleared on unmount.
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { timeout = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();

      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          // Legacy fallback for non-secure contexts / older browsers.
          const el = document.createElement("textarea");
          el.value = text;
          el.setAttribute("readonly", "");
          el.style.position = "absolute";
          el.style.left = "-9999px";
          document.body.appendChild(el);
          el.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(el);
          if (!ok) throw new Error("Copy command was rejected.");
        } else {
          throw new Error("Clipboard is not available in this environment.");
        }

        setError(null);
        setCopied(true);
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, timeout);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setCopied(false);
        return false;
      }
    },
    [clearTimer, timeout]
  );

  return { copy, copied, error };
}
