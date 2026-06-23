import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./GradientPicker.css";

export type GradientPickerSize = "sm" | "md" | "lg";

export interface GradientStop {
  /** Stable id for React keys / reordering. */
  id: string;
  /** CSS color of the stop. */
  color: string;
  /** Position along the gradient, 0–100. */
  position: number;
}

export interface GradientPickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled stops. */
  value?: GradientStop[];
  /** Uncontrolled initial stops. */
  defaultValue?: GradientStop[];
  /** Controlled angle in degrees (0–360). */
  angle?: number;
  /** Uncontrolled initial angle. Defaults to `90`. */
  defaultAngle?: number;
  /**
   * Called with the full CSS gradient string and structured parts whenever
   * the gradient changes.
   */
  onChange?: (
    css: string,
    parts: { stops: GradientStop[]; angle: number }
  ) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: GradientPickerSize;
  /** Disable interaction. */
  disabled?: boolean;
}

let uidCounter = 0;
function newId(): string {
  uidCounter += 1;
  return `gs-${uidCounter}`;
}

const DEFAULT_STOPS: GradientStop[] = [
  { id: "gs-a", color: "#6366f1", position: 0 },
  { id: "gs-b", color: "#ec4899", position: 100 },
];

function toCss(stops: GradientStop[], angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const parts = sorted
    .map((s) => `${s.color} ${Math.round(s.position)}%`)
    .join(", ");
  return `linear-gradient(${Math.round(angle)}deg, ${parts})`;
}

