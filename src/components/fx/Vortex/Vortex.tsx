import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./Vortex.css";

export interface VortexProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of swirling particles. Defaults `400`. */
  particleCount?: number;
  /** Rotation speed multiplier. Defaults `1`. */
  speed?: number;
  /** Base particle color. Any CSS color. Defaults the brand color. */
  baseColor?: string;
  /** Max particle radius in px. Defaults `2`. */
  size?: number;
  children?: React.ReactNode;
}

interface VP {
  angle: number;
  radius: number;
  speed: number;
  r: number;
  a: number;
}

/**
 * A swirling particle vortex rendered to a canvas via requestAnimationFrame:
 * dots orbit a central point, each at its own radius and angular speed, fading
 * with depth. Density, speed, color and particle size are configurable; accepts
 * centered content.
 *
 * SSR-safe: all canvas/window access lives in effects with full cleanup (rAF
 * cancelled, ResizeObserver removed). Renders a single static frame on
 * reduced-motion. Decorative layer aria-hidden.
 */
export const Vortex = forwardRef<HTMLDivElement, VortexProps>(function Vortex(
  {
    particleCount = 400,
    speed = 1,
    baseColor = "var(--nova-primary)",
    size = 2,
    className,
    children,
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
    probe.style.color = baseColor;
    root.appendChild(probe);
    const resolved = getComputedStyle(probe).color || "rgba(16, 185, 129,1)";
    root.removeChild(probe);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let maxR = 0;
    const particles: VP[] = [];

    const seed = () => {
      particles.length = 0;
      maxR = Math.hypot(w, h) / 2;
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.pow(Math.random(), 0.6) * maxR;
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius,
          // Inner particles rotate faster (vortex swirl).
          speed: (0.006 + (1 - radius / maxR) * 0.02) * speed,
          r: Math.random() * size + 0.4,
          a: 0.2 + (1 - radius / maxR) * 0.6,
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
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = resolved;
      for (const p of particles) {
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const p of particles) {
        p.angle += p.speed;
        // Slowly spiral inward then reset for a living vortex feel.
        p.radius -= 0.08 * speed;
        if (p.radius < 4) {
          p.radius = maxR;
          p.angle = Math.random() * Math.PI * 2;
        }
      }
      draw();
    };

    resize();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(root);

    let raf = 0;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [particleCount, speed, baseColor, size, reduced]);

  return (
    <div ref={setRefs} className={cn("nova-vortex", className)} {...rest}>
      <canvas
        ref={canvasRef}
        className="nova-vortex__canvas"
        aria-hidden="true"
      />
      {children != null && (
        <div className="nova-vortex__content">{children}</div>
      )}
    </div>
  );
});
