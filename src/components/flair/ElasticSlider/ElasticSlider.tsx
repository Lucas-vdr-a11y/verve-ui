import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ElasticSlider.css";

export interface ElasticSliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible label for the slider. */
  label?: string;
  onChange?: (value: number) => void;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * A slider that scales up while interacting and stretches/squishes elastically
 * when you drag past either end (the Family/elastic feel). Pointer drags are
 * tracked on the document; overshoot beyond the track edges is mapped to an
 * `--nova-es-overflow` variable that drives a non-uniform scale. Controlled or
 * uncontrolled.
 *
 * Accessible: `role="slider"` with aria value props, full keyboard support
 * (arrows / Home / End / PageUp-Down). Elastic squish is dropped under reduced
 * motion (functionality intact).
 */
export const ElasticSlider = forwardRef<HTMLDivElement, ElasticSliderProps>(
  function ElasticSlider(
    {
      value: controlled,
      defaultValue = 50,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      label = "Value",
      onChange,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const trackRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    const isControlled = controlled != null;
    const [internal, setInternal] = useState(() =>
      clamp(defaultValue, min, max)
    );
    const value = clamp(isControlled ? (controlled as number) : internal, min, max);

    const [dragging, setDragging] = useState(false);

    const commit = useCallback(
      (next: number) => {
        const snapped =
          Math.round((clamp(next, min, max) - min) / step) * step + min;
        const final = clamp(Number(snapped.toFixed(6)), min, max);
        if (!isControlled) setInternal(final);
        onChange?.(final);
      },
      [isControlled, max, min, onChange, step]
    );

    const setOverflow = useCallback((px: number) => {
      rootRef.current?.style.setProperty(
        "--nova-es-overflow",
        `${px.toFixed(2)}px`
      );
    }, []);

    const pointerToValue = useCallback(
      (clientX: number) => {
        const track = trackRef.current;
        if (!track) return value;
        const rect = track.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        if (!reduced) {
          if (ratio < 0) setOverflow(-(0 - ratio) * rect.width);
          else if (ratio > 1) setOverflow((ratio - 1) * rect.width);
          else setOverflow(0);
        }
        return min + clamp(ratio, 0, 1) * (max - min);
      },
      [max, min, reduced, setOverflow, value]
    );

    const handlePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        rootRef.current?.focus();
        setDragging(true);
        commit(pointerToValue(event.clientX));
      },
      [commit, disabled, pointerToValue]
    );

    useEffect(() => {
      if (!dragging) return;
      const onMove = (e: PointerEvent) => commit(pointerToValue(e.clientX));
      const onUp = () => {
        setDragging(false);
        setOverflow(0);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
    }, [dragging, commit, pointerToValue, setOverflow]);

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const big = Math.max(step, (max - min) / 10);
        let next: number | null = null;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            next = value + step;
            break;
          case "ArrowLeft":
          case "ArrowDown":
            next = value - step;
            break;
          case "PageUp":
            next = value + big;
            break;
          case "PageDown":
            next = value - big;
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
        event.preventDefault();
        commit(next);
      },
      [commit, disabled, max, min, step, value]
    );

    const pct = ((value - min) / (max - min || 1)) * 100;

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-elastic-slider",
          dragging && "nova-elastic-slider--dragging",
          disabled && "nova-elastic-slider--disabled",
          className
        )}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled || undefined}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        style={
          {
            "--nova-es-pct": `${pct}%`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div ref={trackRef} className="nova-elastic-slider__track">
          <div className="nova-elastic-slider__fill" />
          <div className="nova-elastic-slider__thumb" />
        </div>
      </div>
    );
  }
);
