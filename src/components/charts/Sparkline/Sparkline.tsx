import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import {
  buildLinePath,
  toneColor,
  type ChartTone,
} from "../utils";
import "./Sparkline.css";

export interface SparklineProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** Series values, left to right. */
  data: number[];
  /** Intrinsic width in px (also the viewBox width). Default `120`. */
  width?: number;
  /** Intrinsic height in px (also the viewBox height). Default `32`. */
  height?: number;
  /** Stroke color tone. Default `"brand"`. */
  tone?: ChartTone;
  /** Stroke width in user units. Default `2`. */
  strokeWidth?: number;
  /** Render a soft Catmull-Rom curve instead of straight segments. */
  smooth?: boolean;
  /** Fill the area below the line with a faded tone. */
  area?: boolean;
  /** Draw a dot on the last data point. */
  showLastPoint?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * Sparkline — a tiny, inline, axis-free line chart.
 *
 * Pure SVG, responsive via `viewBox` (scales to its container width while
 * keeping `width`/`height` as the intrinsic aspect ratio).
 */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(
  function Sparkline(
    {
      data,
      width = 120,
      height = 32,
      tone = "brand",
      strokeWidth = 2,
      smooth = false,
      area = false,
      showLastPoint = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const gid = useId();
    const stroke = toneColor(tone, "var(--nova-primary)");

    const pad = strokeWidth + (showLastPoint ? strokeWidth : 0);
    const innerW = Math.max(1, width - pad * 2);
    const innerH = Math.max(1, height - pad * 2);

    const min = data.length ? Math.min(...data) : 0;
    const max = data.length ? Math.max(...data) : 0;
    const span = max - min || 1;

    const points = data.map((v, i) => ({
      x: pad + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: pad + innerH - ((v - min) / span) * innerH,
    }));

    const linePath = buildLinePath(points, smooth);
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${pad + innerH} L ${
            points[0].x
          } ${pad + innerH} Z`
        : "";

    const last = points[points.length - 1];
    const summary =
      ariaLabel ??
      (data.length
        ? `Sparkline, ${data.length} points, from ${data[0]} to ${
            data[data.length - 1]
          }`
        : "Sparkline, no data");

    return (
      <svg
        ref={ref}
        className={cn("nova-sparkline", className)}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={summary}
        style={{ color: stroke }}
        {...rest}
      >
        {area && areaPath && (
          <>
            <defs>
              <linearGradient
                id={`${gid}-fill`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity="0.28"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path
              className="nova-sparkline__area"
              d={areaPath}
              fill={`url(#${gid}-fill)`}
            />
          </>
        )}
        {points.length > 0 && (
          <path
            className="nova-sparkline__line"
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {showLastPoint && last && (
          <circle
            className="nova-sparkline__dot"
            cx={last.x}
            cy={last.y}
            r={strokeWidth * 1.4}
            fill="currentColor"
          />
        )}
      </svg>
    );
  }
);
