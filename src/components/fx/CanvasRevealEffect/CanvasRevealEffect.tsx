import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./CanvasRevealEffect.css";

export interface CanvasRevealEffectProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between dots in px. Defaults `18`. */
  gap?: number;
  /** Max dot radius in px. Defaults `2`. */
  dotSize?: number;
  /** One or more dot colors (cycled across the matrix). Defaults a brand pair. */
  colors?: string[];
  /** Wave reveal speed multiplier. Defaults `1`. */
  speed?: number;
  /** Run the reveal animation. Set `false` to reveal only on hover. Defaults `true`. */
  animate?: boolean;
}

/**
 * A dot-matrix canvas that animates in as a diagonal wave — each dot fades and
 * scales up. Usable as a hover-reveal layer (drop into a hover target and toggle
 * `animate`). Colors and speed are configurable.
 *
 * SSR-safe: all canvas/window access lives in an effect with full cleanup (rAF
 * cancelled, ResizeObserver disconnected). Renders a static fully-revealed frame
 * under reduced-motion. Decorative — aria-hidden.
 */
export const CanvasRevealEffect = forwardRef<
  HTMLDivElement,
  CanvasRevealEffectProps
>(function CanvasRevealEffect(
  {
    gap = 18,
    dotSize = 2,
    colors = ["var(--nova-primary)", "var(--nova-brand-400)"],
    speed = 1,
    animate = true,
    className,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const colorsKey = colors.join("|");

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

    // Resolve requested CSS colors to concrete rgb strings via probe elements.
    const palette = colorsKey.split("|").map((c) => {
      const probe = document.createElement("span");
      probe.style.color = c;
      root.appendChild(probe);
      const resolved = getComputedStyle(probe).color || "rgba(16, 185, 129,1)";
      root.removeChild(probe);
      return resolved;
    });
    if (palette.length === 0) palette.push("rgba(16, 185, 129,1)");

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / gap);
      rows = Math.ceil(h / gap);
    };

    const drawAt = (progress: number) => {
      ctx.clearRect(0, 0, w, h);
      const maxDiag = cols + rows || 1;
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          // Wave travels along the diagonal.
          const threshold = (cx + cy) / maxDiag;
          const local = Math.min(1, Math.max(0, (progress - threshold) * 4));
          if (local <= 0) continue;
          const color = palette[(cx + cy) % palette.length];
          ctx.globalAlpha = local * 0.85;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(
            cx * gap + gap / 2,
            cy * gap + gap / 2,
            dotSize * local,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            resize();
            if (reduced || !animate) drawAt(1);
          })
        : null;
    ro?.observe(root);

    let raf = 0;
    if (reduced || !animate) {
      drawAt(1);
    } else {
      const start =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const duration = 1600 / Math.max(0.1, speed);
      const loop = (now: number) => {
        const progress = Math.min(1.4, (now - start) / duration);
        drawAt(progress);
        if (progress < 1.4) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [gap, dotSize, colorsKey, speed, animate, reduced]);

  return (
    <div
      ref={setRefs}
      aria-hidden="true"
      className={cn("nova-reveal", className)}
      {...rest}
    >
      <canvas ref={canvasRef} className="nova-reveal__canvas" />
    </div>
  );
});
