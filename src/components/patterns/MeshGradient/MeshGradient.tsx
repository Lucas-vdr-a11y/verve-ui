import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MeshGradient.css";

export interface MeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Up to ~5 point colors. Defaults a brand-tinted palette. */
  colors?: string[];
  /** Slowly drift the mesh points (CSS). Defaults `false`. */
  animated?: boolean;
  /** Corner radius token. Defaults `"xl"`. */
  radius?: "none" | "md" | "lg" | "xl" | "2xl";
}

const RADII: Record<NonNullable<MeshGradientProps["radius"]>, string> = {
  none: "0",
  md: "var(--nova-radius-md)",
  lg: "var(--nova-radius-lg)",
  xl: "var(--nova-radius-xl)",
  "2xl": "var(--nova-radius-2xl)",
};

const DEFAULT_COLORS = [
  "var(--nova-brand-400)",
  "var(--nova-brand-600)",
  "var(--nova-info-500)",
  "var(--nova-brand-300)",
  "var(--nova-brand-700)",
];

/** Fixed point positions so the layered radials read as a mesh. */
const POINTS = [
  { x: "12%", y: "18%" },
  { x: "85%", y: "12%" },
  { x: "75%", y: "80%" },
  { x: "20%", y: "78%" },
  { x: "50%", y: "45%" },
];

/**
 * A multi-point mesh-gradient panel built from layered radial gradients — a
 * colorful card / section backdrop. Pass your own `colors`, or use the brand-tinted
 * default. Optional slow drift.
 *
 * SSR-safe (gradients composed during render), drift pauses under reduced-motion.
 * Background by default — children render on top.
 */
export const MeshGradient = forwardRef<HTMLDivElement, MeshGradientProps>(
  function MeshGradient(
    {
      colors = DEFAULT_COLORS,
      animated = false,
      radius = "xl",
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const used = colors.slice(0, POINTS.length);
    const layers = used
      .map((c, i) => {
        const p = POINTS[i];
        return `radial-gradient(circle at ${p.x} ${p.y}, ${c} 0%, transparent 55%)`;
      })
      .join(", ");

    return (
      <div
        ref={ref}
        className={cn(
          "nova-mesh-gradient",
          animated && "nova-mesh-gradient--animated",
          className
        )}
        style={
          {
            "--nova-mesh-layers": layers,
            "--nova-mesh-radius": RADII[radius],
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-mesh-gradient__bg" aria-hidden="true" />
        {children}
      </div>
    );
  }
);
