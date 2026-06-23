import { forwardRef, useCallback, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./LiquidToggle.css";

export interface LiquidToggleProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "value"
  > {
  /** Controlled checked state. Omit for uncontrolled. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. Defaults `false`. */
  defaultChecked?: boolean;
  /** Called with the next checked state on toggle. */
  onChange?: (checked: boolean) => void;
}

/**
 * A switch whose thumb is a gooey liquid blob: as it slides it stretches toward
 * its destination and snaps back, achieved with a leading "drip" element and an
 * SVG gooey filter (feGaussianBlur + feColorMatrix alpha threshold). The filter
 * id is unique per instance via useId, keeping it self-contained and SSR-safe.
 *
 * `role="switch"` with `aria-checked`. Space/Enter toggle. Reduced motion
 * removes the stretch (handled in CSS).
 */
export const LiquidToggle = forwardRef<HTMLButtonElement, LiquidToggleProps>(
  function LiquidToggle(
    {
      checked: checkedProp,
      defaultChecked = false,
      onChange,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const isControlled = checkedProp !== undefined;
    const [internal, setInternal] = useState(defaultChecked);
    const checked = isControlled ? checkedProp : internal;

    const rawId = useId().replace(/[:]/g, "");
    const filterId = `nova-liquid-${rawId}`;

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !checked;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [checked, isControlled, onChange, onClick]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? "Toggle"}
        className={cn(
          "nova-liquid",
          checked && "nova-liquid--on",
          className
        )}
        onClick={handleClick}
        {...rest}
      >
        <span
          className="nova-liquid__goo"
          style={{ filter: `url(#${filterId})` }}
          aria-hidden="true"
        >
          <span className="nova-liquid__thumb" />
          <span className="nova-liquid__drip" />
        </span>
        <svg
          className="nova-liquid__filter"
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id={filterId}>
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="4"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              />
            </filter>
          </defs>
        </svg>
      </button>
    );
  }
);
