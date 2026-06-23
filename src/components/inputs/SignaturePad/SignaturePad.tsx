import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./SignaturePad.css";

export interface SignaturePadHandle {
  /** Clears the canvas and resets to the empty state. */
  clear: () => void;
  /** Returns the current drawing as a PNG data URL, or `""` when empty. */
  toDataURL: () => string;
  /** Whether the pad currently has no strokes. */
  isEmpty: () => boolean;
}

export interface SignaturePadProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "color"
  > {
  /** Canvas CSS width in pixels. Defaults to `400`. */
  width?: number;
  /** Canvas CSS height in pixels. Defaults to `160`. */
  height?: number;
  /** Pen color. Defaults to the current text token. */
  penColor?: string;
  /** Pen thickness in CSS pixels. Defaults to `2.5`. */
  thickness?: number;
  /** Disables drawing. */
  disabled?: boolean;
  /** Hint shown while the pad is empty. */
  placeholder?: string;
  /** Fired with the PNG data URL after each stroke (or `""` once cleared). */
  onChange?: (dataUrl: string) => void;
}

const canUseDOM =
  typeof window !== "undefined" && typeof document !== "undefined";

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(
    {
      width = 400,
      height = 160,
      penColor,
      thickness = 2.5,
      disabled = false,
      placeholder = "Sign here",
      onChange,
      className,
      ...rest
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);
    const colorRef = useRef<string>("");
    const [empty, setEmpty] = useState(true);

    // Resolve the pen color: explicit prop, else the --nova-text token.
    const resolveColor = useCallback(() => {
      if (penColor) return penColor;
      if (!canUseDOM || !canvasRef.current) return "#0f172a";
      const styles = getComputedStyle(canvasRef.current);
      return (
        styles.getPropertyValue("--nova-text").trim() ||
        styles.color ||
        "#0f172a"
      );
    }, [penColor]);

    // Configure the backing store for the device pixel ratio.
    const setupCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !canUseDOM) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      colorRef.current = resolveColor();
    }, [width, height, resolveColor]);

    useEffect(() => {
      setupCanvas();
    }, [setupCanvas]);

    const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

    const pointFromEvent = (e: PointerEvent | React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const emit = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      onChange?.(empty ? "" : canvas.toDataURL("image/png"));
    }, [onChange, empty]);

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const p = pointFromEvent(e);
      lastRef.current = p;
      // Dot for a single tap.
      ctx.beginPath();
      ctx.fillStyle = colorRef.current || resolveColor();
      ctx.arc(p.x, p.y, thickness / 2, 0, Math.PI * 2);
      ctx.fill();
      if (empty) setEmpty(false);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current || disabled) return;
      const ctx = getCtx();
      const last = lastRef.current;
      if (!ctx || !last) return;
      const p = pointFromEvent(e);
      ctx.beginPath();
      ctx.strokeStyle = colorRef.current || resolveColor();
      ctx.lineWidth = thickness;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastRef.current = p;
    };

    const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      lastRef.current = null;
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      emit();
    };

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      setEmpty(true);
      onChange?.("");
    }, [onChange]);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        toDataURL: () =>
          empty || !canvasRef.current
            ? ""
            : canvasRef.current.toDataURL("image/png"),
        isEmpty: () => empty,
      }),
      [clear, empty]
    );

    return (
      <div
        className={cn(
          "nova-signature",
          disabled && "nova-signature--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        style={{ width }}
        {...rest}
      >
        <div className="nova-signature__surface" style={{ width, height }}>
          <canvas
            ref={canvasRef}
            className="nova-signature__canvas"
            style={{ width, height, touchAction: "none" }}
            role="img"
            aria-label={placeholder}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onPointerLeave={endStroke}
          />
          {empty && (
            <span className="nova-signature__placeholder" aria-hidden="true">
              {placeholder}
            </span>
          )}
        </div>
      </div>
    );
  }
);
