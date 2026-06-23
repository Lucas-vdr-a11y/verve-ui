import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./SliderMarks.css";

export type SliderMarksSize = "sm" | "md" | "lg";

export interface SliderMark {
  /** The numeric value this mark sits at. */
  value: number;
  /** Optional label rendered beneath the tick. */
  label?: React.ReactNode;
}

export interface SliderMarksProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Labeled tick marks. */
  marks: SliderMark[];
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Defaults to the first mark / `min`. */
  defaultValue?: number;
  /** Called with the numeric value on change. */
  onChange?: (value: number) => void;
  /** Minimum value. Defaults to the smallest mark. */
  min?: number;
  /** Maximum value. Defaults to the largest mark. */
  max?: number;
  /** Step for free movement between marks. Defaults to `1`. */
  step?: number;
  /**
   * Snap the thumb to the nearest mark on release. Defaults to `true`. When
   * `false`, marks are decorative and movement is continuous.
   */
  snap?: boolean;
  /** Show a value tooltip while interacting. Defaults to `true`. */
  tooltip?: boolean;
  /** Format the tooltip / aria value text. */
  formatValue?: (value: number) => string;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SliderMarksSize;
  /** Marks the control as invalid. */
  invalid?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Accessible label. */
  "aria-label"?: string;
}

export const SliderMarks = forwardRef<HTMLDivElement, SliderMarksProps>(
  function SliderMarks(
    {
      marks,
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      snap = true,
      tooltip = true,
      formatValue,
      size = "md",
      invalid = false,
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const markValues = marks.map((m) => m.value);
    const lo = min ?? Math.min(...markValues);
    const hi = max ?? Math.max(...markValues);

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number>(
      defaultValue ?? markValues[0] ?? lo
    );
    const current = isControlled ? (value as number) : internal;

    const [interacting, setInteracting] = useState(false);
    const draggingRef = useRef(false);

    const snapToMark = useCallback(
      (v: number) => {
        if (!snap || markValues.length === 0) return v;
        let best = markValues[0];
        let bestDist = Math.abs(v - best);
        for (const mv of markValues) {
          const d = Math.abs(v - mv);
          if (d < bestDist) {
            best = mv;
            bestDist = d;
          }
        }
        return best;
      },
      [snap, markValues]
    );

    const commit = useCallback(
      (v: number, doSnap: boolean) => {
        const clamped = Math.max(lo, Math.min(hi, v));
        const next = doSnap ? snapToMark(clamped) : clamped;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [lo, hi, snapToMark, isControlled, onChange]
    );

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      // While dragging, move freely; snap only on release.
      commit(Number(e.target.value), false);
    };

    const release = () => {
      draggingRef.current = false;
      setInteracting(false);
      if (snap) commit(current, true);
    };

    const range = hi - lo;
    const percent =
      range > 0 ? Math.min(100, Math.max(0, ((current - lo) / range) * 100)) : 0;

    const display = formatValue ? formatValue(current) : String(current);
    const showTooltip = tooltip && interacting && !disabled;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-slidermarks",
          `nova-slidermarks--${size}`,
          invalid && "nova-slidermarks--invalid",
          disabled && "nova-slidermarks--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        style={{ ["--nova-slidermarks-fill" as string]: `${percent}%` }}
        {...rest}
      >
        <div className="nova-slidermarks__rail-wrap">
          <span className="nova-slidermarks__track" aria-hidden="true">
            <span className="nova-slidermarks__fill" />
          </span>

          {/* Tick marks */}
          {marks.map((m) => {
            const p =
              range > 0 ? ((m.value - lo) / range) * 100 : 0;
            const passed = m.value <= current;
            return (
              <span
                key={m.value}
                className={cn(
                  "nova-slidermarks__tick",
                  passed && "nova-slidermarks__tick--passed"
                )}
                style={{ left: `${p}%` }}
                aria-hidden="true"
              />
            );
          })}

          <span
            className="nova-slidermarks__thumb-wrap"
            aria-hidden="true"
            style={{ left: `${percent}%` }}
          >
            <span className="nova-slidermarks__thumb" />
            {showTooltip && (
              <span className="nova-slidermarks__tooltip">{display}</span>
            )}
          </span>

          <input
            type="range"
            className="nova-slidermarks__input nova-focusable"
            min={lo}
            max={hi}
            step={step}
            value={current}
            disabled={disabled}
            role="slider"
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            aria-valuemin={lo}
            aria-valuemax={hi}
            aria-valuenow={current}
            aria-valuetext={display}
            onChange={handleInput}
            onPointerDown={() => {
              draggingRef.current = true;
              setInteracting(true);
            }}
            onPointerUp={release}
            onKeyUp={() => snap && commit(current, true)}
            onFocus={() => setInteracting(true)}
            onBlur={() => {
              if (!draggingRef.current) {
                setInteracting(false);
                if (snap) commit(current, true);
              }
            }}
          />
        </div>

        {/* Mark labels */}
        {marks.some((m) => m.label != null) && (
          <div className="nova-slidermarks__labels" aria-hidden="true">
            {marks.map((m) => {
              const p = range > 0 ? ((m.value - lo) / range) * 100 : 0;
              if (m.label == null) return null;
              return (
                <button
                  key={m.value}
                  type="button"
                  className={cn(
                    "nova-slidermarks__label",
                    m.value === current && "nova-slidermarks__label--active"
                  )}
                  style={{ left: `${p}%` }}
                  tabIndex={-1}
                  disabled={disabled}
                  onClick={() => !disabled && commit(m.value, false)}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
