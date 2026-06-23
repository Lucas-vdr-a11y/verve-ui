import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./MagneticCursor.css";

export interface MagneticCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Diameter of the free-floating ring, in px. @default 40 */
  size?: number;
  /** Easing factor for ring movement (0–1). @default 0.2 */
  ease?: number;
  /**
   * Distance (px) within which the ring snaps onto a `[data-magnetic]` target.
   * @default 80
   */
  snapDistance?: number;
  /** Hide the OS cursor within scope. @default true */
  hideNativeCursor?: boolean;
  className?: string;
}

/**
 * A cursor ring that magnetizes onto nearby `[data-magnetic]` targets: when the
 * pointer is close, the ring morphs to the target's bounding box (size, radius,
 * position) instead of following the pointer freely.
 */
export function MagneticCursor({
  containerRef,
  size = 40,
  ease = 0.2,
  snapDistance = 80,
  hideNativeCursor = true,
  className,
}: MagneticCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const ring = ringRef.current!;
    const scoped = host !== document.body;
    const styleTarget =
      host === document.body
        ? (document.documentElement as HTMLElement)
        : (host as HTMLElement);
    const prevCursor = styleTarget.style.cursor;
    if (hideNativeCursor) styleTarget.style.cursor = "none";

    let raf = 0;
    let px = 0;
    let py = 0;
    // current eased box
    let x = 0;
    let y = 0;
    let w = size;
    let h = size;
    let r = size / 2;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!visible) {
        visible = true;
        x = px;
        y = py;
        ring.classList.add("nova-magnetic-cursor__ring--visible");
      }
    };
    const onLeave = () => {
      visible = false;
      ring.classList.remove("nova-magnetic-cursor__ring--visible");
    };

    const findTarget = (): HTMLElement | null => {
      const root: ParentNode = scoped ? (host as Element) : document;
      const targets = root.querySelectorAll<HTMLElement>("[data-magnetic]");
      let best: HTMLElement | null = null;
      let bestDist = snapDistance;
      targets.forEach((t) => {
        const b = t.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const dist = Math.hypot(px - cx, py - cy);
        // distance from pointer to the target's bounding circle (negative inside)
        const edge = dist - Math.max(b.width, b.height) / 2;
        if (edge < bestDist) {
          bestDist = edge;
          best = t;
        }
      });
      return best;
    };

    const loop = () => {
      const el = findTarget();
      let tx: number;
      let ty: number;
      let tw: number;
      let th: number;
      let tr: number;
      if (el) {
        const box = el.getBoundingClientRect();
        tx = box.left + box.width / 2;
        ty = box.top + box.height / 2;
        tw = box.width + 12;
        th = box.height + 12;
        const parsed = parseFloat(getComputedStyle(el).borderRadius);
        tr = Number.isFinite(parsed) && parsed > 0 ? parsed + 6 : 12;
        ring.classList.add("nova-magnetic-cursor__ring--snapped");
      } else {
        tx = px;
        ty = py;
        tw = size;
        th = size;
        tr = size / 2;
        ring.classList.remove("nova-magnetic-cursor__ring--snapped");
      }
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      w += (tw - w) * ease;
      h += (th - h) * ease;
      r += (tr - r) * ease;
      ring.style.width = `${w}px`;
      ring.style.height = `${h}px`;
      ring.style.borderRadius = `${r}px`;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const moveTarget = scoped ? host : window;
    const leaveTarget = scoped ? host : document;
    moveTarget.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    leaveTarget.addEventListener("pointerleave", onLeave as EventListener);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      moveTarget.removeEventListener("pointermove", onMove as EventListener);
      leaveTarget.removeEventListener("pointerleave", onLeave as EventListener);
      styleTarget.style.cursor = prevCursor;
    };
  }, [enabled, host, size, ease, snapDistance, hideNativeCursor]);

  if (!enabled || !host) return null;

  const vars = { "--nova-magnetic-cursor-size": `${size}px` } as CSSProperties;

  return createPortal(
    <div
      className={cn("nova-magnetic-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      <div ref={ringRef} className="nova-magnetic-cursor__ring" />
    </div>,
    host,
  );
}
