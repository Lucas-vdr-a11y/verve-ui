import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./MatrixRainLoader.css";

export type MatrixRainLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type MatrixRainLoaderSize = "sm" | "md" | "lg" | number;

export interface MatrixRainLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel box size. Defaults to `"md"`. */
  size?: MatrixRainLoaderSize;
  /** Semantic color tone. Defaults to `"success"`. */
  tone?: MatrixRainLoaderTone;
  /** Explicit CSS color override for the glyphs (wins over `tone`). */
  color?: string;
  /** Glyphs to rain. Defaults to katakana + digits. */
  glyphs?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<MatrixRainLoaderSize, number>, number> = {
  sm: 56,
  md: 80,
  lg: 112,
};

function resolveSize(size: MatrixRainLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

const TONE_VAR: Record<MatrixRainLoaderTone, string> = {
  primary: "--nova-primary",
  success: "--nova-success",
  warning: "--nova-warning",
  danger: "--nova-danger",
  info: "--nova-info",
};

const DEFAULT_GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789";

export const MatrixRainLoader = forwardRef<
  HTMLSpanElement,
  MatrixRainLoaderProps
>(function MatrixRainLoader(
  {
    size = "md",
    tone = "success",
    color,
    glyphs = DEFAULT_GLYPHS,
    label = "Loading",
    className,
    style,
    ...rest
  },
  ref
) {
  const px = resolveSize(size);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      2
    );
    const dim = px;
    canvas.width = dim * dpr;
    canvas.height = dim * dpr;
    ctx.scale(dpr, dpr);

    // resolve the glyph color: the parent span sets `color: var(--nova-loader-color)`,
    // so reading its computed `color` gives a concrete rgb() value canvas can use.
    const host = canvas.parentElement;
    const resolved =
      color ||
      (host ? getComputedStyle(host).color : "") ||
      "#22c55e";

    const fontSize = Math.max(8, Math.round(dim / 9));
    const columns = Math.max(1, Math.floor(dim / fontSize));
    const drops = new Array(columns)
      .fill(0)
      .map(() => Math.floor(Math.random() * (dim / fontSize)));
    const chars = glyphs.length ? glyphs : DEFAULT_GLYPHS;

    ctx.font = `${fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";

    let raf = 0;
    let last = 0;
    const step = 90; // ms between rows advancing

    const draw = (now: number) => {
      if (now - last >= step) {
        last = now;
        // fade trail
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, 0, dim, dim);
        for (let i = 0; i < columns; i++) {
          const ch = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          // head glyph brighter
          ctx.fillStyle = resolved;
          ctx.fillText(ch, x, y);
          if (y > dim || Math.random() > 0.965) {
            drops[i] = 0;
          } else {
            drops[i]++;
          }
        }
      }
      raf = window.requestAnimationFrame(draw);
    };

    // one static frame for reduced motion, animated otherwise
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.clearRect(0, 0, dim, dim);
    if (reduce) {
      ctx.fillStyle = resolved;
      for (let i = 0; i < columns; i++) {
        for (let r = 0; r < 4; r++) {
          const ch = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.globalAlpha = 0.3 + r * 0.2;
          ctx.fillText(ch, i * fontSize, (drops[i] + r) * fontSize % dim);
        }
      }
      ctx.globalAlpha = 1;
      return;
    }

    raf = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [px, glyphs, color]);

  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn("nova-matrix-rain", className)}
      style={{
        ...style,
        ["--nova-matrix-size" as string]: `${px}px`,
        ...(color
          ? { ["--nova-loader-color" as string]: color }
          : { ["--nova-loader-color" as string]: `var(${TONE_VAR[tone]})` }),
      }}
      data-tone={tone}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="nova-matrix-rain__canvas"
        aria-hidden="true"
      />
    </span>
  );
});
