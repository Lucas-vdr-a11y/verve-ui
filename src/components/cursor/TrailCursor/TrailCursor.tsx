import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./TrailCursor.css";

export interface TrailCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Max number of live trail particles. @default 18 */
  count?: number;
  /** Diameter of the largest (newest) particle, in px. @default 14 */
  size?: number;
  /** How fast particles fade out (per frame, 0–1). @default 0.04 */
  decay?: number;
  /** Particle color. Defaults to the brand primary token. */
  color?: string;
  className?: string;
}

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  life: number; // 1 -> 0
  active: boolean;
}

/**
 * A fading trail of dots that follow the pointer. Particles are spawned as the
 * pointer moves and decay every frame; a fixed pool is reused so no DOM nodes
 * are created or destroyed during animation.
 */
export function TrailCursor({
  containerRef,
  count = 18,
  size = 14,
  decay = 0.04,
  color,
  className,
}: TrailCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const root = rootRef.current!;
    const els = Array.from(
      root.querySelectorAll<HTMLDivElement>(".nova-trail-cursor__dot"),
    );
    const scoped = host !== document.body;

    const pool: Particle[] = els.map((el) => ({
      el,
      x: 0,
      y: 0,
      life: 0,
      active: false,
    }));
    let cursor = 0;
    let raf = 0;
    let lastSpawn = 0;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 16) return; // throttle to ~1 per frame
      lastSpawn = now;
      const x = e.clientX;
      const y = e.clientY;
      const p = pool[cursor];
      cursor = (cursor + 1) % pool.length;
      p.x = x;
      p.y = y;
      p.life = 1;
      p.active = true;
    };

    const loop = () => {
      for (const p of pool) {
        if (!p.active) continue;
        p.life -= decay;
        if (p.life <= 0) {
          p.active = false;
          p.el.style.opacity = "0";
          continue;
        }
        p.el.style.opacity = String(p.life);
        p.el.style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${p.life})`;
      }
      raf = requestAnimationFrame(loop);
    };

    const moveTarget = scoped ? host : window;
    moveTarget.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      moveTarget.removeEventListener("pointermove", onMove as EventListener);
    };
  }, [enabled, host, decay]);

  if (!enabled || !host) return null;

  const vars = {
    "--nova-trail-cursor-size": `${size}px`,
    ...(color ? { "--nova-trail-cursor-color": color } : {}),
  } as CSSProperties;

  return createPortal(
    <div
      ref={rootRef}
      className={cn("nova-trail-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      {Array.from({ length: Math.max(1, count) }).map((_, i) => (
        <div key={i} className="nova-trail-cursor__dot" />
      ))}
    </div>,
    host,
  );
}
