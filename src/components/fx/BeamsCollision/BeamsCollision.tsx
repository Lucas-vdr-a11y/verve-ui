import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./BeamsCollision.css";

export interface BeamsCollisionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of beams falling concurrently. Defaults `7`. */
  beams?: number;
  /** Beam color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Fall speed multiplier. Defaults `1`. */
  speed?: number;
  /** Show the bottom collision line. Defaults `true`. */
  showLine?: boolean;
}

interface Beam {
  x: number;
  y: number;
  len: number;
  vy: number;
  delay: number;
}

interface Splash {
  x: number;
  parts: { vx: number; vy: number; x: number; y: number; life: number }[];
  life: number;
}

/**
 * Beams fall from the top and burst into a splash of sparks when they hit the
 * bottom line — the Magic UI "background beams with collision". Rendered to a
 * canvas via requestAnimationFrame.
 *
 * SSR-safe: all canvas/window access lives in an effect with full cleanup (rAF
 * cancelled, ResizeObserver disconnected). Freezes (static frame) under
 * reduced-motion. Decorative — aria-hidden.
 */
export const BeamsCollision = forwardRef<HTMLDivElement, BeamsCollisionProps>(
  function BeamsCollision(
    {
      beams = 7,
      color = "var(--nova-primary)",
      speed = 1,
      showLine = true,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const reduced = useReducedMotion();

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const probe = document.createElement("span");
      probe.style.color = color;
      root.appendChild(probe);
      const resolved = getComputedStyle(probe).color || "rgba(99,102,241,1)";
      root.removeChild(probe);

      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0;
      let h = 0;
      const beamList: Beam[] = [];
      const splashes: Splash[] = [];

      const makeBeam = (offset = 0): Beam => ({
        x: Math.random() * 0.92 + 0.04,
        y: -(Math.random() * h * 0.5) - offset,
        len: Math.random() * 80 + 60,
        vy: (Math.random() * 1.6 + 1.6) * speed,
        delay: 0,
      });

      const seed = () => {
        beamList.length = 0;
        for (let i = 0; i < beams; i++) beamList.push(makeBeam(i * 120));
      };

      const resize = () => {
        const rect = root.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (beamList.length === 0) seed();
      };

      const spawnSplash = (xPx: number) => {
        const parts = [];
        const count = 10;
        for (let i = 0; i < count; i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
          const sp = Math.random() * 3 + 1.5;
          parts.push({
            x: xPx,
            y: h - 2,
            vx: Math.cos(angle) * sp,
            vy: Math.sin(angle) * sp,
            life: 1,
          });
        }
        splashes.push({ x: xPx, parts, life: 1 });
      };

      const draw = (animating: boolean) => {
        ctx.clearRect(0, 0, w, h);
        const floor = h - 2;

        for (const b of beamList) {
          const xPx = b.x * w;
          const grad = ctx.createLinearGradient(0, b.y, 0, b.y + b.len);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, resolved);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xPx, b.y);
          ctx.lineTo(xPx, b.y + b.len);
          ctx.stroke();

          if (animating) {
            b.y += b.vy;
            if (b.y + b.len >= floor) {
              spawnSplash(xPx);
              Object.assign(b, makeBeam(0));
            }
          }
        }

        for (let s = splashes.length - 1; s >= 0; s--) {
          const splash = splashes[s];
          for (const p of splash.parts) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = resolved;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6 * Math.max(0, p.life), 0, Math.PI * 2);
            ctx.fill();
            if (animating) {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.12;
              p.life -= 0.03;
            }
          }
          ctx.globalAlpha = 1;
          if (animating) {
            splash.life -= 0.03;
            if (splash.life <= 0) splashes.splice(s, 1);
          }
        }
      };

      resize();

      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(resize)
          : null;
      ro?.observe(root);

      let raf = 0;
      if (reduced) {
        draw(false);
      } else {
        const loop = () => {
          draw(true);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
      };
    }, [beams, color, speed, reduced]);

    return (
      <div
        ref={setRefs}
        aria-hidden="true"
        className={cn(
          "nova-beams-collision",
          showLine && "nova-beams-collision--line",
          className
        )}
        style={
          { "--nova-beams-collision-color": color, ...style } as React.CSSProperties
        }
        {...rest}
      >
        <canvas ref={canvasRef} className="nova-beams-collision__canvas" />
      </div>
    );
  }
);
