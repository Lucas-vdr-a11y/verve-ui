import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./AnimatedHamburger.css";

export interface AnimatedHamburgerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  /** Open state (controlled). When set, the component is controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with the next open state on click. */
  onToggle?: (open: boolean) => void;
  /**
   * Morph style for the three lines.
   * - `spin`   — lines cross into an X, whole icon rotates.
   * - `squeeze`— middle line fades, outer lines pinch into an X.
   * - `arrow`  — lines collapse into a back-arrow chevron.
   * @default "squeeze"
   */
  morph?: "spin" | "squeeze" | "arrow";
  /** Size of the button. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Accessible label. @default "Menu" */
  label?: string;
}

/**
 * AnimatedHamburger — a hamburger ↔ X toggle button. The three bars morph into a
 * close icon with one of several styles. Fully controllable, sets
 * `aria-expanded`, and respects reduced motion (bars snap instead of animating).
 */
export const AnimatedHamburger = forwardRef<
  HTMLButtonElement,
  AnimatedHamburgerProps
>(function AnimatedHamburger(
  {
    open,
    defaultOpen = false,
    onToggle,
    morph = "squeeze",
    size = "md",
    label = "Menu",
    className,
    onClick,
    ...rest
  },
  ref,
) {
  const isControlled = open !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolled;
  const reduced = useReducedMotion();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next = !isOpen;
      if (!isControlled) setUncontrolled(next);
      onToggle?.(next);
      onClick?.(event);
    },
    [isOpen, isControlled, onToggle, onClick],
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      className={cn(
        "nova-hamburger",
        `nova-hamburger--${size}`,
        `nova-hamburger--${morph}`,
        isOpen && "nova-hamburger--open",
        reduced && "nova-hamburger--reduced",
        className,
      )}
      onClick={handleClick}
      {...rest}
    >
      <span className="nova-hamburger__box" aria-hidden="true">
        <span className="nova-hamburger__line nova-hamburger__line--top" />
        <span className="nova-hamburger__line nova-hamburger__line--mid" />
        <span className="nova-hamburger__line nova-hamburger__line--bottom" />
      </span>
    </button>
  );
});
