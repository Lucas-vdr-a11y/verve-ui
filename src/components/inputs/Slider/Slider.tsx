import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Slider.css";

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SliderSize;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Step increment. Defaults to `1`. */
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Initial value for uncontrolled usage. Defaults to `min`. */
  defaultValue?: number;
  /** Fired with the numeric value on change. */
  onChange?: (value: number) => void;
  /** Show a tooltip bubble with the current value while dragging/focused. */
  tooltip?: boolean;
  /** Format the tooltip / aria value text. */
  formatValue?: (value: number) => string;
  /** Marks the control as invalid. */
  invalid?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    size = "md",
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onChange,
    tooltip = false,
    formatValue,
    invalid = false,
    disabled,
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<number>(
    defaultValue ?? min
  );
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
  const fraction = range > 0 ? (current - min) / range : 0;
  const percent = Math.min(100, Math.max(0, fraction * 100));

  const display = formatValue ? formatValue(current) : String(current);
  const showTooltip = tooltip && interacting && !disabled;

  return (
    <div
      className={cn(
        "nova-slider",
        `nova-slider--${size}`,
        invalid && "nova-slider--invalid",
        disabled && "nova-slider--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      style={{ ["--nova-slider-fill" as string]: `${percent}%` }}
    >
      <span className="nova-slider__track" aria-hidden="true">
        <span className="nova-slider__fill" />
      </span>
      <span
        className="nova-slider__thumb-wrap"
        aria-hidden="true"
        style={{ left: `${percent}%` }}
      >
        <span className="nova-slider__thumb" />
        {showTooltip && (
          <span className="nova-slider__tooltip" role="presentation">
            {display}
          </span>
        )}
      </span>
      <input
        ref={ref}
        type="range"
        className="nova-slider__input nova-focusable"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-valuetext={formatValue ? display : undefined}
        onChange={handleChange}
        onPointerDown={() => {
          draggingRef.current = true;
          setInteracting(true);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
          setInteracting(false);
        }}
        onFocus={(e) => {
          setInteracting(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!draggingRef.current) setInteracting(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </div>
  );
});
