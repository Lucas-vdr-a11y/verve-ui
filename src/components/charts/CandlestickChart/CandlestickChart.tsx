import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { formatNumber, toneColor, type ChartTone } from "../utils";
import "./CandlestickChart.css";

export interface Candle {
  /** Period label (a11y/title), e.g. a date. */
  label?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Optional traded volume for the volume row. */
  volume?: number;
}

export interface CandlestickChartProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height"> {
  /** OHLC candles, one per period (left → right). */
  data: Candle[];
  /** Tone for up candles (close >= open). Default `"success"`. */
  upTone?: ChartTone;
  /** Tone for down candles (close < open). Default `"danger"`. */
  downTone?: ChartTone;
  /** Intrinsic width (viewBox). Default `480`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `300`. */
  height?: number;
  /** Gap between candles as a fraction of slot width (0–0.9). Default `0.3`. */
  gap?: number;
  /** Render a volume row beneath the price chart. Default `false`. */
  showVolume?: boolean;
  /** Horizontal price grid divisions. Default `4`. */
  gridLines?: number;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

/**
 * CandlestickChart — OHLC candles with high/low wicks and up/down coloring.
 * Optional volume row beneath. Pure SVG, responsive via `viewBox`.
 */
export const CandlestickChart = forwardRef<
  SVGSVGElement,
  CandlestickChartProps
>(function CandlestickChart(
  {
    data,
    upTone = "success",
    downTone = "danger",
    width = 480,
    height = 300,
    gap = 0.3,
    showVolume = false,
    gridLines = 4,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const padX = 12;
  const padTop = 12;
  const padBottom = 12;
  const volH = showVolume ? Math.round(height * 0.2) : 0;
  const volGap = showVolume ? 8 : 0;
  const plotW = Math.max(1, width - padX * 2);
  const priceH = Math.max(1, height - padTop - padBottom - volH - volGap);

  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const hi = highs.length ? Math.max(...highs) : 1;
  const lo = lows.length ? Math.min(...lows) : 0;
  const span = hi - lo || 1;

  const sy = (v: number) => padTop + priceH - ((v - lo) / span) * priceH;

  const volMax = showVolume
    ? Math.max(1, ...data.map((d) => d.volume ?? 0))
    : 1;
  const volTop = padTop + priceH + volGap;

  const slot = data.length ? plotW / data.length : plotW;
  const clampedGap = Math.min(0.9, Math.max(0, gap));
  const candleW = slot * (1 - clampedGap);

  const upColor = toneColor(upTone, "var(--nova-success)");
  const downColor = toneColor(downTone, "var(--nova-danger)");

  const summary =
    ariaLabel ??
    `Candlestick chart with ${data.length} periods. ` +
      data
        .map(
          (d, i) =>
            `${d.label ?? `#${i + 1}`}: O ${formatNumber(d.open)} H ${formatNumber(
              d.high
            )} L ${formatNumber(d.low)} C ${formatNumber(d.close)}`
        )
        .join("; ");

  return (
    <svg
      ref={ref}
      className={cn("nova-candlestick-chart", className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={summary}
      {...rest}
    >
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = padTop + (i / gridLines) * priceH;
        return (
          <line
            key={`grid-${i}`}
            className="nova-candlestick-chart__grid"
            x1={padX}
            y1={y}
            x2={padX + plotW}
            y2={y}
          />
        );
      })}

      {data.map((d, i) => {
        const cx = padX + i * slot + slot / 2;
        const up = d.close >= d.open;
        const color = up ? upColor : downColor;
        const bodyTop = sy(Math.max(d.open, d.close));
        const bodyBottom = sy(Math.min(d.open, d.close));
        const bodyH = Math.max(1, bodyBottom - bodyTop);
        const x = cx - candleW / 2;
        return (
          <g key={`candle-${i}`} className="nova-candlestick-chart__group">
            <line
              className="nova-candlestick-chart__wick"
              x1={cx}
              y1={sy(d.high)}
              x2={cx}
              y2={sy(d.low)}
              stroke={color}
            />
            <rect
              className="nova-candlestick-chart__body"
              x={x}
              y={bodyTop}
              width={Math.max(1, candleW)}
              height={bodyH}
              fill={color}
            >
              <title>{`${d.label ?? `#${i + 1}`} — O ${formatNumber(
                d.open
              )} H ${formatNumber(d.high)} L ${formatNumber(
                d.low
              )} C ${formatNumber(d.close)}`}</title>
            </rect>
            {showVolume && (
              <rect
                className="nova-candlestick-chart__volume"
                x={x}
                y={volTop + volH - ((d.volume ?? 0) / volMax) * volH}
                width={Math.max(1, candleW)}
                height={((d.volume ?? 0) / volMax) * volH}
                fill={color}
              >
                <title>{`Volume: ${formatNumber(d.volume ?? 0)}`}</title>
              </rect>
            )}
          </g>
        );
      })}

      {showVolume && (
        <line
          className="nova-candlestick-chart__baseline"
          x1={padX}
          y1={volTop + volH}
          x2={padX + plotW}
          y2={volTop + volH}
        />
      )}
    </svg>
  );
});
