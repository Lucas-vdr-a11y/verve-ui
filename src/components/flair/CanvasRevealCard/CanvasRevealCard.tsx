import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./CanvasRevealCard.css";

export interface CanvasRevealCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Front content shown by default. */
  children?: React.ReactNode;
  /** Content shown on top of the dot-matrix when revealed. */
  reveal?: React.ReactNode;
  /** Spacing (px) between dots. Defaults `16`. */
  dotGap?: number;
  /** Dot radius (px). Defaults `2`. */
  dotSize?: number;
  /** Comma-free CSS color used for the dots. Defaults brand. */
  dotColor?: string;
}

/**
 * A card that, on hover, fades in an animated dot-matrix canvas underneath the
 * front content — dots twinkle (random opacity flicker) like the Aceternity
 * canvas-reveal effect. The reveal layer (optional `reveal` content) sits above
 * the dots.
 *
 * SSR-safe: the canvas + requestAnimationFrame loop only start in an effect and
 * are fully torn down on unmount. The loop runs only while hovered, and is
 * skipped entirely under reduced motion (a static dot grid is drawn instead).
 */
export const CanvasRevealCard = forwardRef<
  HTMLDivElement,
  CanvasRevealCardProps
>(function CanvasRevealCard(
  {
    children,
    reveal,
    dotGap = 16,
    dotSize = 2,
    dotColor = "rgb(99 102 241 / 0.9)",
    className,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, twinkle: boolean) => {
      ctx.clearRect(0, 0, w, h);
      for (let y = dotGap / 2; y < h; y += dotGap) {
        for (let x = dotGap / 2; x < w; x += dotGap) {
          const alpha = twinkle ? 0.15 + Math.random() * 0.85 : 0.5;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
    [dotGap, dotSize, dotColor]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.scale(dpr, dpr);

    if (!hovered) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    if (reduced) {
      draw(ctx, w, h, false);
      return;
    }

    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      // throttle the twinkle to ~12fps for a gentle flicker
      if (time - last > 80) {
        draw(ctx, w, h, true);
        last = time;
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [hovered, reduced, draw]);

  return (
    <div
      ref={ref}
      className={cn("nova-canvas-reveal", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "nova-canvas-reveal__canvas",
          hovered && "nova-canvas-reveal__canvas--on"
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "nova-canvas-reveal__reveal",
          hovered && "nova-canvas-reveal__reveal--on"
        )}
        aria-hidden={!hovered}
      >
        {reveal}
      </div>
      <div
        className={cn(
          "nova-canvas-reveal__front",
          hovered && "nova-canvas-reveal__front--off"
        )}
      >
        {children}
      </div>
    </div>
  );
});
