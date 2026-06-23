import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ColorWheel.css";

export type ColorWheelSize = "sm" | "md" | "lg";

export interface ColorWheelProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue" | "color"
  > {
  /** Controlled color, as a hex string (`#rrggbb`). */
  value?: string;
  /** Uncontrolled initial color. Defaults to `#6366f1`. */
  defaultValue?: string;
  /** Called with the new color whenever it changes. */
  onChange?: (color: { hex: string; hsl: string }) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ColorWheelSize;
  /** Disable interaction. */
  disabled?: boolean;
  /** Accessible label for the wheel. */
  "aria-label"?: string;
}

/* ---- Color math (pure, SSR-safe) ----------------------------------------- */

interface HSV {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const c = v * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToHex(hsv: HSV): string {
  const [r, g, b] = hsvToRgb(hsv);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hsvToHslString({ h, s, v }: HSV): string {
  // Convert HSV -> HSL for a friendly output string.
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return `hsl(${Math.round(h)}, ${Math.round(sl * 100)}%, ${Math.round(
    l * 100
  )}%)`;
}

function parseHex(hex: string): HSV | null {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  return rgbToHsv(r, g, b);
}

const DEFAULT_HSV: HSV = { h: 239, s: 0.58, v: 0.91 };

export const ColorWheel = forwardRef<HTMLDivElement, ColorWheelProps>(
  function ColorWheel(
    {
      value,
      defaultValue = "#6366f1",
      onChange,
      size = "md",
      disabled = false,
      className,
      "aria-label": ariaLabel = "Color wheel",
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<HSV>(
      () => parseHex(defaultValue) ?? DEFAULT_HSV
    );
    const controlledHsv = isControlled ? parseHex(value) ?? DEFAULT_HSV : null;
    const hsv = isControlled ? (controlledHsv as HSV) : internal;

    const wheelRef = useRef<HTMLDivElement | null>(null);
    const svRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<null | "hue" | "sv">(null);

    const commit = useCallback(
      (next: HSV) => {
        if (disabled) return;
        if (!isControlled) setInternal(next);
        onChange?.({ hex: hsvToHex(next), hsl: hsvToHslString(next) });
      },
      [disabled, isControlled, onChange]
    );

    // Pointer interaction handled in an effect so listeners are cleaned up.
    useEffect(() => {
      if (typeof window === "undefined") return;
      const handleMove = (e: PointerEvent) => {
        const mode = draggingRef.current;
        if (!mode) return;
        if (mode === "hue") {
          const el = wheelRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const angle =
            (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
          const h = (angle + 360) % 360;
          commit({ ...currentRef.current, h });
        } else {
          const el = svRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const s = clamp01((e.clientX - rect.left) / rect.width);
          const v = clamp01(1 - (e.clientY - rect.top) / rect.height);
          commit({ ...currentRef.current, s, v });
        }
      };
      const handleUp = () => {
        draggingRef.current = null;
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
    }, [commit]);

    // Keep latest hsv accessible to the global pointer handlers.
    const currentRef = useRef(hsv);
    currentRef.current = hsv;

    const startHue = (e: React.PointerEvent) => {
      if (disabled) return;
      draggingRef.current = "hue";
      const el = wheelRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle =
          (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
        commit({ ...hsv, h: (angle + 360) % 360 });
      }
    };

    const startSv = (e: React.PointerEvent) => {
      if (disabled) return;
      draggingRef.current = "sv";
      const el = svRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const s = clamp01((e.clientX - rect.left) / rect.width);
        const v = clamp01(1 - (e.clientY - rect.top) / rect.height);
        commit({ ...hsv, s, v });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let { h, s, v } = hsv;
      switch (e.key) {
        case "ArrowRight":
          h = (h + 5) % 360;
          break;
        case "ArrowLeft":
          h = (h - 5 + 360) % 360;
          break;
        case "ArrowUp":
          v = clamp01(v + 0.05);
          break;
        case "ArrowDown":
          v = clamp01(v - 0.05);
          break;
        case "PageUp":
          s = clamp01(s + 0.05);
          break;
        case "PageDown":
          s = clamp01(s - 0.05);
          break;
        default:
          return;
      }
      e.preventDefault();
      commit({ h, s, v });
    };

    const hex = hsvToHex(hsv);
    // Hue handle position on the ring.
    const ringAngle = (hsv.h * Math.PI) / 180;
    const hueX = 50 + Math.cos(ringAngle) * 44;
    const hueY = 50 + Math.sin(ringAngle) * 44;
    const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1 });

    return (
      <div
        ref={ref}
        className={cn(
          "nova-colorwheel",
          `nova-colorwheel--${size}`,
          disabled && "nova-colorwheel--disabled",
          className
        )}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <div
          className="nova-colorwheel__ring-wrap"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${ariaLabel} hue`}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hsv.h)}
          aria-valuetext={`${Math.round(hsv.h)} degrees`}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        >
          <div
            ref={wheelRef}
            className="nova-colorwheel__ring nova-focusable"
            onPointerDown={startHue}
          >
            <span
              className="nova-colorwheel__hue-handle"
              style={{
                left: `${hueX}%`,
                top: `${hueY}%`,
                background: pureHue,
              }}
              aria-hidden="true"
            />
            {/* SV square nested inside the ring. */}
            <div
              ref={svRef}
              className="nova-colorwheel__sv"
              style={{ ["--nova-colorwheel-hue" as string]: pureHue }}
              onPointerDown={(e) => {
                e.stopPropagation();
                startSv(e);
              }}
            >
              <span
                className="nova-colorwheel__sv-handle"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  background: hex,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
