import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./PowerButton.css";

export interface PowerButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled on state. Omit for uncontrolled. */
  on?: boolean;
  /** Initial on state when uncontrolled. Defaults `false`. */
  defaultOn?: boolean;
  /** Called with the next on state on toggle. */
  onChange?: (on: boolean) => void;
}

/**
 * An IoT-style power button: a power glyph inside a ring that lights up and
 * glows when on, with a subtle press depress. Controlled via `on` or
 * uncontrolled via `defaultOn`.
 *
 * Real `<button>` with `aria-pressed`. The glow/transition is instant under
 * reduced motion (handled in CSS).
 */
export const PowerButton = forwardRef<HTMLButtonElement, PowerButtonProps>(
  function PowerButton(
    {
      on: onProp,
      defaultOn = false,
      onChange,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const isControlled = onProp !== undefined;
    const [internal, setInternal] = useState(defaultOn);
    const on = isControlled ? onProp : internal;

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !on;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, on, onChange, onClick]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-power", on && "nova-power--on", className)}
        onClick={handleClick}
        aria-pressed={on}
        aria-label={ariaLabel ?? (on ? "Power off" : "Power on")}
        {...rest}
      >
        <span className="nova-power__ring" aria-hidden="true" />
        <svg className="nova-power__icon" viewBox="0 0 24 24" aria-hidden="true">
          <line
            className="nova-power__stem"
            x1="12"
            y1="3"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            className="nova-power__arc"
            d="M7 6.3a8 8 0 1 0 10 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    );
  }
);
