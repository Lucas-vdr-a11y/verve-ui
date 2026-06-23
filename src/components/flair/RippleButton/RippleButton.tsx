import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./RippleButton.css";

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Color of the ripple. Defaults to a translucent token tint. */
  rippleColor?: string;
  /** Ripple expand+fade duration (ms). Defaults `600`. */
  duration?: number;
  children?: React.ReactNode;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * A button that spawns a Material-style ripple expanding from the exact click
 * point and fading out. Each ripple is a DOM span sized to cover the button
 * from the click origin; it self-removes after the animation via a tracked
 * timeout, and any pending timers are cleared on unmount (no leaks).
 *
 * Real `<button>`. Under reduced motion no ripple is spawned.
 */
export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  function RippleButton(
    {
      rippleColor,
      duration = 600,
      className,
      children,
      onClick,
      style,
      type,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const idRef = useRef(0);
    const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(
      () => () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
      },
      []
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (reduced) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size =
          Math.max(
            Math.hypot(x, y),
            Math.hypot(rect.width - x, y),
            Math.hypot(x, rect.height - y),
            Math.hypot(rect.width - x, rect.height - y)
          ) * 2;
        const id = idRef.current++;
        setRipples((prev) => [...prev, { id, x, y, size }]);
        const t = setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
          timers.current.delete(t);
        }, duration);
        timers.current.add(t);
      },
      [duration, onClick, reduced]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-ripple", className)}
        onClick={handleClick}
        style={
          {
            "--nova-ripple-duration": `${duration}ms`,
            ...(rippleColor ? { "--nova-ripple-color": rippleColor } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-ripple__label">{children}</span>
        <span className="nova-ripple__layer" aria-hidden="true">
          {ripples.map((r) => (
            <span
              key={r.id}
              className="nova-ripple__wave"
              style={{
                left: r.x,
                top: r.y,
                width: r.size,
                height: r.size,
              }}
            />
          ))}
        </span>
      </button>
    );
  }
);
