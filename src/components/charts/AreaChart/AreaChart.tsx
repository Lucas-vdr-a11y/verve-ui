import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { LineChart, type LineChartProps } from "../LineChart";
import "./AreaChart.css";

export interface AreaChartProps
  extends Omit<LineChartProps, "area"> {}

/**
 * AreaChart — filled-area variant of {@link LineChart}.
 *
 * Shipped as its own component so the area look (gradient fill under each
 * series, smoothing on by default) is a first-class chart. It composes
 * `LineChart` with `area` forced on. The gradient fill is defined per-series
 * inside `LineChart` using token-driven `currentColor` stops.
 */
export const AreaChart = forwardRef<SVGSVGElement, AreaChartProps>(
  function AreaChart(
    { smooth = true, showGrid = true, className, ...rest },
    ref
  ) {
    return (
      <LineChart
        ref={ref}
        area
        smooth={smooth}
        showGrid={showGrid}
        className={cn("nova-area-chart", className)}
        {...rest}
      />
    );
  }
);
