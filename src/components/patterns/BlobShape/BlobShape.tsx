import { forwardRef, useId, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./BlobShape.css";

export type BlobPreset = "blob1" | "blob2" | "blob3" | "blob4";

export interface BlobShapeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Named preset blob path. Ignored when `seed` is provided. Defaults `"blob1"`. */
  preset?: BlobPreset;
  /** Deterministic seed → a unique organic blob. Overrides `preset`. */
  seed?: number;
  /** Diameter token. Defaults `"md"`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Fill: any CSS color, or `"gradient"` for the brand gradient. Defaults the primary token. */
  fill?: string | "gradient";
}

const SIZES: Record<NonNullable<BlobShapeProps["size"]>, number> = {
  sm: 120,
  md: 200,
  lg: 320,
  xl: 460,
};

/** Hand-tuned preset blob paths on a 0..200 viewbox. */
const PRESETS: Record<BlobPreset, string> = {
  blob1:
    "M44 -57C57 -47 67 -33 70 -18C73 -3 69 14 60 28C51 42 37 53 21 60C5 67 -13 70 -29 64C-45 58 -59 43 -65 26C-71 9 -69 -10 -61 -26C-53 -42 -39 -55 -23 -63C-7 -71 11 -73 26 -71C41 -69 31 -67 44 -57Z",
  blob2:
    "M40 -52C53 -43 65 -32 69 -18C73 -4 69 13 61 28C53 43 41 56 25 63C9 70 -11 71 -28 64C-45 57 -60 42 -66 25C-72 8 -69 -11 -60 -27C-51 -43 -36 -56 -20 -63C-4 -70 13 -71 27 -67C41 -63 27 -61 40 -52Z",
  blob3:
    "M48 -60C62 -50 72 -33 74 -16C76 1 70 19 60 33C50 47 36 57 19 64C2 71 -17 75 -33 68C-49 61 -62 44 -67 26C-72 8 -69 -11 -60 -27C-51 -43 -36 -55 -20 -63C-4 -71 13 -75 28 -73C43 -71 34 -70 48 -60Z",
  blob4:
    "M38 -50C51 -42 64 -33 70 -20C76 -7 75 9 68 23C61 37 48 49 33 57C18 65 1 69 -16 66C-33 63 -50 53 -60 38C-70 23 -73 3 -68 -14C-63 -31 -50 -45 -34 -55C-18 -65 1 -71 16 -67C31 -63 25 -58 38 -50Z",
};

/** Tiny deterministic PRNG (mulberry32) so a seed maps to a stable blob. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate an organic closed blob path from a seed, centered on the origin. */
function seededBlob(seed: number): string {
  const rng = mulberry32(seed);
  const pts = 8;
  const base = 60;
  const coords: { x: number; y: number }[] = [];
  for (let i = 0; i < pts; i++) {
    const ang = (i / pts) * Math.PI * 2;
    const r = base * (0.78 + rng() * 0.34);
    coords.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }
  // Smooth Catmull-Rom → cubic bezier through the points.
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < pts; i++) {
    const p0 = coords[(i - 1 + pts) % pts];
    const p1 = coords[i];
    const p2 = coords[(i + 1) % pts];
    const p3 = coords[(i + 2) % pts];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d + " Z";
}

/**
 * An organic blob SVG — usable as a decorative backdrop shape. Pick a preset path
 * or pass a `seed` for a unique deterministic blob. Fill with any token color, a
 * raw color, or the brand `"gradient"`.
 *
 * SSR-safe (path computed during render), no motion. Decorative — aria-hidden.
 */
export const BlobShape = forwardRef<HTMLDivElement, BlobShapeProps>(
  function BlobShape(
    {
      preset = "blob1",
      seed,
      size = "md",
      fill = "var(--nova-primary)",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = SIZES[size];
    const path = useMemo(
      () => (seed != null ? seededBlob(seed) : PRESETS[preset]),
      [seed, preset]
    );
    const isGradient = fill === "gradient";
    const gradId = `nova-blob-grad-${useId()}`;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-blob-shape", className)}
        style={
          {
            "--nova-blob-fill": isGradient ? undefined : fill,
            width: px,
            height: px,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-blob-shape__svg"
          viewBox="-100 -100 200 200"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isGradient && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--nova-brand-400)" />
                <stop offset="100%" stopColor="var(--nova-brand-700)" />
              </linearGradient>
            </defs>
          )}
          <path
            className="nova-blob-shape__path"
            d={path}
            fill={isGradient ? `url(#${gradId})` : "var(--nova-blob-fill)"}
          />
        </svg>
      </div>
    );
  }
);
