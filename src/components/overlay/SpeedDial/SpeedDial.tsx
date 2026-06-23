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
import "./SpeedDial.css";

export type SpeedDialDirection = "up" | "down" | "left" | "right";

export type SpeedDialPlacement =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface SpeedDialAction {
  /** Stable identifier. */
  id: string;
  /** Icon node for the action button. */
  icon: ReactNode;
  /** Accessible label, also shown as a tooltip. */
  label: string;
  /** Invoked when the action is chosen. */
  onSelect?: () => void;
  /** Disable this single action. */
  disabled?: boolean;
}

export interface SpeedDialProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Actions revealed when the dial opens. */
  actions: SpeedDialAction[];
  /** Icon for the main trigger button. */
  icon: ReactNode;
  /** Accessible label for the main trigger. */
  label: string;
  /** Direction the actions fan out. Defaults to `"up"`. */
  direction?: SpeedDialDirection;
  /** Fixed placement of the dial. Defaults to `"bottom-right"`. */
  placement?: SpeedDialPlacement;
  /** Open on pointer hover (in addition to click). Defaults to `false`. */
  openOnHover?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Notified whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Position relative to the nearest positioned ancestor instead of the
   * viewport. Defaults to `false` (fixed to viewport).
   */
  absolute?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(
  function SpeedDial(
    {
      actions,
      icon,
      label,
      direction = "up",
      placement = "bottom-right",
      openOnHover = false,
      open: openProp,
      onOpenChange,
      absolute = false,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const open = isControlled ? openProp : internalOpen;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const menuId = useId();

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
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

    // Click-outside + Escape close.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onPointerDown = (e: PointerEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [open, setOpen]);

    const hoverProps = openOnHover
      ? {
          onPointerEnter: () => setOpen(true),
          onPointerLeave: () => setOpen(false),
        }
      : {};

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-speed-dial",
          `nova-speed-dial--${placement}`,
          `nova-speed-dial--${direction}`,
          open && "nova-speed-dial--open",
          absolute && "nova-speed-dial--absolute",
          className
        )}
        {...hoverProps}
        {...rest}
      >
        <ul
          className="nova-speed-dial__actions"
          id={menuId}
          role="menu"
          aria-label={label}
          hidden={!open}
        >
          {actions.map((action, i) => (
            <li
              key={action.id}
              className="nova-speed-dial__action-item"
              role="none"
              style={{
                ["--nova-speed-dial-i" as string]: String(i),
                ["--nova-speed-dial-n" as string]: String(actions.length),
              }}
            >
              <span className="nova-speed-dial__tooltip" aria-hidden="true">
                {action.label}
              </span>
              <button
                type="button"
                role="menuitem"
                aria-label={action.label}
                disabled={action.disabled}
                tabIndex={open ? 0 : -1}
                className={cn("nova-speed-dial__action", "nova-focusable")}
                onClick={() => {
                  action.onSelect?.();
                  setOpen(false);
                }}
              >
                <span className="nova-speed-dial__action-icon" aria-hidden="true">
                  {action.icon}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          className={cn("nova-speed-dial__trigger", "nova-focusable")}
          onClick={() => setOpen(!open)}
        >
          <span className="nova-speed-dial__trigger-icon" aria-hidden="true">
            {icon}
          </span>
        </button>
      </div>
    );
  }
);
