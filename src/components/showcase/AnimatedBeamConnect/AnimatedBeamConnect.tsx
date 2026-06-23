import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedBeamConnect.css";

export interface AnimatedBeamConnectProps
  extends React.SVGAttributes<SVGSVGElement> {
  /** The positioned container both nodes live inside (provides the coordinate space). */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Source node. */
  fromRef: React.RefObject<HTMLElement | null>;
  /** Destination node. */
  toRef: React.RefObject<HTMLElement | null>;
  /** Curvature of the path; positive bows downward. Defaults `40`. */
  curvature?: number;
  /** Reverse the beam's travel direction. Defaults `false`. */
  reverse?: boolean;
  /** Seconds for one beam traversal. Defaults `3`. */
  duration?: number;
  /** Static resting path color. Defaults a subtle border token. */
  pathColor?: string;
  /** Beam gradient start color. */
  gradientStart?: string;
  /** Beam gradient stop color. */
  gradientStop?: string;
  /** Stroke width of the path/beam. Defaults `2`. */
  pathWidth?: number;
  /** Offset (px) applied to the source anchor. */
  startXOffset?: number;
  startYOffset?: number;
  /** Offset (px) applied to the destination anchor. */
  endXOffset?: number;
  endYOffset?: number;
}

interface Geometry {
  width: number;
  height: number;
  d: string;
}

/**
 * Draws an animated glowing beam (a curved SVG path with a travelling gradient)
 * connecting two node elements by ref within a positioned container — the Magic
 * UI animated-beam. Positions are measured against the container and kept in
 * sync via ResizeObserver + window resize. SSR-safe (all measurement in
 * effects). Reduced motion renders a static resting path.
 */
export const AnimatedBeamConnect = forwardRef<
  SVGSVGElement,
  AnimatedBeamConnectProps
>(function AnimatedBeamConnect(
  {
    containerRef,
    fromRef,
    toRef,
    curvature = 40,
    reverse = false,
    duration = 3,
    pathColor,
    gradientStart = "#818cf8",
    gradientStop = "#6366f1",
    pathWidth = 2,
    startXOffset = 0,
    startYOffset = 0,
    endXOffset = 0,
    endYOffset = 0,
    className,
    style,
    ...rest
  },
  ref
) {
  const rawId = useId();
  const gradientId = `nova-beam-grad-${rawId.replace(/:/g, "")}`;
  const [geo, setGeo] = useState<Geometry | null>(null);

  // Track the latest config in a ref so the measure callback stays stable.
  const cfg = useRef({
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  });
  cfg.current = {
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  };

  useEffect(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;

    const measure = () => {
      const cRect = container.getBoundingClientRect();
      const aRect = from.getBoundingClientRect();
      const bRect = to.getBoundingClientRect();
      const c = cfg.current;

      const startX = aRect.left - cRect.left + aRect.width / 2 + c.startXOffset;
      const startY = aRect.top - cRect.top + aRect.height / 2 + c.startYOffset;
      const endX = bRect.left - cRect.left + bRect.width / 2 + c.endXOffset;
      const endY = bRect.top - cRect.top + bRect.height / 2 + c.endYOffset;

      const controlX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2 - c.curvature;

      setGeo({
        width: cRect.width,
        height: cRect.height,
        d: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`,
      });
    };

    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(container);
      ro.observe(from);
      ro.observe(to);
    }
    window.addEventListener("resize", measure);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, fromRef, toRef]);

  if (!geo) {
    // Render an empty, correctly-classed svg until measured (keeps layout/SSR safe).
    return (
      <svg
        ref={ref}
        className={cn("nova-animated-beam", className)}
        fill="none"
        {...rest}
      />
    );
  }

  return (
    <svg
      ref={ref}
      className={cn("nova-animated-beam", className)}
      width={geo.width}
      height={geo.height}
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      fill="none"
      style={style}
      {...rest}
    >
      {/* Resting path. */}
      <path
        d={geo.d}
        stroke={pathColor ?? "var(--nova-border-strong)"}
        strokeWidth={pathWidth}
        strokeOpacity={0.3}
        strokeLinecap="round"
      />
      {/* Travelling beam. */}
      <path
        d={geo.d}
        stroke={`url(#${gradientId})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          className={cn(
            "nova-animated-beam__gradient",
            reverse && "nova-animated-beam__gradient--reverse"
          )}
          style={
            { "--nova-beam-duration": `${duration}s` } as React.CSSProperties
          }
          x1="0%"
          x2="0%"
          y1="0%"
          y2="0%"
        >
          <stop stopColor={gradientStart} stopOpacity="0" />
          <stop stopColor={gradientStart} />
          <stop offset="32.5%" stopColor={gradientStop} />
          <stop offset="100%" stopColor={gradientStop} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
});
