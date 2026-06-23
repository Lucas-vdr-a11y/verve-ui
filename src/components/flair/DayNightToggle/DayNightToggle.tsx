import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DayNightToggle.css";

export interface DayNightToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled night state (`true` = night/moon). Omit for uncontrolled. */
  night?: boolean;
  /** Initial night state when uncontrolled. Defaults `false`. */
  defaultNight?: boolean;
  /** Called with the next night state on toggle. */
  onChange?: (night: boolean) => void;
}

const STARS = [
  { x: 18, y: 30 },
  { x: 34, y: 18 },
  { x: 30, y: 44 },
  { x: 48, y: 32 },
];

/**
 * A delightful day↔night theme-style toggle: a sun slides across and morphs into
 * a moon while clouds slide out and stars fade in. Purely visual/decorative — it
 * reports its state through `onChange` but does not drive the real theme.
 * Controlled via `night` or uncontrolled via `defaultNight`.
 *
 * Real `<button>` with `aria-pressed`. Transitions collapse to instant under
 * reduced motion (handled in CSS).
 */
export const DayNightToggle = forwardRef<
  HTMLButtonElement,
  DayNightToggleProps
>(function DayNightToggle(
  {
    night: nightProp,
    defaultNight = false,
    onChange,
    className,
    onClick,
    type,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const isControlled = nightProp !== undefined;
  const [internalNight, setInternalNight] = useState(defaultNight);
  const night = isControlled ? nightProp : internalNight;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const next = !night;
      if (!isControlled) setInternalNight(next);
      onChange?.(next);
    },
    [isControlled, night, onChange, onClick]
  );

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn("nova-daynight", night && "nova-daynight--night", className)}
      onClick={handleClick}
      aria-pressed={night}
      aria-label={ariaLabel ?? (night ? "Switch to day" : "Switch to night")}
      {...rest}
    >
      <span className="nova-daynight__sky" aria-hidden="true">
        <span className="nova-daynight__stars">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="nova-daynight__star"
              style={
                {
                  "--nova-dn-sx": `${s.x}px`,
                  "--nova-dn-sy": `${s.y}px`,
                  "--nova-dn-i": String(i),
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        <span className="nova-daynight__clouds">
          <span className="nova-daynight__cloud nova-daynight__cloud--a" />
          <span className="nova-daynight__cloud nova-daynight__cloud--b" />
        </span>
        <span className="nova-daynight__orb">
          <span className="nova-daynight__crater nova-daynight__crater--1" />
          <span className="nova-daynight__crater nova-daynight__crater--2" />
          <span className="nova-daynight__crater nova-daynight__crater--3" />
        </span>
      </span>
    </button>
  );
});
