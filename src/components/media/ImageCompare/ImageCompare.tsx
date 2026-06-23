import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./ImageCompare.css";

export interface ImageCompareProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** "Before" image URL (shown on the left / start side). */
  beforeSrc: string;
  /** "After" image URL (shown on the right / end side). */
  afterSrc: string;
  /** Alt text for the before image. */
  beforeAlt?: string;
  /** Alt text for the after image. */
  afterAlt?: string;
  /** Optional caption shown over the before image. */
  beforeLabel?: string;
  /** Optional caption shown over the after image. */
  afterLabel?: string;
  /** Initial divider position as a percent (0–100). Defaults to `50`. */
  defaultPosition?: number;
  /** Controlled divider position as a percent (0–100). */
  position?: number;
  /** Fired with the new percent whenever the divider moves. */
  onChange?: (position: number) => void;
  /** Optional aspect ratio (e.g. `16 / 9`) for the frame. */
  aspectRatio?: number;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Before/after image slider with a draggable divider. Operable by pointer
 * (drag anywhere on the frame) and keyboard (arrows move the divider). SSR-safe:
 * geometry reads happen only inside event handlers.
 */
export const ImageCompare = forwardRef<HTMLDivElement, ImageCompareProps>(
  function ImageCompare(
    {
      beforeSrc,
      afterSrc,
      beforeAlt = "",
      afterAlt = "",
      beforeLabel,
      afterLabel,
      defaultPosition = 50,
      position: controlledPosition,
      onChange,
      aspectRatio,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    const isControlled = controlledPosition != null;
    const [internal, setInternal] = useState(clamp(defaultPosition));
    const pos = isControlled ? clamp(controlledPosition) : internal;

    const [dragging, setDragging] = useState(false);

    const updateFromClientX = useCallback(
      (clientX: number) => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        const next = clamp(((clientX - rect.left) / rect.width) * 100);
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    // Pointer drag — listeners live on window so the drag survives leaving the
    // frame, and are cleaned up when the gesture ends or the component unmounts.
    useEffect(() => {
      if (!dragging) return;
      const onMove = (e: PointerEvent) => updateFromClientX(e.clientX);
      const onUp = () => setDragging(false);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    }, [dragging, updateFromClientX]);

    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(true);
      updateFromClientX(e.clientX);
    }

    const move = useCallback(
      (delta: number) => {
        const next = clamp(pos + delta);
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [pos, isControlled, onChange]
    );

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          move(-2);
          break;
        case "ArrowRight":
          e.preventDefault();
          move(2);
          break;
        case "Home":
          e.preventDefault();
          if (!isControlled) setInternal(0);
          onChange?.(0);
          break;
        case "End":
          e.preventDefault();
          if (!isControlled) setInternal(100);
          onChange?.(100);
          break;
        default:
          break;
      }
    }

    const frameStyle: React.CSSProperties = {
      ...(aspectRatio != null
        ? { ["--nova-image-compare-ratio" as string]: String(aspectRatio) }
        : null),
      ...style,
    };

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-image-compare",
          aspectRatio != null && "nova-image-compare--ratio",
          dragging && "nova-image-compare--dragging",
          className
        )}
        style={frameStyle}
        onPointerDown={handlePointerDown}
        {...rest}
      >
        {/* After fills the frame; before is clipped to the divider position. */}
        <img
          className="nova-image-compare__img"
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
        />
        {afterLabel && (
          <span className="nova-image-compare__label nova-image-compare__label--after">
            {afterLabel}
          </span>
        )}

        <div
          className="nova-image-compare__before"
          style={{ ["--nova-image-compare-pos" as string]: `${pos}%` }}
          aria-hidden="true"
        >
          <img
            className="nova-image-compare__img"
            src={beforeSrc}
            alt={beforeAlt}
            draggable={false}
          />
          {beforeLabel && (
            <span className="nova-image-compare__label nova-image-compare__label--before">
              {beforeLabel}
            </span>
          )}
        </div>

        <div
          className="nova-image-compare__divider"
          style={{ ["--nova-image-compare-pos" as string]: `${pos}%` }}
        >
          <span
            className="nova-image-compare__handle"
            role="slider"
            tabIndex={0}
            aria-label="Compare before and after"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}%`}
            onKeyDown={handleKeyDown}
          >
            <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
              <path
                d="M9 7l-4 5 4 5M15 7l4 5-4 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    );
  }
);
