import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Ripple.css";

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface RippleProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ripple color. Defaults to a translucent text color via tokens. */
  color?: string;
  /** Ripple animation duration in ms. Defaults `600`. */
  duration?: number;
  /** Disable spawning ripples. */
  disabled?: boolean;
  /** Center the ripple regardless of pointer position. */
  center?: boolean;
  children?: React.ReactNode;
}

let nextId = 0;

/**
 * Material-style click ripple wrapper. On pointer-down it spawns a ripple at the
 * pointer coordinates sized to cover the element; each ripple removes itself
 * once its animation ends (with a timeout safety net). Ripples are decorative
 * and `aria-hidden`. Under reduced motion no ripples are spawned.
 *
 * Wrap any positioned/relative content; this renders a relatively-positioned
 * inline-block host that clips the ripples.
 */
export const Ripple = forwardRef<HTMLSpanElement, RippleProps>(function Ripple(
  {
    color,
    duration = 600,
    disabled = false,
    center = false,
    className,
    children,
    onPointerDown,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const remove = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
    const t = timersRef.current.get(id);
    if (t != null) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      onPointerDown?.(event);
      if (disabled || reduced) return;

      const host = event.currentTarget;
      const rect = host.getBoundingClientRect();

      // Diameter must reach the farthest corner from the origin.
      const originX = center ? rect.width / 2 : event.clientX - rect.left;
      const originY = center ? rect.height / 2 : event.clientY - rect.top;
      const dx = Math.max(originX, rect.width - originX);
      const dy = Math.max(originY, rect.height - originY);
      const size = 2 * Math.hypot(dx, dy);

      const id = nextId++;
      const ripple: RippleInstance = {
        id,
        x: originX - size / 2,
        y: originY - size / 2,
        size,
      };
      setRipples((prev) => [...prev, ripple]);

      // Safety cleanup in case animationend never fires.
      const timer = setTimeout(() => remove(id), duration + 80);
      timersRef.current.set(id, timer);
    },
    [onPointerDown, disabled, reduced, center, duration, remove]
  );

  return (
    <span
      ref={ref}
      className={cn("nova-ripple", disabled && "nova-ripple--disabled", className)}
      onPointerDown={handlePointerDown}
      style={
        {
          ...(color ? { "--nova-ripple-color": color } : null),
          "--nova-ripple-duration": `${duration}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
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
            onAnimationEnd={() => remove(r.id)}
          />
        ))}
      </span>
    </span>
  );
});
