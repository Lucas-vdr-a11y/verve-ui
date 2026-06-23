import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./CheckboxMorph.css";

export interface CheckboxMorphProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled checked state. Omit for uncontrolled. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. Defaults `false`. */
  defaultChecked?: boolean;
  /** Called with the next checked state on toggle. */
  onChange?: (checked: boolean) => void;
  /** Number of spokes in the check burst. Defaults `8`. */
  burst?: number;
}

const BURST_MS = 600;

/**
 * A checkbox whose box springs and fills while a checkmark draws itself, with a
 * little radial burst on check. Burst spokes are DOM spans on even angles via
 * per-piece CSS vars, removed after the animation through a tracked timer
 * (cleared on unmount). Controlled via `checked` or uncontrolled via
 * `defaultChecked`.
 *
 * `role="checkbox"` with `aria-checked`. Space/Enter toggle. No spring/burst
 * under reduced motion.
 */
export const CheckboxMorph = forwardRef<HTMLButtonElement, CheckboxMorphProps>(
  function CheckboxMorph(
    {
      checked: checkedProp,
      defaultChecked = false,
      onChange,
      burst = 8,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = checkedProp !== undefined;
    const [internal, setInternal] = useState(defaultChecked);
    const checked = isControlled ? checkedProp : internal;

    const [bursts, setBursts] = useState<number[]>([]);
    const idRef = useRef(0);
    const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(
      () => () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
      },
      []
    );

    const n = Math.max(0, Math.min(12, burst));

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !checked;
        if (!isControlled) setInternal(next);
        onChange?.(next);

        if (next && !reduced && n > 0) {
          const id = idRef.current++;
          setBursts((prev) => [...prev, id]);
          const t = setTimeout(() => {
            setBursts((prev) => prev.filter((b) => b !== id));
            timers.current.delete(t);
          }, BURST_MS);
          timers.current.add(t);
        }
      },
      [checked, isControlled, n, onChange, onClick, reduced]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        role="checkbox"
        aria-checked={checked}
        aria-label={ariaLabel ?? "Checkbox"}
        className={cn("nova-checkmorph", checked && "nova-checkmorph--on", className)}
        onClick={handleClick}
        {...rest}
      >
        <span className="nova-checkmorph__box" aria-hidden="true">
          <svg className="nova-checkmorph__tick" viewBox="0 0 24 24">
            <path
              className="nova-checkmorph__tick-path"
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="nova-checkmorph__burst" aria-hidden="true">
          {bursts.map((id) =>
            Array.from({ length: n }, (_, i) => (
              <span
                key={`${id}-${i}`}
                className="nova-checkmorph__spoke"
                style={
                  {
                    "--nova-cm-angle": `${(i / n) * 360}deg`,
                  } as React.CSSProperties
                }
              />
            ))
          )}
        </span>
      </button>
    );
  }
);
