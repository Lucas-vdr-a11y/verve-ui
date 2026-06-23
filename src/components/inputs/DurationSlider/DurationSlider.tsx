import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DurationSlider.css";

export type DurationSliderSize = "sm" | "md" | "lg";

export interface DurationSliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value, in minutes. */
  value?: number;
  /** Uncontrolled initial value, in minutes. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the new value in minutes. */
  onChange?: (minutes: number) => void;
  /** Minimum minutes. Defaults to `0`. */
  min?: number;
  /** Maximum minutes. Defaults to `480` (8h). */
  max?: number;
  /** Step in minutes. Defaults to `15`. */
  step?: number;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: DurationSliderSize;
  /** Show the formatted value bubble while interacting. Defaults to `true`. */
  tooltip?: boolean;
  /** Show the formatted value next to the slider. Defaults to `true`. */
  showValue?: boolean;
  /** Override the duration formatter. */
  formatDuration?: (minutes: number) => string;
  /** Marks the control as invalid. */
  invalid?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Accessible label. */
  "aria-label"?: string;
}

/** Format a minute count as `Xh Ym` (omitting empty parts). */
export function formatMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours === 0 && minutes === 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export const DurationSlider = forwardRef<HTMLDivElement, DurationSliderProps>(
  function DurationSlider(
    {
      value,
      defaultValue,
      onChange,
      min = 0,
      max = 480,
      step = 15,
      size = "md",
      tooltip = true,
      showValue = true,
      formatDuration = formatMinutes,
      invalid = false,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Duration",
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number>(defaultValue ?? min);
    const current = isControlled ? (value as number) : internal;

    const [interacting, setInteracting] = useState(false);
    const draggingRef = useRef(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = Number(e.target.value);
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const range = max - min;
    const percent =
      range > 0
        ? Math.min(100, Math.max(0, ((current - min) / range) * 100))
        : 0;

    const display = formatDuration(current);
    const showTooltip = tooltip && interacting && !disabled;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-durationslider",
          `nova-durationslider--${size}`,
          invalid && "nova-durationslider--invalid",
          disabled && "nova-durationslider--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        style={{ ["--nova-durationslider-fill" as string]: `${percent}%` }}
        {...rest}
      >
        <div className="nova-durationslider__control">
          <span className="nova-durationslider__track" aria-hidden="true">
            <span className="nova-durationslider__fill" />
          </span>
          <span
            className="nova-durationslider__thumb-wrap"
            aria-hidden="true"
            style={{ left: `${percent}%` }}
          >
            <span className="nova-durationslider__thumb" />
            {showTooltip && (
              <span className="nova-durationslider__tooltip">{display}</span>
            )}
          </span>
          <input
            type="range"
            className="nova-durationslider__input nova-focusable"
            min={min}
            max={max}
            step={step}
            value={current}
            disabled={disabled}
            role="slider"
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-valuetext={display}
            onChange={handleChange}
            onPointerDown={() => {
              draggingRef.current = true;
              setInteracting(true);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
              setInteracting(false);
            }}
            onFocus={() => setInteracting(true)}
            onBlur={() => {
              if (!draggingRef.current) setInteracting(false);
            }}
          />
        </div>

        {showValue && (
          <output className="nova-durationslider__value">{display}</output>
        )}
      </div>
    );
  }
);
