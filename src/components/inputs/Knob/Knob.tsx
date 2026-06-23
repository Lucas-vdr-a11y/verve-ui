import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Knob.css";

export type KnobSize = "sm" | "md" | "lg";

export interface KnobProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value. */
  value?: number;
  /** Initial value for uncontrolled usage. Defaults to `min`. */
  defaultValue?: number;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Step increment. Defaults to `1`. */
  step?: number;
  /** Fired with the numeric value on change. */
  onChange?: (value: number) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: KnobSize;
  /** Accessible label for the knob. */
  label?: string;
  /** Show the numeric value beneath the dial. Defaults to `true`. */
  showValue?: boolean;
  /** Format the displayed / aria value. */
  formatValue?: (value: number) => string;
  /** Disables interaction. */
  disabled?: boolean;
}

/** Arc sweep, in degrees, from min to max (gap at the bottom). */
const ARC = 270;
const START = -135; // degrees from vertical (12 o'clock)

const SIZE_PX: Record<KnobSize, number> = { sm: 44, md: 64, lg: 88 };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snap(v: number, min: number, step: number) {
  const snapped = Math.round((v - min) / step) * step + min;
  return snapped;
}

export const Knob = forwardRef<HTMLDivElement, KnobProps>(function Knob(
  {
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    size = "md",
    label,
    showValue = true,
    formatValue,
    disabled = false,
    className,
    onKeyDown,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<number>(defaultValue ?? min);
  const current = clamp(isControlled ? (value as number) : internal, min, max);

  const dragStartRef = useRef<{ y: number; value: number } | null>(null);

  const commit = useCallback(
    (raw: number) => {
      const next = clamp(snap(raw, min, step), min, max);
      if (next === current) return;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [current, isControlled, max, min, onChange, step]
  );

  const range = max - min;
  const fraction = range > 0 ? (current - min) / range : 0;
  const angle = START + fraction * ARC;

  // Geometry for the SVG arc.
  const px = SIZE_PX[size];
  const r = px / 2 - 6;
  const cx = px / 2;
  const cy = px / 2;
  const polar = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const a0 = polar(START);
  const a1 = polar(angle);
  const aEnd = polar(START + ARC);
  const largeTrack = ARC > 180 ? 1 : 0;
  const largeFill = angle - START > 180 ? 1 : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { y: e.clientY, value: current };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || disabled) return;
    // Vertical drag: up increases. One full height ≈ full range.
    const dy = start.y - e.clientY;
    const perPixel = range / 150;
    commit(start.value + dy * perPixel);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (disabled) return;
    const big = step * 10;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = current + step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = current - step;
        break;
      case "PageUp":
        next = current + big;
        break;
      case "PageDown":
        next = current - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    commit(next);
  };

  const display = formatValue ? formatValue(current) : String(current);

  return (
    <div
      className={cn(
        "nova-knob",
        `nova-knob--${size}`,
        disabled && "nova-knob--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div
        ref={ref}
        className="nova-knob__dial nova-focusable"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={formatValue ? display : undefined}
        aria-disabled={disabled || undefined}
        style={{ width: px, height: px, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <svg
          className="nova-knob__svg"
          width={px}
          height={px}
          viewBox={`0 0 ${px} ${px}`}
          aria-hidden="true"
        >
          <path
            className="nova-knob__track"
            d={`M ${a0.x} ${a0.y} A ${r} ${r} 0 ${largeTrack} 1 ${aEnd.x} ${aEnd.y}`}
            fill="none"
          />
          <path
            className="nova-knob__fill"
            d={`M ${a0.x} ${a0.y} A ${r} ${r} 0 ${largeFill} 1 ${a1.x} ${a1.y}`}
            fill="none"
          />
          <line
            className="nova-knob__indicator"
            x1={cx}
            y1={cy}
            x2={a1.x}
            y2={a1.y}
          />
          <circle className="nova-knob__hub" cx={cx} cy={cy} r={r * 0.55} />
        </svg>
      </div>
      {label && <span className="nova-knob__label">{label}</span>}
      {showValue && <span className="nova-knob__value">{display}</span>}
    </div>
  );
});
