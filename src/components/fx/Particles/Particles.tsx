import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Particles.css";

export interface ParticlesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of particles. Defaults `80`. */
  quantity?: number;
  /** Particle/dot color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Drift speed multiplier. Defaults `1`. */
  speed?: number;
  /** Max particle radius in px. Defaults `2`. */
  size?: number;
  /** Cursor repel/attract radius in px. Defaults `120`. */
  reach?: number;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

/**
 * Floating particle field rendered to a canvas via requestAnimationFrame. Dots
 * drift continuously and gently part around the cursor. Quantity, color, speed,
 * size and cursor reach are configurable.
 *
 * SSR-safe: all canvas/window access lives in effects with full cleanup (rAF
 * cancelled, listeners + ResizeObserver removed). Freezes on reduced-motion.
 * Decorative — aria-hidden.
 */
export const Particles = forwardRef<HTMLDivElement, ParticlesProps>(
  function Particles(
    {
      quantity = 80,
      color = "var(--nova-primary)",
      speed = 1,
      size = 2,
      reach = 120,
      className,
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

      // Resolve the requested CSS color to a concrete rgb via a probe element.
      const probe = document.createElement("span");
      probe.style.color = color;
      root.appendChild(probe);
      const resolved =
        getComputedStyle(probe).color || "rgba(16, 185, 129,1)";
      root.removeChild(probe);

      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0;
      let h = 0;
      const particles: P[] = [];
      const pointer = { x: -9999, y: -9999, active: false };

      const seedParticles = () => {
        particles.length = 0;
        for (let i = 0; i < quantity; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3 * speed,
            vy: (Math.random() - 0.5) * 0.3 * speed,
            r: Math.random() * size + 0.4,
            a: Math.random() * 0.5 + 0.2,
          });
        }
      };

      const resize = () => {
        const rect = root.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (particles.length === 0) seedParticles();
      };

      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around the edges.
          if (p.x < -5) p.x = w + 5;
          else if (p.x > w + 5) p.x = -5;
          if (p.y < -5) p.y = h + 5;
          else if (p.y > h + 5) p.y = -5;

          // Cursor interaction — push particles away gently.
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < reach && dist > 0.01) {
              const force = (1 - dist / reach) * 1.4;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          ctx.globalAlpha = p.a;
          ctx.fillStyle = resolved;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      let raf = 0;
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };

      const onMove = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
      };
      const onLeave = () => {
        pointer.active = false;
        pointer.x = -9999;
        pointer.y = -9999;
      };

      resize();

      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(resize)
          : null;
      ro?.observe(root);

      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);

      if (reduced) {
        draw(); // render a single static frame
      } else {
        raf = requestAnimationFrame(loop);
      }

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    }, [quantity, color, speed, size, reach, reduced]);

    return (
      <div
        ref={setRefs}
        aria-hidden="true"
        className={cn("nova-particles", className)}
        {...rest}
      >
        <canvas ref={canvasRef} className="nova-particles__canvas" />
      </div>
    );
  }
);
