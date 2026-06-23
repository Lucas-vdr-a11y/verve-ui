import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./AnimatedModal.css";

export interface AnimatedModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  /** Trigger node (a button). Clicking it opens the modal. */
  trigger: React.ReactNode;
  /** Optional accessible title for the dialog. */
  title?: React.ReactNode;
  /** Modal body content. */
  children?: React.ReactNode;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  /** Called when the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Close when the backdrop is clicked. Defaults `true`. */
  closeOnBackdrop?: boolean;
  /** Close when Escape is pressed. Defaults `true`. */
  closeOnEsc?: boolean;
}

/**
 * A trigger button that morphs/expands into a centered modal dialog with a
 * shared-element feel (scales + fades up from the trigger position) over a
 * blurred backdrop. Rendered through a portal (SSR-safe), with focus trapping,
 * Escape-to-close, scroll lock, and `role="dialog"`/`aria-modal`.
 *
 * Works controlled (`open` + `onOpenChange`) or uncontrolled.
 */
export const AnimatedModal = forwardRef<HTMLDivElement, AnimatedModalProps>(
  function AnimatedModal(
    {
      trigger,
      title,
      children,
      open: openProp,
      onOpenChange,
      closeOnBackdrop = true,
      closeOnEsc = true,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = openProp !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = isControlled ? openProp : uncontrolledOpen;

    // Mounted (in DOM) vs visible (animated in) so we can animate out before unmount.
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const triggerRef = useRef<HTMLDivElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const lastFocused = useRef<HTMLElement | null>(null);
    const titleId = useId();

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange]
    );

    // Compute transform origin from the trigger's center relative to viewport.
    const setOrigin = useCallback(() => {
      const el = triggerRef.current;
      const dialog = dialogRef.current;
      if (!el || !dialog) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      dialog.style.setProperty("--nova-am-origin-x", `${cx}px`);
      dialog.style.setProperty("--nova-am-origin-y", `${cy}px`);
    }, []);

    // Open: mount, then flip to visible on next frame for the transition.
    useEffect(() => {
      if (open) {
        if (typeof document !== "undefined") {
          lastFocused.current = document.activeElement as HTMLElement | null;
        }
        setMounted(true);
        return;
      }
      // Closing: animate out, then unmount.
      if (mounted) {
        setVisible(false);
        if (reduced) {
          setMounted(false);
          return;
        }
        const t = window.setTimeout(() => setMounted(false), 240);
        return () => window.clearTimeout(t);
      }
    }, [open, mounted, reduced]);

    // Once mounted, set origin and reveal.
    useEffect(() => {
      if (!mounted) return;
      setOrigin();
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }, [mounted, setOrigin]);

    // Scroll lock + focus management + key handling while mounted.
    useEffect(() => {
      if (!mounted || typeof document === "undefined") return;
      const body = document.body;
      const prevOverflow = body.style.overflow;
      body.style.overflow = "hidden";

      // Move focus into the dialog.
      const focusFirst = () => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable ?? dialog).focus();
      };
      const ft = requestAnimationFrame(focusFirst);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && closeOnEsc) {
          e.stopPropagation();
          setOpen(false);
          return;
        }
        if (e.key !== "Tab") return;
        const dialog = dialogRef.current;
        if (!dialog) return;
        const nodes = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((n) => !n.hasAttribute("disabled"));
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", onKeyDown, true);
      return () => {
        cancelAnimationFrame(ft);
        document.removeEventListener("keydown", onKeyDown, true);
        body.style.overflow = prevOverflow;
        lastFocused.current?.focus?.();
      };
    }, [mounted, closeOnEsc, setOpen]);

    const portal =
      mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={ref}
              className={cn(
                "nova-animated-modal",
                visible && "nova-animated-modal--open",
                className
              )}
              {...rest}
            >
              <div
                className="nova-animated-modal__backdrop"
                aria-hidden="true"
                onClick={closeOnBackdrop ? () => setOpen(false) : undefined}
              />
              <div
                ref={dialogRef}
                className="nova-animated-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
              >
                <button
                  type="button"
                  className="nova-animated-modal__close"
                  aria-label="Close dialog"
                  onClick={() => setOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </button>
                {title != null && (
                  <h2 id={titleId} className="nova-animated-modal__title">
                    {title}
                  </h2>
                )}
                <div className="nova-animated-modal__body">{children}</div>
              </div>
            </div>,
            document.body
          )
        : null;

    return (
      <>
        <div
          ref={triggerRef}
          className="nova-animated-modal__trigger"
          onClick={() => setOpen(true)}
        >
          {trigger}
        </div>
        {portal}
      </>
    );
  }
);
