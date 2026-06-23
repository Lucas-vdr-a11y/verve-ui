import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ComboMeter.css";

export interface ComboMeterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current combo multiplier (e.g. 3 → "x3 COMBO"). */
  value: number;
  /** Multiplier at which the meter is considered full. Defaults to `10`. */
  max?: number;
  /**
   * Remaining time before the combo decays, 0–1. Drives the timer bar.
   * Defaults to `1`.
   */
  timeLeft?: number;
  /** Word shown after the multiplier. Defaults to `"COMBO"`. */
  label?: string;
}

export const ComboMeter = forwardRef<HTMLDivElement, ComboMeterProps>(
  function ComboMeter(
    { value, max = 10, timeLeft = 1, label = "COMBO", className, ...rest },
    ref
  ) {
    const pct = Math.min(Math.max(value / Math.max(max, 1), 0), 1) * 100;
    const time = Math.min(Math.max(timeLeft, 0), 1) * 100;
    const active = value > 1;

    const [flash, setFlash] = useState(false);
    const prev = useRef(value);
    useEffect(() => {
      if (value === prev.current) return;
      const up = value > prev.current;
      prev.current = value;
      if (!up) return;
      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 400);
      return () => window.clearTimeout(id);
    }, [value]);

    // Heat tier widens the gradient as the combo climbs.
    const tier = value >= max ? "max" : value >= max * 0.6 ? "hot" : "warm";

    return (
      <div
        ref={ref}
        className={cn(
          "nova-combo-meter",
          `nova-combo-meter--${tier}`,
          !active && "nova-combo-meter--idle",
          flash && "nova-combo-meter--flash",
          className
        )}
        role="status"
        aria-label={`Combo ${value} times${active ? ", active" : ""}`}
        {...rest}
      >
        <div className="nova-combo-meter__readout">
          <span className="nova-combo-meter__mult">x{value}</span>
          <span className="nova-combo-meter__label">{label}</span>
        </div>
        <div
          className="nova-combo-meter__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
        >
          <div className="nova-combo-meter__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="nova-combo-meter__timer" aria-hidden="true">
          <div
            className="nova-combo-meter__timer-bar"
            style={{ width: `${time}%` }}
          />
        </div>
      </div>
    );
  }
);
