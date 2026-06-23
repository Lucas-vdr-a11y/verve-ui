import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./FloatingShapes.css";

type ShapeKind = "circle" | "triangle" | "blob";

export interface FloatingShapesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of shapes. Defaults `8`. */
  count?: number;
  /** Shape tint colors, cycled. Defaults a brand/info blend. */
  colors?: string[];
  /** Drift speed multiplier. Higher is faster. Defaults `1`. */
  speed?: number;
  /** Which shape kinds to use. Defaults all three. */
  shapes?: ShapeKind[];
}

interface Item {
  kind: ShapeKind;
  left: number;
  top: number;
  size: number;
  color: string;
  dur: number;
  delay: number;
  drift: number;
}

const DEFAULT_SHAPES: ShapeKind[] = ["circle", "triangle", "blob"];

/**
 * Soft geometric shapes (circles, triangles, blobs) that drift and parallax
 * slowly across the background, each on its own loop. Tintable, with a
 * configurable count. Positions are deterministic so SSR and first paint match.
 *
 * SSR-safe (seeded layout, no window access). Drift freezes under reduced-motion
 * via CSS. Decorative — aria-hidden.
 */
export const FloatingShapes = forwardRef<HTMLDivElement, FloatingShapesProps>(
  function FloatingShapes(
    {
      count = 8,
      colors = ["var(--nova-primary)", "var(--nova-info)", "var(--nova-brand-400)"],
      speed = 1,
      shapes = DEFAULT_SHAPES,
      className,
      ...rest
    },
    ref
  ) {
    const kinds = shapes.length ? shapes : DEFAULT_SHAPES;
    const palette = colors.length ? colors : ["var(--nova-primary)"];
    const kindsKey = kinds.join("|");
    const paletteKey = palette.join("|");

    const items = useMemo<Item[]>(() => {
      const kindList = kindsKey.split("|") as ShapeKind[];
      const colorList = paletteKey.split("|");
      let seed = count * 911 + kindList.length * 17 + 3;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      return Array.from({ length: count }, (_, i) => ({
        kind: kindList[i % kindList.length],
        left: rand() * 100,
        top: rand() * 100,
        size: 40 + rand() * 120,
        color: colorList[i % colorList.length],
        dur: (18 + rand() * 16) / Math.max(0.1, speed),
        delay: -rand() * 20,
        drift: (rand() - 0.5) * 60,
      }));
    }, [count, speed, kindsKey, paletteKey]);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-shapes", className)}
        {...rest}
      >
        {items.map((it, i) => (
          <span
            key={i}
            className={cn("nova-shapes__shape", `nova-shapes__shape--${it.kind}`)}
            style={
              {
                left: `${it.left}%`,
                top: `${it.top}%`,
                width: `${it.size}px`,
                height: `${it.size}px`,
                "--nova-shapes-color": it.color,
                "--nova-shapes-drift": `${it.drift}px`,
                animationDuration: `${it.dur}s`,
                animationDelay: `${it.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }
);
