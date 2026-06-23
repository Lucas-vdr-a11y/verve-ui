import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./FloatingActionMenu.css";

export interface FloatingActionMenuAction {
  /** Stable unique key. */
  value: string;
  /** Accessible label, also shown as a pill caption beside the button. */
  label: string;
  /** Icon rendered inside the action button. */
  icon: React.ReactNode;
  /** Disable this action. */
  disabled?: boolean;
}

export interface FloatingActionMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Actions that fan out from the trigger. */
  actions: FloatingActionMenuAction[];
  /** Called with the selected action's value (menu closes after). */
  onSelect?: (value: string) => void;
  /** Open state (controlled). */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Direction the arc fans toward. @default "up" */
  direction?: "up" | "down" | "left" | "right";
  /** Total angular spread of the arc, in degrees. @default 90 */
  spread?: number;
  /** Distance of fanned buttons from the trigger, in px. @default 80 */
  radius?: number;
  /** Size of the trigger + actions. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Accessible label for the trigger. @default "Actions" */
  triggerLabel?: string;
}

const BASE_ANGLE: Record<
  NonNullable<FloatingActionMenuProps["direction"]>,
  number
> = {
  up: -90,
  down: 90,
  right: 0,
  left: 180,
};

/**
 * FloatingActionMenu — a "+" trigger that fans a radial arc of labelled action
 * buttons on click. Distinct from a SpeedDial stack: actions are placed along an
 * arc (transform translate from polar coords) with captions. Closes on
 * outside-click, Escape, or after selecting an action.
 */
export const FloatingActionMenu = forwardRef<
  HTMLDivElement,
  FloatingActionMenuProps
>(function FloatingActionMenu(
  {
    actions,
    onSelect,
    open,
    defaultOpen = false,
    onOpenChange,
    direction = "up",
    spread = 90,
    radius = 80,
    size = "md",
    triggerLabel = "Actions",
    className,
    ...rest
  },
  ref,
) {
  const isControlled = open !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolled;
  const reduced = useReducedMotion();
  const menuId = useId().replace(/[:]/g, "");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Close on outside click and Escape while open.
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setOpen]);

  const count = actions.length;
  const base = BASE_ANGLE[direction];
  // Spread the actions symmetrically around the base angle.
  const step = count > 1 ? spread / (count - 1) : 0;
  const start = base - spread / 2;

  return (
    <div
      ref={setRefs}
      className={cn(
        "nova-fab-menu",
        `nova-fab-menu--${size}`,
        `nova-fab-menu--${direction}`,
        isOpen && "nova-fab-menu--open",
        reduced && "nova-fab-menu--reduced",
        className,
      )}
      {...rest}
    >
      <ul
        id={menuId}
        role="menu"
        aria-label={triggerLabel}
        className="nova-fab-menu__list"
        data-open={isOpen || undefined}
      >
        {actions.map((action, index) => {
          const angle = count > 1 ? start + step * index : base;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const captionLeft = x < -1;
          return (
            <li
              key={action.value}
              role="none"
              className="nova-fab-menu__item"
              style={
                {
                  "--nova-fab-x": `${x}px`,
                  "--nova-fab-y": `${y}px`,
                  "--nova-fab-delay": `${index * 28}ms`,
                } as React.CSSProperties
              }
            >
              <button
                type="button"
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                aria-disabled={action.disabled || undefined}
                disabled={action.disabled}
                className="nova-fab-menu__action"
                onClick={() => {
                  if (action.disabled) return;
                  onSelect?.(action.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span className="nova-fab-menu__icon" aria-hidden="true">
                  {action.icon}
                </span>
                <span
                  className={cn(
                    "nova-fab-menu__caption",
                    captionLeft && "nova-fab-menu__caption--left",
                  )}
                >
                  {action.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        ref={triggerRef}
        type="button"
        className="nova-fab-menu__trigger"
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen(!isOpen)}
      >
        <span className="nova-fab-menu__plus" aria-hidden="true" />
      </button>
    </div>
  );
});