export const GradientPicker = forwardRef<HTMLDivElement, GradientPickerProps>(
  function GradientPicker(
    {
      value,
      defaultValue,
      angle,
      defaultAngle = 90,
      onChange,
      size = "md",
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const stopsControlled = value !== undefined;
    const angleControlled = angle !== undefined;
    const [internalStops, setInternalStops] = useState<GradientStop[]>(
      () => defaultValue ?? DEFAULT_STOPS
    );
    const [internalAngle, setInternalAngle] = useState(defaultAngle);

    const stops = stopsControlled ? (value as GradientStop[]) : internalStops;
    const currentAngle = angleControlled ? (angle as number) : internalAngle;

    const [activeId, setActiveId] = useState<string | null>(
      stops[0]?.id ?? null
    );

    const barRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<string | null>(null);
    const dialDragRef = useRef(false);

    const emit = useCallback(
      (nextStops: GradientStop[], nextAngle: number) => {
        onChange?.(toCss(nextStops, nextAngle), {
          stops: nextStops,
          angle: nextAngle,
        });
      },
      [onChange]
    );

    const setStops = useCallback(
      (next: GradientStop[]) => {
        if (!stopsControlled) setInternalStops(next);
        emit(next, currentAngle);
      },
      [stopsControlled, emit, currentAngle]
    );

    const setAngle = useCallback(
      (next: number) => {
        const normalized = ((Math.round(next) % 360) + 360) % 360;
        if (!angleControlled) setInternalAngle(normalized);
        emit(stops, normalized);
      },
      [angleControlled, emit, stops]
    );

    // latest refs for global pointer handlers
    const stopsRef = useRef(stops);
    stopsRef.current = stops;
    const angleRef = useRef(currentAngle);
    angleRef.current = currentAngle;

    useEffect(() => {
      if (typeof window === "undefined") return;
      const handleMove = (e: PointerEvent) => {
        if (draggingRef.current) {
          const bar = barRef.current;
          if (!bar) return;
          const rect = bar.getBoundingClientRect();
          const pos = Math.max(
            0,
            Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
          );
          const id = draggingRef.current;
          const next = stopsRef.current.map((s) =>
            s.id === id ? { ...s, position: pos } : s
          );
          if (!stopsControlled) setInternalStops(next);
          emit(next, angleRef.current);
        } else if (dialDragRef.current) {
          const dial = dialElRef.current;
          if (!dial) return;
          const rect = dial.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const deg =
            (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
          setAngle(deg);
        }
      };
      const handleUp = () => {
        draggingRef.current = null;
        dialDragRef.current = false;
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
    }, [emit, setAngle, stopsControlled]);

    const dialElRef = useRef<HTMLDivElement | null>(null);

    const addStop = (e: React.MouseEvent) => {
      if (disabled) return;
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pos = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      // Interpolate a starting color from neighbours.
      const sorted = [...stops].sort((a, b) => a.position - b.position);
      const right = sorted.find((s) => s.position >= pos);
      const color = right?.color ?? sorted[sorted.length - 1]?.color ?? "#888888";
      const stop: GradientStop = { id: newId(), color, position: pos };
      setStops([...stops, stop]);
      setActiveId(stop.id);
    };

    const removeStop = (id: string) => {
      if (disabled || stops.length <= 2) return;
      const next = stops.filter((s) => s.id !== id);
      setStops(next);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
    };

    const recolor = (id: string, color: string) => {
      setStops(stops.map((s) => (s.id === id ? { ...s, color } : s)));
    };

    const startStopDrag = (id: string) => {
      if (disabled) return;
      draggingRef.current = id;
      setActiveId(id);
    };

    const cssString = toCss(stops, currentAngle);
    const dialAngleRad = ((currentAngle - 90) * Math.PI) / 180;
    const knobX = 50 + Math.cos(dialAngleRad) * 38;
    const knobY = 50 + Math.sin(dialAngleRad) * 38;
    const active = stops.find((s) => s.id === activeId) ?? null;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-gradientpicker",
          `nova-gradientpicker--${size}`,
          disabled && "nova-gradientpicker--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <div
          className="nova-gradientpicker__preview"
          style={{ background: cssString }}
          aria-hidden="true"
        />

        <div className="nova-gradientpicker__row">
          {/* Angle dial */}
          <div
            ref={dialElRef}
            className="nova-gradientpicker__dial nova-focusable"
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label="Gradient angle"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(currentAngle)}
            aria-valuetext={`${Math.round(currentAngle)} degrees`}
            aria-disabled={disabled || undefined}
            onPointerDown={() => {
              if (!disabled) dialDragRef.current = true;
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                setAngle(currentAngle + 5);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                setAngle(currentAngle - 5);
              }
            }}
          >
            <span
              className="nova-gradientpicker__dial-knob"
              style={{ left: `${knobX}%`, top: `${knobY}%` }}
              aria-hidden="true"
            />
            <span className="nova-gradientpicker__dial-value">
              {Math.round(currentAngle)}°
            </span>
          </div>

          {/* Stops bar */}
          <div className="nova-gradientpicker__bar-wrap">
            <div
              ref={barRef}
              className="nova-gradientpicker__bar"
              style={{ background: toCss(stops, 90) }}
              onPointerDown={(e) => {
                // Only add a stop if clicking the bar itself, not a handle.
                if (e.target === e.currentTarget) addStop(e);
              }}
            >
              {stops.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={cn(
                    "nova-gradientpicker__handle nova-focusable",
                    s.id === activeId && "nova-gradientpicker__handle--active"
                  )}
                  style={{ left: `${s.position}%`, ["--nova-gp-stop" as string]: s.color }}
                  aria-label={`Stop at ${Math.round(s.position)} percent`}
                  aria-pressed={s.id === activeId}
                  onPointerDown={() => startStopDrag(s.id)}
                  onClick={() => setActiveId(s.id)}
                  onDoubleClick={() => removeStop(s.id)}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      setStops(
                        stops.map((x) =>
                          x.id === s.id
                            ? { ...x, position: Math.min(100, x.position + 2) }
                            : x
                        )
                      );
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      setStops(
                        stops.map((x) =>
                          x.id === s.id
                            ? { ...x, position: Math.max(0, x.position - 2) }
                            : x
                        )
                      );
                    } else if (e.key === "Delete" || e.key === "Backspace") {
                      e.preventDefault();
                      removeStop(s.id);
                    }
                  }}
                />
              ))}
            </div>
            <p className="nova-gradientpicker__hint">
              Click the bar to add a stop · drag to move · double-click to remove
            </p>
          </div>
        </div>

        {/* Active stop editor */}
        {active && (
          <div className="nova-gradientpicker__editor">
            <label className="nova-gradientpicker__swatch">
              <span
                className="nova-gradientpicker__swatch-fill"
                style={{ background: active.color }}
                aria-hidden="true"
              />
              <input
                type="color"
                className="nova-gradientpicker__color-input"
                value={/^#[0-9a-f]{6}$/i.test(active.color) ? active.color : "#888888"}
                disabled={disabled}
                aria-label="Stop color"
                onChange={(e) => recolor(active.id, e.target.value)}
              />
            </label>
            <span className="nova-gradientpicker__editor-meta">
              {active.color} · {Math.round(active.position)}%
            </span>
            <button
              type="button"
              className="nova-gradientpicker__remove nova-focusable"
              disabled={disabled || stops.length <= 2}
              onClick={() => removeStop(active.id)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  }
);
