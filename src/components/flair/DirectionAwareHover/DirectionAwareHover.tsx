import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./DirectionAwareHover.css";

type Direction = "top" | "right" | "bottom" | "left";

export interface DirectionAwareHoverProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible front content (e.g. an <img> or background). */
  children: React.ReactNode;
  /** Overlay content slid in from the entered edge. */
  overlay: React.ReactNode;
  /** Slide distance (px) the overlay travels. Defaults `40`. */
  distance?: number;
}

/**
 * An image/card whose overlay slides in from the edge the cursor actually
 * entered (and slides back out toward the edge it leaves). The enter direction
 * is computed from the pointer position relative to the element center using
 * the aspect-corrected quadrant, then written to a `data-direction` attribute
 * that CSS maps to the right slide transform.
 *
 * SSR-safe (geometry read only inside pointer handlers).
 */
export const DirectionAwareHover = forwardRef<
  HTMLDivElement,
  DirectionAwareHoverProps
>(function DirectionAwareHover(
  {
    children,
    overlay,
    distance = 40,
    className,
    onPointerEnter,
    onPointerLeave,
    style,
    ...rest
  },
  ref
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

  const directionOf = useCallback(
    (clientX: number, clientY: number): Direction => {
      const node = innerRef.current;
      if (!node) return "top";
      const rect = node.getBoundingClientRect();
      // Normalize to [-1, 1] then pick the dominant axis (aspect corrected).
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      const angle = Math.atan2(y, x); // -PI..PI
      const deg = (angle * 180) / Math.PI;
      if (deg >= -45 && deg < 45) return "right";
      if (deg >= 45 && deg < 135) return "bottom";
      if (deg >= -135 && deg < -45) return "top";
      return "left";
    },
    []
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      const node = innerRef.current;
      if (!node) return;
      node.dataset.direction = directionOf(event.clientX, event.clientY);
      node.dataset.active = "true";
    },
    [onPointerEnter, directionOf]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      const node = innerRef.current;
      if (!node) return;
      node.dataset.direction = directionOf(event.clientX, event.clientY);
      node.dataset.active = "false";
    },
    [onPointerLeave, directionOf]
  );

  return (
    <div
      ref={innerRef}
      className={cn("nova-dah", className)}
      data-direction="top"
      data-active="false"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--nova-dah-distance": `${distance}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-dah__media">{children}</div>
      <div className="nova-dah__overlay" aria-hidden="true">
        <div className="nova-dah__overlay-inner">{overlay}</div>
      </div>
    </div>
  );
});
