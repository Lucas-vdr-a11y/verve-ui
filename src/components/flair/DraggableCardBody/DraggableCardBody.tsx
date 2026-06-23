import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./DraggableCardBody.css";

export interface DraggableCardBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Stiffness of the spring-back toward origin (0–1). Defaults `0.12`. */
  springStrength?: number;
  /** Velocity inertia damping per frame (0–1, higher = more glide). Defaults `0.92`. */
  damping?: number;
  /** Degrees of tilt per px of horizontal velocity. Defaults `0.6`. */
  rotationFactor?: number;
  /** Card content. */
  children?: React.ReactNode;
}

/**
 * A card you can grab and throw: drag releases with velocity inertia, the card
 * glides, tilts in the direction of motion, then springs back to its origin.
 * Physics run in a rAF loop driven by pointer velocity; all transforms write to
 * a child element so `...rest`/ref stay on the wrapper.
 *
 * Under reduced motion the card stays put (no throw/spring) but remains
 * grabbable for visual feedback.
 */
export const DraggableCardBody = forwardRef<HTMLDivElement, DraggableCardBodyProps>(
  function DraggableCardBody(
    {
      springStrength = 0.12,
      damping = 0.92,
      rotationFactor = 0.6,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();

    // Physics state kept in refs so the rAF loop reads live values.
    const state = useRef({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      dragging: false,
      pointerId: -1,
      lastX: 0,
      lastY: 0,
      grabX: 0,
      grabY: 0,
    });
    const rafRef = useRef(0);

    useEffect(() => {
      const el = cardRef.current;
      if (!el) return;

      const apply = () => {
        const s = state.current;
        const rot = Math.max(-22, Math.min(22, s.vx * rotationFactor));
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${
          s.dragging ? rot : s.vx * rotationFactor * 0.5
        }deg)`;
      };

      const tick = () => {
        const s = state.current;
        if (!s.dragging) {
          // Inertia glide + spring back toward origin.
          s.vx *= damping;
          s.vy *= damping;
          s.x += s.vx;
          s.y += s.vy;
          s.x += (0 - s.x) * springStrength;
          s.y += (0 - s.y) * springStrength;
          if (
            Math.abs(s.x) < 0.15 &&
            Math.abs(s.y) < 0.15 &&
            Math.abs(s.vx) < 0.15 &&
            Math.abs(s.vy) < 0.15
          ) {
            s.x = 0;
            s.y = 0;
            s.vx = 0;
            s.vy = 0;
            el.style.transform = "translate3d(0,0,0) rotate(0deg)";
            rafRef.current = 0;
            return;
          }
        }
        apply();
        rafRef.current = requestAnimationFrame(tick);
      };

      const startLoop = () => {
        if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (reduced) return;
        const s = state.current;
        s.dragging = true;
        s.pointerId = e.pointerId;
        s.grabX = e.clientX - s.x;
        s.grabY = e.clientY - s.y;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.vx = 0;
        s.vy = 0;
        el.setPointerCapture?.(e.pointerId);
        el.classList.add("nova-draggable-card--grabbing");
        startLoop();
      };

      const onPointerMove = (e: PointerEvent) => {
        const s = state.current;
        if (!s.dragging || e.pointerId !== s.pointerId) return;
        s.vx = e.clientX - s.lastX;
        s.vy = e.clientY - s.lastY;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.x = e.clientX - s.grabX;
        s.y = e.clientY - s.grabY;
        apply();
      };

      const onPointerUp = (e: PointerEvent) => {
        const s = state.current;
        if (e.pointerId !== s.pointerId) return;
        s.dragging = false;
        s.pointerId = -1;
        el.classList.remove("nova-draggable-card--grabbing");
        el.releasePointerCapture?.(e.pointerId);
        startLoop();
      };

      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
      el.addEventListener("pointercancel", onPointerUp);

      return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerUp);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      };
    }, [springStrength, damping, rotationFactor, reduced]);

    return (
      <div ref={ref} className={cn("nova-draggable-card", className)} {...rest}>
        <div ref={cardRef} className="nova-draggable-card__body">
          {children}
        </div>
      </div>
    );
  }
);
