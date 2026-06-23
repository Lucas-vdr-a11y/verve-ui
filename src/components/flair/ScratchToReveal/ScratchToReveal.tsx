import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./ScratchToReveal.css";

export interface ScratchToRevealProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  /** Width (px) of the scratch surface. Defaults `300`. */
  width?: number;
  /** Height (px) of the scratch surface. Defaults `200`. */
  height?: number;
  /** Brush radius (px). Defaults `28`. */
  brushSize?: number;
  /** Fraction (0–1) of area cleared before completing. Defaults `0.5`. */
  threshold?: number;
  /** Fill color of the scratch-off coating. Defaults a muted gray. */
  coverColor?: string;
  /** Optional label rendered on the coating ("Scratch here"). */
  coverLabel?: string;
  /** Fired once when the cleared fraction crosses `threshold`. */
  onComplete?: () => void;
  /** Content revealed under the coating. */
  children?: React.ReactNode;
}

/**
 * A canvas scratch-off surface: drag across the coating to erase it (a
 * `destination-out` brush), revealing the children beneath. Cleared area is
 * sampled periodically; when it passes `threshold` the coating auto-fades and
 * `onComplete` fires once.
 *
 * SSR-safe (canvas painted in an effect, guarded), with pointer-capture drag
 * and full listener/animation cleanup on unmount.
 */
export const ScratchToReveal = forwardRef<HTMLDivElement, ScratchToRevealProps>(
  function ScratchToReveal(
    {
      width = 300,
      height = 200,
      brushSize = 28,
      threshold = 0.5,
      coverColor = "#94a3b8",
      coverLabel,
      onComplete,
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => hostRef.current as HTMLDivElement, []);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);
    const completedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const [revealed, setRevealed] = useState(false);

    // Paint the coating.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = coverColor;
      ctx.fillRect(0, 0, width, height);

      if (coverLabel) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font =
          "600 16px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(coverLabel, width / 2, height / 2);
      }

      completedRef.current = false;
      setRevealed(false);
    }, [width, height, coverColor, coverLabel]);

    const sampleCleared = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || completedRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width: cw, height: ch } = canvas;
      const step = 16; // sample sparsely for performance
      let cleared = 0;
      let total = 0;
      try {
        const data = ctx.getImageData(0, 0, cw, ch).data;
        for (let i = 3; i < data.length; i += 4 * step) {
          total++;
          if (data[i] === 0) cleared++;
        }
      } catch {
        return;
      }
      if (total > 0 && cleared / total >= threshold) {
        completedRef.current = true;
        setRevealed(true);
        onCompleteRef.current?.();
      }
    }, [threshold]);

    const scratch = useCallback(
      (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize * 2;
        const last = lastRef.current;
        ctx.beginPath();
        ctx.moveTo(last ? last.x : x, last ? last.y : y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        lastRef.current = { x, y };
      },
      [brushSize]
    );

    const pointFromEvent = useCallback(
      (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) * (width / rect.width),
          y: (event.clientY - rect.top) * (height / rect.height),
        };
      },
      [width, height]
    );

    const handlePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (completedRef.current) return;
        drawingRef.current = true;
        lastRef.current = null;
        event.currentTarget.setPointerCapture(event.pointerId);
        const p = pointFromEvent(event);
        if (p) scratch(p.x, p.y);
      },
      [pointFromEvent, scratch]
    );

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current || completedRef.current) return;
        const p = pointFromEvent(event);
        if (p) scratch(p.x, p.y);
      },
      [pointFromEvent, scratch]
    );

    const endStroke = useCallback(
      (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        lastRef.current = null;
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          /* pointer may already be released */
        }
        sampleCleared();
      },
      [sampleCleared]
    );

    return (
      <div
        ref={hostRef}
        className={cn(
          "nova-scratch",
          revealed && "nova-scratch--revealed",
          className
        )}
        style={
          {
            "--nova-scratch-w": `${width}px`,
            "--nova-scratch-h": `${height}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-scratch__reveal">{children}</div>
        <canvas
          ref={canvasRef}
          className="nova-scratch__canvas"
          style={{ width, height }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          aria-hidden="true"
        />
      </div>
    );
  }
);
