import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./HoverCard.css";

export type HoverCardPlacement = "top" | "bottom" | "left" | "right";

export interface HoverCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** Element that reveals the card on hover/focus. */
  trigger: ReactNode;
  /** Card body. Not for critical information. */
  content: ReactNode;
  /** Side of the trigger the card appears on. Defaults to `"bottom"`. */
  placement?: HoverCardPlacement;
  /** Delay before opening, in ms. Defaults to `300`. */
  openDelay?: number;
  /** Delay before closing, in ms. Defaults to `150`. */
  closeDelay?: number;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  function HoverCard(
    {
      trigger,
      content,
      placement = "bottom",
      openDelay = 300,
      closeDelay = 150,
      className,
      ...rest
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardId = useId();

    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const scheduleOpen = useCallback(() => {
      clearTimer();
      timerRef.current = setTimeout(() => setOpen(true), openDelay);
    }, [clearTimer, openDelay]);

    const scheduleClose = useCallback(() => {
      clearTimer();
      timerRef.current = setTimeout(() => setOpen(false), closeDelay);
    }, [clearTimer, closeDelay]);

    // Clean up any pending timer on unmount.
    useEffect(() => clearTimer, [clearTimer]);

    // Esc closes immediately when open.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          clearTimer();
          setOpen(false);
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, clearTimer]);

    return (
      <div
        ref={ref}
        className={cn("nova-hover-card", className)}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
        {...rest}
      >
        <span
          className="nova-hover-card__trigger"
          aria-describedby={open ? cardId : undefined}
        >
          {trigger}
        </span>
        {open && (
          <div
            id={cardId}
            role="tooltip"
            className={cn(
              "nova-hover-card__panel",
              `nova-hover-card__panel--${placement}`
            )}
            onMouseEnter={clearTimer}
            onMouseLeave={scheduleClose}
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);
