import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DragScroll.css";

export interface DragScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which axes can be dragged. Defaults to `"horizontal"`. */
  axis?: "horizontal" | "vertical" | "both";
  /**
   * Apply kinetic momentum (flick to keep scrolling). Defaults to `true`.
   * Honors reduced-motion by stopping immediately.
   */
  momentum?: boolean;
  /** Disable drag scrolling (native scroll still works). */
  disabled?: boolean;
}

/** Minimum pointer travel (px) before a press becomes a drag. */
const DRAG_THRESHOLD = 4;
/** Velocity below this (px/frame) ends momentum. */
const MIN_VELOCITY = 0.1;
/** Per-frame velocity decay. */
const FRICTION = 0.92;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * DragScroll — a scroll container you can click-and-drag to pan horizontally
 * and/or vertically, with optional kinetic momentum on release. Uses pointer
 * events with listeners attached only while a drag is active, all torn down on
 * unmount. SSR-safe (no DOM access at module scope or render).
 */
export const DragScroll = forwardRef<HTMLDivElement, DragScrollProps>(
  function DragScroll(
    {
      axis = "horizontal",
      momentum = true,
      disabled = false,
      className,
      children,
      onPointerDown,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);

    // Mutable gesture state (avoids re-renders during the drag).
    const state = useRef({
      active: false,
      moved: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      lastX: 0,
      lastY: 0,
      vx: 0,
      vy: 0,
    });
    const rafRef = useRef<number | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const allowX = axis === "horizontal" || axis === "both";
    const allowY = axis === "vertical" || axis === "both";

    const stopMomentum = useCallback(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);

    // ---- Momentum animation ------------------------------------------------
    const runMomentum = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      const s = state.current;
      const step = () => {
        const node = innerRef.current;
        if (!node) {
          rafRef.current = null;
          return;
        }
        if (allowX) {
          node.scrollLeft -= s.vx;
          s.vx *= FRICTION;
        }
        if (allowY) {
          node.scrollTop -= s.vy;
          s.vy *= FRICTION;
        }
        const moving =
          (allowX && Math.abs(s.vx) > MIN_VELOCITY) ||
          (allowY && Math.abs(s.vy) > MIN_VELOCITY);
        if (moving) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }, [allowX, allowY]);

    // ---- Pointer move / up (only while dragging) ---------------------------
    useEffect(() => {
      if (!dragging) return;
      if (typeof window === "undefined") return;

      const handleMove = (e: PointerEvent) => {
        const s = state.current;
        if (!s.active || e.pointerId !== s.pointerId) return;
        const el = innerRef.current;
        if (!el) return;
        const dx = e.clientX - s.startX;
        const dy = e.clientY - s.startY;
        if (!s.moved && Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
        s.moved = true;
        e.preventDefault();
        if (allowX) el.scrollLeft = s.startLeft - dx;
        if (allowY) el.scrollTop = s.startTop - dy;
        s.vx = e.clientX - s.lastX;
        s.vy = e.clientY - s.lastY;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
      };

      const finish = (e: PointerEvent) => {
        const s = state.current;
        if (e.pointerId !== s.pointerId) return;
        s.active = false;
        const flicked = s.moved;
        setDragging(false);
        if (
          flicked &&
          momentum &&
          !prefersReducedMotion() &&
          ((allowX && Math.abs(s.vx) > MIN_VELOCITY) ||
            (allowY && Math.abs(s.vy) > MIN_VELOCITY))
        ) {
          runMomentum();
        }
      };

      window.addEventListener("pointermove", handleMove, { passive: false });
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
      };
    }, [dragging, allowX, allowY, momentum, runMomentum]);

    // Clean up any in-flight momentum on unmount.
    useEffect(() => stopMomentum, [stopMomentum]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(e);
        if (disabled || e.button !== 0) return;
        // Ignore presses on interactive controls so they remain clickable.
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input, textarea, select")) return;
        const el = innerRef.current;
        if (!el) return;
        stopMomentum();
        const s = state.current;
        s.active = true;
        s.moved = false;
        s.pointerId = e.pointerId;
        s.startX = e.clientX;
        s.startY = e.clientY;
        s.startLeft = el.scrollLeft;
        s.startTop = el.scrollTop;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.vx = 0;
        s.vy = 0;
        setDragging(true);
      },
      [disabled, onPointerDown, stopMomentum]
    );

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-drag-scroll",
          `nova-drag-scroll--${axis}`,
          dragging && "nova-drag-scroll--dragging",
          disabled && "nova-drag-scroll--disabled",
          className
        )}
        onPointerDown={handlePointerDown}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
