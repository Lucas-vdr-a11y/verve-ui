import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./VolumeControl.css";

export type VolumeControlSize = "sm" | "md" | "lg";
export type VolumeControlOrientation = "horizontal" | "vertical";

export interface VolumeControlProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Current volume, 0–1. Defaults to `1`. */
  value?: number;
  /** Fired with the new volume (0–1) on slide / keyboard. */
  onChange?: (value: number) => void;
  /** Whether audio is muted. */
  muted?: boolean;
  /** Fired when the mute toggle is activated. */
  onMuteToggle?: () => void;
  /** Slider orientation. Defaults to `"horizontal"`. */
  orientation?: VolumeControlOrientation;
  /** Control size. Defaults to `"md"`. */
  size?: VolumeControlSize;
  /** Step used for keyboard / wheel adjustments (0–1). Defaults to `0.05`. */
  step?: number;
  /** Accessible label for the slider. Defaults to `"Volume"`. */
  label?: string;
}

function clamp01(v: number): number {
  return Math.min(Math.max(v, 0), 1);
}

const VolumeHighIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      d="M4 9v6h4l5 5V4L8 9H4z"
      fill="currentColor"
    />
    <path
      d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8 8 0 0 1 0 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
    <path
      d="M16 9l5 6M21 9l-5 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Reusable volume control: a mute toggle plus a slider (0–1). The building
 * block for media players. Pointer-draggable and keyboard accessible
 * (role=slider). SSR-safe — geometry is read only inside handlers.
 */
export const VolumeControl = forwardRef<HTMLDivElement, VolumeControlProps>(
  function VolumeControl(
    {
      value = 1,
      onChange,
      muted = false,
      onMuteToggle,
      orientation = "horizontal",
      size = "md",
      step = 0.05,
      label = "Volume",
      className,
      ...rest
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
    const trackRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const vol = clamp01(value);
    // Effective fill: a muted control reads as 0.
    const fill = muted ? 0 : vol;

    const updateFromPoint = useCallback(
      (clientX: number, clientY: number) => {
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        let next: number;
        if (orientation === "vertical") {
          if (rect.height === 0) return;
          next = clamp01((rect.bottom - clientY) / rect.height);
        } else {
          if (rect.width === 0) return;
          next = clamp01((clientX - rect.left) / rect.width);
        }
        onChange?.(next);
      },
      [orientation, onChange]
    );

    useEffect(() => {
      if (!dragging) return;
      const onMove = (e: PointerEvent) => updateFromPoint(e.clientX, e.clientY);
      const onUp = () => setDragging(false);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    }, [dragging, updateFromPoint]);

    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(true);
      updateFromPoint(e.clientX, e.clientY);
    }

    function nudge(delta: number) {
      onChange?.(clamp01(vol + delta));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          nudge(step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          nudge(-step);
          break;
        case "Home":
          e.preventDefault();
          onChange?.(0);
          break;
        case "End":
          e.preventDefault();
          onChange?.(1);
          break;
        default:
          break;
      }
    }

    const pct = Math.round(fill * 100);

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-volume-control",
          `nova-volume-control--${orientation}`,
          `nova-volume-control--${size}`,
          className
        )}
        {...rest}
      >
        <button
          type="button"
          className="nova-volume-control__mute"
          aria-pressed={muted}
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => onMuteToggle?.()}
        >
          {muted || fill === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
        </button>

        <div
          ref={trackRef}
          className={cn(
            "nova-volume-control__track",
            dragging && "nova-volume-control__track--dragging"
          )}
          style={{ ["--nova-volume-fill" as string]: `${pct}%` }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-orientation={orientation}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${pct}%`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
        >
          <span className="nova-volume-control__fill" aria-hidden="true" />
          <span className="nova-volume-control__thumb" aria-hidden="true" />
        </div>
      </div>
    );
  }
);
