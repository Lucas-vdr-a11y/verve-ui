import { useEffect, useRef, type ReactNode } from "react";

export interface FocusTrapProps {
  /** Trapped content. */
  children: ReactNode;
  /** Whether the trap is active. Defaults to `true`. */
  active?: boolean;
  /**
   * Move focus to the first focusable element when the trap activates.
   * Defaults to `true`.
   */
  autoFocus?: boolean;
  /**
   * Restore focus to the previously focused element when the trap
   * deactivates / unmounts. Defaults to `true`.
   */
  restoreFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el === document.activeElement
  );
}

/**
 * Traps Tab / Shift+Tab focus within its children while `active`.
 *
 * On activation it (optionally) focuses the first focusable element and
 * remembers what was focused before; on deactivation it (optionally) restores
 * that focus. SSR-safe — all DOM access happens inside effects.
 */
export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  restoreFocus = true,
}: FocusTrapProps): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    if (autoFocus) {
      const focusable = getFocusable(container);
      (focusable[0] ?? container).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        // Nothing focusable inside — keep focus on the container.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (restoreFocus) {
        previouslyFocused.current?.focus?.();
      }
    };
  }, [active, autoFocus, restoreFocus]);

  return (
    <div ref={containerRef} tabIndex={-1} style={{ outline: "none" }}>
      {children}
    </div>
  );
}
