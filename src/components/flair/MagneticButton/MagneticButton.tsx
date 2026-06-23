import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./MagneticButton.css";

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * How far (px) the element is allowed to travel toward the pointer at the
   * edge of its activation field. Defaults `18`.
   */
  strength?: number;
  /**
   * Radius (px) added around the element within which the pull engages. Larger
   * values make the magnet "reach" further. Defaults `40`.
   */
  radius?: number;
  /** Easing factor per frame (0–1); lower is springier/slower. Defaults `0.18`. */
  ease?: number;
  /**
   * Also pull the inner content slightly further than the button for a layered
   * feel. Defaults `true`.
   */
  parallaxContent?: boolean;
  children?: React.ReactNode;
}

/**
 * A control that is magnetically pulled toward the cursor while hovered and
 * springs back to rest on leave. Movement is integrated each animation frame
 * toward a pointer-derived target, so it eases naturally rather than snapping.
 *
 * Real `<button>` (keyboard/focus accessible). Under reduced motion the magnet
 * is disabled and the button stays put.
 */
export const MagneticButton = forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(function MagneticButton(
  {
    strength = 18,
    radius = 40,
    ease = 0.18,
    parallaxContent = true,
    className,
    children,
    onPointerMove,
    onPointerLeave,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const innerRef = useRef<HTMLButtonElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLButtonElement, []);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const node = innerRef.current;
    if (!node) {
      rafRef.current = null;
      return;
    }
    const cur = currentRef.current;
    const tgt = targetRef.current;
    cur.x += (tgt.x - cur.x) * ease;
    cur.y += (tgt.y - cur.y) * ease;

    node.style.setProperty("--nova-magnetic-x", `${cur.x.toFixed(2)}px`);
    node.style.setProperty("--nova-magnetic-y", `${cur.y.toFixed(2)}px`);

    const settled =
      Math.abs(tgt.x - cur.x) < 0.05 && Math.abs(tgt.y - cur.y) < 0.05;
    if (settled && tgt.x === 0 && tgt.y === 0) {
      cur.x = 0;
      cur.y = 0;
      node.style.setProperty("--nova-magnetic-x", "0px");
      node.style.setProperty("--nova-magnetic-y", "0px");
      rafRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [ease]);

  const startLoop = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      if (reduced) return;
      const node = innerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const reach = Math.max(rect.width, rect.height) / 2 + radius;
      const dist = Math.hypot(dx, dy);
      const pull = Math.min(1, dist / reach);
      targetRef.current = {
        x: (dx / (dist || 1)) * pull * strength,
        y: (dy / (dist || 1)) * pull * strength,
      };
      startLoop();
    },
    [onPointerMove, reduced, radius, strength, startLoop]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      targetRef.current = { x: 0, y: 0 };
      startLoop();
    },
    [onPointerLeave, startLoop]
  );

  useEffect(() => stopLoop, [stopLoop]);

  return (
    <button
      ref={innerRef}
      type="button"
      className={cn(
        "nova-magnetic",
        parallaxContent && "nova-magnetic--parallax",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={style}
      {...rest}
    >
      <span className="nova-magnetic__content">{children}</span>
    </button>
  );
});
