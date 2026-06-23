import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./DottedGlobe.css";

export interface DottedGlobeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of latitude bands. Defaults `14`. */
  rings?: number;
  /** Dots per latitude band (at the equator). Defaults `34`. */
  density?: number;
  /** Dot color. Any CSS color. Defaults the brand color. */
  color?: string;
  /** Seconds for one full rotation. Defaults `28`. */
  duration?: number;
  /** Globe diameter in px. Defaults `260`. */
  size?: number;
}

interface Dot {
  /** Rotation about the vertical (Y) axis, degrees. */
  ry: number;
  /** Latitude tilt about the X axis, degrees. */
  rx: number;
}

/**
 * A rotating sphere of dots — a lightweight "globe of points". Dots are placed on
 * a lat/long grid and positioned with CSS 3D transforms (rotateY → rotateX →
 * translateZ) inside a `preserve-3d` stage that slowly spins. No three.js, no
 * canvas.
 *
 * SSR-safe: the dot layout is computed deterministically during render (no window
 * access). The spin freezes under reduced-motion via CSS. Decorative — aria-hidden.
 */
export const DottedGlobe = forwardRef<HTMLDivElement, DottedGlobeProps>(
  function DottedGlobe(
    {
      rings = 14,
      density = 34,
      color = "var(--nova-primary)",
      duration = 28,
      size = 260,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const dots = useMemo<Dot[]>(() => {
      const out: Dot[] = [];
      for (let i = 0; i < rings; i++) {
        // Latitude from -90..+90 degrees, skipping exact poles for spread.
        const latDeg = -90 + (180 * (i + 0.5)) / rings;
        const cosLat = Math.cos((latDeg * Math.PI) / 180);
        const count = Math.max(1, Math.round(density * cosLat));
        for (let j = 0; j < count; j++) {
          out.push({ ry: (360 * j) / count, rx: latDeg });
        }
      }
      return out;
    }, [rings, density]);

    const radius = size / 2;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-globe", className)}
        style={
          {
            "--nova-globe-color": color,
            "--nova-globe-dur": `${duration}s`,
            "--nova-globe-size": `${size}px`,
            "--nova-globe-radius": `${radius}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-globe__stage">
          <div className="nova-globe__spin">
            {dots.map((d, i) => (
              <span
                key={i}
                className="nova-globe__dot"
                style={
                  {
                    transform: `rotateY(${d.ry}deg) rotateX(${d.rx}deg) translateZ(var(--nova-globe-radius))`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);
