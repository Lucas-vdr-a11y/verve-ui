import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./WaveDivider.css";

export interface WaveDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Which edge the wave sits on. `"bottom"` curves the section below. Defaults `"bottom"`. */
  edge?: "top" | "bottom";
  /** Wave height in px (the SVG viewport height). Defaults `80`. */
  height?: number;
  /** Wave amplitude as a 0–1 fraction of height. Defaults `0.5`. */
  amplitude?: number;
  /** Flip the wave horizontally (mirror the crests). Defaults `false`. */
  flip?: boolean;
  /** Fill color. Defaults a surface token so the wave blends sections. */
  color?: string;
  /** Slowly drift the wave sideways (CSS animation). Defaults `false`. */
  animated?: boolean;
  /** Render a softer layered wave behind the main one for depth. Defaults `false`. */
  layered?: boolean;
}

/** Build a smooth wave path across a 1440-wide viewbox. */
function wavePath(h: number, amp: number, edge: "top" | "bottom"): string {
  const a = Math.max(0, Math.min(1, amp)) * h * 0.5;
  const mid = h / 2;
  // Two full crests using cubic beziers.
  const top = `M0 ${mid} C 240 ${mid - a}, 480 ${mid + a}, 720 ${mid} S 1200 ${mid - a}, 1440 ${mid}`;
  return edge === "bottom"
    ? `${top} V ${h} H 0 Z`
    : `${top} V 0 H 0 Z`;
}

/**
 * An SVG wave section divider for the top or bottom edge of a section. Configurable
 * amplitude, color (defaults to a surface token so it blends), an optional drift
 * animation, and a layered variant for depth.
 *
 * SSR-safe (path computed during render). Drift pauses under reduced-motion.
 * Decorative — aria-hidden.
 */
export const WaveDivider = forwardRef<HTMLDivElement, WaveDividerProps>(
  function WaveDivider(
    {
      edge = "bottom",
      height = 80,
      amplitude = 0.5,
      flip = false,
      color = "var(--nova-surface)",
      animated = false,
      layered = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const id = useId();
    const main = wavePath(height, amplitude, edge);
    const back = wavePath(height, amplitude * 0.65, edge);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-wave-divider",
          `nova-wave-divider--${edge}`,
          flip && "nova-wave-divider--flip",
          animated && "nova-wave-divider--animated",
          className
        )}
        style={
          {
            "--nova-wave-color": color,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <svg
          className="nova-wave-divider__svg"
          viewBox={`0 0 1440 ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Tile two copies for seamless drift. */}
            <path id={`${id}-main`} d={main} />
            {layered && <path id={`${id}-back`} d={back} />}
          </defs>
          {layered && (
            <g className="nova-wave-divider__layer nova-wave-divider__layer--back">
              <use href={`#${id}-back`} x="0" />
              <use href={`#${id}-back`} x="1440" />
            </g>
          )}
          <g className="nova-wave-divider__layer nova-wave-divider__layer--main">
            <use href={`#${id}-main`} x="0" />
            <use href={`#${id}-main`} x="1440" />
          </g>
        </svg>
      </div>
    );
  }
);
