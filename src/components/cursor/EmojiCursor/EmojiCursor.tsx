import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./EmojiCursor.css";

export interface EmojiCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Emojis / characters to emit. @default ["✨","💫","⭐️"] */
  emojis?: string[];
  /** Max number of live particles in the pool. @default 30 */
  count?: number;
  /** Font size of emitted glyphs, in px. @default 22 */
  size?: number;
  /** Initial upward/outward speed of particles, in px/frame. @default 4 */
  speed?: number;
  /** Gravity pulling particles down, in px/frame². @default 0.12 */
  gravity?: number;
  className?: string;
}

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  rot: number;
  vr: number;
  active: boolean;
}

const DEFAULT_EMOJIS = ["✨", "💫", "⭐️"];

/**
 * Emits a configurable set of emojis/characters that spray and float from the
 * pointer as it moves, then drift, spin, and fade under gravity. Uses a fixed
 * particle pool driven by a single rAF loop.
 */
export function EmojiCursor({
  containerRef,
  emojis = DEFAULT_EMOJIS,
  count = 30,
  size = 22,
  speed = 4,
  gravity = 0.12,
  className,
}: EmojiCursorProps) {
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
      root.querySelectorAll<HTMLDivElement>(".nova-emoji-cursor__item"),
    );
    const glyphs = emojis.length ? emojis : DEFAULT_EMOJIS;
    const scoped = host !== document.body;

    const pool: Particle[] = els.map((el) => ({
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      rot: 0,
      vr: 0,
      active: false,
    }));
    let cursor = 0;
    let raf = 0;
    let lastSpawn = 0;

    const spawn = (x: number, y: number) => {
      const p = pool[cursor];
      cursor = (cursor + 1) % pool.length;
      p.x = x;
      p.y = y;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const sp = speed * (0.6 + Math.random() * 0.8);
      p.vx = Math.cos(angle) * sp;
      p.vy = Math.sin(angle) * sp;
      p.rot = Math.random() * 360;
      p.vr = (Math.random() - 0.5) * 12;
      p.life = 1;
      p.active = true;
      p.el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 60) return;
      lastSpawn = now;
      spawn(e.clientX, e.clientY);
    };

    const loop = () => {
      for (const p of pool) {
        if (!p.active) continue;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        if (p.life <= 0) {
          p.active = false;
          p.el.style.opacity = "0";
          continue;
        }
        p.el.style.opacity = String(Math.min(1, p.life * 1.4));
        p.el.style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${p.rot}deg)`;
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
  }, [enabled, host, emojis, speed, gravity]);

  if (!enabled || !host) return null;

  const vars = { "--nova-emoji-cursor-size": `${size}px` } as CSSProperties;

  return createPortal(
    <div
      ref={rootRef}
      className={cn("nova-emoji-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      {Array.from({ length: Math.max(1, count) }).map((_, i) => (
        <div key={i} className="nova-emoji-cursor__item" />
      ))}
    </div>,
    host,
  );
}
