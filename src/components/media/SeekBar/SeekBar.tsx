import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./SeekBar.css";

export interface SeekBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSeek" | "onChange"> {
  /** Current playback position, in seconds. */
  current: number;
  /** Total media duration, in seconds. */
  duration: number;
  /** Buffered position, in seconds (renders a secondary range). */
  buffered?: number;
  /** Fired with the new position (seconds) on click / drag / keyboard. */
  onSeek?: (seconds: number) => void;
  /** Step (seconds) for arrow-key seeking. Defaults to `5`. */
  step?: number;
  /** Show a time tooltip while hovering / scrubbing. Defaults to `true`. */
  showTooltip?: boolean;
  /** Accessible label. Defaults to `"Seek"`. */
  label?: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Format seconds as `m:ss` or `h:mm:ss`. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/**
 * Reusable media scrubber. Click or drag the track to seek; arrow keys seek by
 * `step`. Optional buffered range and a time tooltip. role=slider, fully
 * keyboard operable. SSR-safe — geometry is read only inside handlers.
 */
export const SeekBar = forwardRef<HTMLDivElement, SeekBarProps>(function SeekBar(
  {
    current,
    duration,
    buffered,
    onSeek,
    step = 5,
    showTooltip = true,
    label = "Seek",
    className,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [dragging, setDragging] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);

  const safeDuration = duration > 0 && Number.isFinite(duration) ? duration : 0;
  const cur = clamp(current, 0, safeDuration);
  const progress = safeDuration > 0 ? cur / safeDuration : 0;
  const bufferedPct =
    safeDuration > 0 && buffered != null
      ? clamp(buffered / safeDuration, 0, 1)
      : 0;

  const secondsFromClientX = useCallback(
    (clientX: number): number | null => {
      const el = rootRef.current;
      if (!el || safeDuration === 0) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return null;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return ratio * safeDuration;
    },
    [safeDuration]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const secs = secondsFromClientX(e.clientX);
      if (secs != null) {
        setHoverPos(secs);
        onSeek?.(secs);
      }
    };
    const onUp = () => {
      setDragging(false);
      setHoverPos(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, secondsFromClientX, onSeek]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    const secs = secondsFromClientX(e.clientX);
    if (secs != null) {
      setHoverPos(secs);
      onSeek?.(secs);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragging) return;
    const secs = secondsFromClientX(e.clientX);
    if (secs != null) setHoverPos(secs);
  }

  function handlePointerLeave() {
    if (!dragging) setHoverPos(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (safeDuration === 0) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        onSeek?.(clamp(cur + step, 0, safeDuration));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        onSeek?.(clamp(cur - step, 0, safeDuration));
        break;
      case "Home":
        e.preventDefault();
        onSeek?.(0);
        break;
      case "End":
        e.preventDefault();
        onSeek?.(safeDuration);
        break;
      default:
        break;
    }
  }

  const tooltipSeconds = hoverPos != null ? hoverPos : cur;
  const tooltipRatio = safeDuration > 0 ? tooltipSeconds / safeDuration : 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "nova-seek-bar",
        dragging && "nova-seek-bar--dragging",
        className
      )}
      style={{
        ["--nova-seek-progress" as string]: `${progress * 100}%`,
        ["--nova-seek-buffered" as string]: `${bufferedPct * 100}%`,
        ["--nova-seek-hover" as string]: `${tooltipRatio * 100}%`,
      }}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeDuration)}
      aria-valuenow={Math.round(cur)}
      aria-valuetext={`${formatTime(cur)} of ${formatTime(safeDuration)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span className="nova-seek-bar__track" aria-hidden="true">
        {buffered != null && (
          <span className="nova-seek-bar__buffered" />
        )}
        <span className="nova-seek-bar__progress" />
      </span>
      <span className="nova-seek-bar__thumb" aria-hidden="true" />

      {showTooltip && (hoverPos != null || dragging) && (
        <span className="nova-seek-bar__tooltip" aria-hidden="true">
          {formatTime(tooltipSeconds)}
        </span>
      )}
    </div>
  );
});
