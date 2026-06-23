import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import {
  resolveScope,
  useCursorEnabled,
  type CursorScope,
} from "../useCursorEngine";
import "./BlobCursor.css";

export interface BlobCursorProps {
  /** Scope to a container instead of the whole window. */
  containerRef?: CursorScope;
  /** Diameter of the lead blob, in px. @default 36 */
  size?: number;
  /** Easing factor for the lead blob (0–1). @default 0.2 */
  ease?: number;
  /** Number of trailing metaballs that merge into the gooey shape. @default 3 */
  trail?: number;
  /** Fill color of the gooey blob. Defaults to the brand primary token. */
  color?: string;
  className?: string;
}

let gooId = 0;

/**
 * A gooey metaball cursor: several circles trail the pointer and merge through
 * an SVG `feGaussianBlur` + `feColorMatrix` goo filter. The blob squishes along
 * its direction of travel proportional to velocity.
 */
export function BlobCursor({
  containerRef,
  size = 36,
  ease = 0.2,
  trail = 3,
  color,
  className,
}: BlobCursorProps) {
  const enabled = useCursorEnabled();
  const [host, setHost] = useState<Element | null>(null);
  const filterId = useRef(`nova-blob-goo-${gooId++}`).current;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    setHost(resolveScope(containerRef) ?? document.body);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled || !host) return;
    const root = rootRef.current!;
    const balls = Array.from(
      root.querySelectorAll<HTMLDivElement>(".nova-blob-cursor__ball"),
    );
    const scoped = host !== document.body;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let visible = false;
    // Per-ball eased positions for the trail.
    const pos = balls.map(() => ({ x: 0, y: 0, px: 0, py: 0 }));

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        pos.forEach((p) => {
          p.x = p.px = tx;
          p.y = p.py = ty;
        });
        root.classList.add("nova-blob-cursor--visible");
      }
    };
    const onLeave = () => {
      visible = false;
      root.classList.remove("nova-blob-cursor--visible");
    };

    const loop = () => {
      let leadX = tx;
      let leadY = ty;
      pos.forEach((p, i) => {
        const factor = ease * (1 - i * 0.18);
        p.px = p.x;
        p.py = p.y;
        p.x += (leadX - p.x) * factor;
        p.y += (leadY - p.y) * factor;
        const vx = p.x - p.px;
        const vy = p.y - p.py;
        const speed = Math.min(Math.hypot(vx, vy) / 30, 0.6);
        const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
        balls[i].style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) ` +
          `rotate(${angle}deg) scale(${1 + speed}, ${1 - speed * 0.6})`;
        // Each ball follows the previous one for a chain effect.
        leadX = p.x;
        leadY = p.y;
      });
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
  }, [enabled, host, ease, trail]);

  if (!enabled || !host) return null;

  const vars = {
    "--nova-blob-cursor-size": `${size}px`,
    ...(color ? { "--nova-blob-cursor-color": color } : {}),
  } as CSSProperties;

  const count = Math.max(1, trail);

  return createPortal(
    <div
      ref={rootRef}
      className={cn("nova-blob-cursor", className)}
      style={vars}
      aria-hidden="true"
    >
      <svg className="nova-blob-cursor__defs" width="0" height="0">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="nova-blob-cursor__goo"
        style={{ filter: `url(#${filterId})` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="nova-blob-cursor__ball"
            style={{ opacity: 1 - i * (0.5 / count) }}
          />
        ))}
      </div>
    </div>,
    host,
  );
}
