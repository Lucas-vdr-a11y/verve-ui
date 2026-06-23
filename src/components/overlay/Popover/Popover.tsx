import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./Popover.css";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** The element that toggles the popover. */
  trigger: ReactNode;
  /** Floating panel content. */
  content: ReactNode;
  /** Side of the trigger the panel appears on. Defaults to `"bottom"`. */
  placement?: PopoverPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Notified whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Render a directional arrow. Defaults to `false`. */
  arrow?: boolean;
  /** Close when clicking outside the popover. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(
    {
      trigger,
      content,
      placement = "bottom",
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      arrow = false,
      closeOnClickOutside = true,
      closeOnEsc = true,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = isControlled ? openProp : internalOpen;

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        wrapperRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange]
    );

    // Click-outside close.
    useEffect(() => {
      if (!open || !closeOnClickOutside || !canUseDOM()) return;
      const onPointerDown = (e: MouseEvent) => {
        const node = wrapperRef.current;
        if (node && !node.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open, closeOnClickOutside, setOpen]);

    // Escape close.
    useEffect(() => {
      if (!open || !closeOnEsc || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, closeOnEsc, setOpen]);

    return (
      <div
        ref={setRefs}
        className={cn("nova-popover", className)}
        {...rest}
      >
        <span
          className="nova-popover__trigger"
          onClick={() => setOpen(!open)}
        >
          {trigger}
        </span>
        {open && (
          <div
            role="dialog"
            className={cn(
              "nova-popover__panel",
              `nova-popover__panel--${placement}`,
              arrow && "nova-popover__panel--arrow"
            )}
          >
            {content}
            {arrow && <span className="nova-popover__arrow" aria-hidden="true" />}
          </div>
        )}
      </div>
    );
  }
);
