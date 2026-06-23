import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./CursorFollower.css";

export interface CursorFollowerProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Diameter of the blob, in px. @default 28 */
  size?: number;
  /** Spring stiffness (0–1, higher = snappier). @default 0.12 */
  stiffness?: number;
  /** Spring damping (0–1, higher = less overshoot). @default 0.75 */
  damping?: number;
  /** Color of the blob. Defaults to the brand primary token. */
  color?: string;
  className?: string;
}

/**
 * A single soft blob that lags behind the pointer with a spring simulation.
 * Lightweight, decorative pointer companion for dark or playful sections.
 */
export function CursorFollower({
  containerRef,
  size = 28,
  stiffness = 0.12,
  damping = 0.75,
  color,
  className,
}: CursorFollowerProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const blob = blobRef.current!;
    const scoped = host !== document.body;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        blob.classList.add("nova-cursor-follower__blob--visible");
      }
    };
    const onLeave = () => {
      visible = false;
      blob.classList.remove("nova-cursor-follower__blob--visible");
    };

    const loop = () => {
      vx = (vx + (tx - x) * stiffness) * damping;
      vy = (vy + (ty - y) * stiffness) * damping;
      x += vx;
      y += vy;
      const speed = Math.min(Math.hypot(vx, vy) / 40, 0.4);
      blob.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${1 + speed})`;
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
    };
  }, [enabled, host, stiffness, damping]);

  if (!enabled || !host) return null;

  const vars = {
    "--nova-cursor-follower-size": `${size}px`,
    ...(color ? { "--nova-cursor-follower-color": color } : {}),
  } as CSSProperties;

  return createPortal(
    <div
      className={cn("nova-cursor-follower", className)}
      style={vars}
      aria-hidden="true"
    >
      <div ref={blobRef} className="nova-cursor-follower__blob" />
    </div>,
    host,
  );
}
