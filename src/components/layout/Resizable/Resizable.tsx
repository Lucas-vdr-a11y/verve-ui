import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Resizable.css";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface ResizableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onResize"> {
  /** Lay panes out side-by-side or stacked. @default "horizontal" */
  direction?: "horizontal" | "vertical";
  /** Size of the first pane as a fraction `0..1` (controlled). */
  ratio?: number;
  /** Initial first-pane fraction when uncontrolled. @default 0.5 */
  defaultRatio?: number;
  /** Minimum first-pane fraction `0..1`. @default 0.1 */
  min?: number;
  /** Maximum first-pane fraction `0..1`. @default 0.9 */
  max?: number;
  /** Keyboard step per arrow press, as a fraction. @default 0.02 */
  step?: number;
  /** Called with the new fraction during/after a resize. */
  onResize?: (ratio: number) => void;
  /** Accessible label for the divider. @default "Resize panes" */
  handleLabel?: string;
  /** First pane content. */
  start: React.ReactNode;
  /** Second pane content. */
  end: React.ReactNode;
  /** Disable resizing (panes stay fixed). @default false */
  disabled?: boolean;
}

/**
 * Resizable — two panes split by a draggable divider. Drag with a pointer or
 * nudge with arrow keys on the handle. Honours `min`/`max` bounds and reports
 * changes via `onResize`. SSR-safe; pointer listeners live in effects and are
 * cleaned up.
 */
export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(
  function Resizable(
    {
      direction = "horizontal",
      ratio,
      defaultRatio = 0.5,
      min = 0.1,
      max = 0.9,
      step = 0.02,
      onResize,
      handleLabel = "Resize panes",
      start,
      end,
      disabled = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isControlled = ratio !== undefined;
    const [uncontrolled, setUncontrolled] = useState(
      clamp(defaultRatio, min, max),
    );
    const current = clamp(isControlled ? ratio : uncontrolled, min, max);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const draggingRef = useRef(false);

    const setRatio = useCallback(
      (next: number) => {
        const clamped = clamp(next, min, max);
        if (!isControlled) setUncontrolled(clamped);
        onResize?.(clamped);
      },
      [isControlled, min, max, onResize],
    );

    const computeFromPointer = useCallback(
      (clientX: number, clientY: number) => {
        const root = rootRef.current;
        if (!root) return;
        const rect = root.getBoundingClientRect();
        const frac =
          direction === "horizontal"
            ? (clientX - rect.left) / rect.width
            : (clientY - rect.top) / rect.height;
        if (Number.isFinite(frac)) setRatio(frac);
      },
      [direction, setRatio],
    );

    // Global pointer listeners during a drag, SSR-safe + cleaned up.
    useEffect(() => {
      if (!dragging) return;
      if (typeof window === "undefined") return;

      const handleMove = (event: PointerEvent) => {
        event.preventDefault();
        computeFromPointer(event.clientX, event.clientY);
      };
      const stop = () => {
        draggingRef.current = false;
        setDragging(false);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
      };
    }, [dragging, computeFromPointer]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const decKeys =
        direction === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];
      const incKeys =
        direction === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];

      if (decKeys.includes(event.key)) {
        event.preventDefault();
        setRatio(current - step);
      } else if (incKeys.includes(event.key)) {
        event.preventDefault();
        setRatio(current + step);
      } else if (event.key === "Home") {
        event.preventDefault();
        setRatio(min);
      } else if (event.key === "End") {
        event.preventDefault();
        setRatio(max);
      }
    };

    const percent = Math.round(current * 100);

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "nova-resizable",
          `nova-resizable--${direction}`,
          dragging && "nova-resizable--dragging",
          disabled && "nova-resizable--disabled",
          className,
        )}
        data-dragging={dragging || undefined}
        style={
          {
            "--nova-resizable-start": current,
            "--nova-resizable-end": 1 - current,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-resizable__pane nova-resizable__pane--start">
          {start}
        </div>
        <div
          role="separator"
          aria-orientation={
            direction === "horizontal" ? "vertical" : "horizontal"
          }
          aria-label={handleLabel}
          aria-valuenow={percent}
          aria-valuemin={Math.round(min * 100)}
          aria-valuemax={Math.round(max * 100)}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          className={cn("nova-resizable__handle", "nova-focusable")}
          onPointerDown={(event) => {
            if (disabled) return;
            event.preventDefault();
            (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
            draggingRef.current = true;
            setDragging(true);
          }}
          onKeyDown={handleKeyDown}
        >
          <span className="nova-resizable__grip" aria-hidden="true" />
        </div>
        <div className="nova-resizable__pane nova-resizable__pane--end">
          {end}
        </div>
      </div>
    );
  },
);
