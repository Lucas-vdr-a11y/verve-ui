import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./VariableProximity.css";

export interface VariableProximityProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The text whose characters respond to cursor proximity. */
  text: string;
  /** Radius (px) within which characters react. Defaults `120`. */
  radius?: number;
  /** Font-weight at zero distance. Defaults `800`. */
  maxWeight?: number;
  /** Font-weight far from the cursor. Defaults `300`. */
  minWeight?: number;
  /** Extra scale at zero distance (1 = none). Defaults `1.18`. */
  maxScale?: number;
}

/**
 * VariableProximity — each character's weight and scale ramp up the closer the
 * cursor gets, falling back to the resting weight beyond the radius (a
 * variable-font proximity effect). Pointer position is read on pointermove and
 * applied per-frame via requestAnimationFrame; listeners and the frame are
 * cleaned up on unmount, and the whole thing is SSR-safe. Under reduced-motion
 * the text stays at its resting weight with no pointer tracking.
 */
export const VariableProximity = forwardRef<
  HTMLSpanElement,
  VariableProximityProps
>(function VariableProximity(
  {
    text,
    radius = 120,
    maxWeight = 800,
    minWeight = 300,
    maxScale = 1.18,
    className,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const pointer = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const tick = () => {
      const { x, y, active } = pointer.current;
      for (const el of charsRef.current) {
        if (!el) continue;
        let t = 0;
        if (active) {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(x - cx, y - cy);
          t = Math.max(0, 1 - d / radius);
          // ease for a snappier falloff
          t = t * t * (3 - 2 * t);
        }
        const weight = Math.round(minWeight + (maxWeight - minWeight) * t);
        const scale = 1 + (maxScale - 1) * t;
        el.style.fontWeight = String(weight);
        el.style.transform = `scale(${scale})`;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    raf = window.requestAnimationFrame(tick);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced, radius, maxWeight, minWeight, maxScale]);

  charsRef.current = [];

  return (
    <span
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn("nova-variable-proximity", className)}
      style={
        { "--nova-vp-rest": String(minWeight), ...style } as React.CSSProperties
      }
      aria-label={text}
      {...rest}
    >
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            ref={(node) => {
              if (node) charsRef.current.push(node);
            }}
            className="nova-variable-proximity__char"
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
});
