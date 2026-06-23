import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LogoOrbit.css";

export interface OrbitRing {
  /** Items placed evenly around this ring. */
  items: React.ReactNode[];
  /** Ring radius in px. */
  radius: number;
  /** Seconds for one full revolution. Defaults `20`. */
  duration?: number;
  /** Spin clockwise instead of counter-clockwise. Defaults `false`. */
  reverse?: boolean;
  /** Starting angle offset in degrees. Defaults `0`. */
  startAngle?: number;
}

export interface LogoOrbitProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Center brand mark. */
  center?: React.ReactNode;
  /** Concentric rings of orbiting items. */
  rings: OrbitRing[];
  /** Overall size (width/height) of the orbit field in px. Defaults `2x largest radius + 80`. */
  size?: number;
  /** Render the faint ring path guides. Defaults `true`. */
  showPaths?: boolean;
}

/**
 * Logos/icons orbiting in concentric rings around a center brand mark — the
 * Magic UI orbiting circles applied to a logo cloud. Each ring rotates as a
 * whole while every item counter-rotates so it stays upright. Pure CSS
 * animation; reduced motion freezes the rings into a static constellation.
 */
export const LogoOrbit = forwardRef<HTMLDivElement, LogoOrbitProps>(
  function LogoOrbit(
    { center, rings, size, showPaths = true, className, style, ...rest },
    ref
  ) {
    const maxRadius = rings.reduce((m, r) => Math.max(m, r.radius), 0);
    const field = size ?? maxRadius * 2 + 80;

    return (
      <div
        ref={ref}
        className={cn("nova-logo-orbit", className)}
        style={
          {
            "--nova-orbit-size": `${field}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {showPaths &&
          rings.map((ring, i) => (
            <span
              key={`path-${i}`}
              className="nova-logo-orbit__path"
              aria-hidden="true"
              style={
                {
                  width: `${ring.radius * 2}px`,
                  height: `${ring.radius * 2}px`,
                } as React.CSSProperties
              }
            />
          ))}

        {center != null && (
          <div className="nova-logo-orbit__center">{center}</div>
        )}

        {rings.map((ring, ringIndex) => {
          const {
            items,
            radius,
            duration = 20,
            reverse = false,
            startAngle = 0,
          } = ring;
          const count = items.length || 1;
          return (
            <div
              key={ringIndex}
              className={cn(
                "nova-logo-orbit__ring",
                reverse && "nova-logo-orbit__ring--reverse"
              )}
              style={
                {
                  "--nova-orbit-duration": `${duration}s`,
                  "--nova-orbit-radius": `${radius}px`,
                } as React.CSSProperties
              }
            >
              {items.map((item, i) => {
                const angle = startAngle + (360 / count) * i;
                return (
                  <span
                    key={i}
                    className="nova-logo-orbit__slot"
                    style={
                      { "--nova-orbit-angle": `${angle}deg` } as React.CSSProperties
                    }
                  >
                    <span className="nova-logo-orbit__item">{item}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
);
