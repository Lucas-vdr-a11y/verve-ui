import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./GlowingEffectBorder.css";

export interface GlowingEffectBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Wrapped content. */
  children?: React.ReactNode;
  /** Border thickness (px). Defaults `2`. */
  borderWidth?: number;
  /** Angular spread (deg) of the glowing arc. Defaults `60`. */
  spread?: number;
}

/**
 * A wrapper whose border emits a bright glow that tracks the cursor around the
 * card's edge (the Aceternity "glowing effect"). The pointer angle relative to
 * the card center drives a conic gradient masked to just the border ring.
 *
 * SSR-safe (angle computed in pointer handler), and under reduced motion the
 * glow stays put / hidden instead of chasing the cursor.
 */
export const GlowingEffectBorder = forwardRef<
  HTMLDivElement,
  GlowingEffectBorderProps
>(function GlowingEffectBorder(
  {
    children,
    borderWidth = 2,
    spread = 60,
    className,
    onPointerMove,
    onPointerLeave,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const innerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (reduced) return;
      const node = innerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle =
        (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI +
        90;
      node.style.setProperty("--nova-glow-angle", `${angle.toFixed(2)}deg`);
      node.style.setProperty("--nova-glow-opacity", "1");
    },
    [onPointerMove, reduced]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      innerRef.current?.style.setProperty("--nova-glow-opacity", "0");
    },
    [onPointerLeave]
  );

  return (
    <div
      ref={innerRef}
      className={cn("nova-glowing-border", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--nova-glow-border-width": `${borderWidth}px`,
          "--nova-glow-spread": `${spread}deg`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-glowing-border__glow" aria-hidden="true" />
      <div className="nova-glowing-border__content">{children}</div>
    </div>
  );
});
