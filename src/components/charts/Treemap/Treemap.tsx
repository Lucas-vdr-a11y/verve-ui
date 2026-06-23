import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import {
  formatNumber,
  paletteColor,
  toneColor,
  type ChartTone,
} from "../utils";
import "./Treemap.css";

export interface TreemapDatum {
  /** Cell label. */
  label: string;
  /** Value driving the cell area (must be >= 0). */
  value: number;
  /** Optional tone override; otherwise the categorical palette is used. */
  tone?: ChartTone;
  /** Optional explicit color, overrides tone/palette. */
  color?: string;
}

export interface TreemapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Cells to lay out, sized by value. */
  data: TreemapDatum[];
  /** Intrinsic width (viewBox). Default `480`. */
  width?: number;
  /** Intrinsic height (viewBox). Default `300`. */
  height?: number;
  /** Gap between cells in user units. Default `2`. */
  padding?: number;
  /** Corner radius of cells in user units. Default `3`. */
  cellRadius?: number;
  /** Show labels inside cells. Default `true`. */
  showLabels?: boolean;
  /** Show values inside cells. Default `true`. */
  showValues?: boolean;
  /** Accessible label. Falls back to a generated summary. */
  "aria-label"?: string;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedCell extends Rect {
  datum: TreemapDatum;
  index: number;
}

/** Worst aspect ratio of a row given the side it is laid along. */
function worst(row: number[], side: number, sum: number): number {
  if (row.length === 0 || sum === 0) return Infinity;
  const max = Math.max(...row);
  const min = Math.min(...row);
  const s2 = sum * sum;
  const side2 = side * side;
  return Math.max((side2 * max) / s2, s2 / (side2 * min));
}

/** Squarified treemap layout (Bruls, Huizing, van Wijk). Pure math, SSR-safe. */
function squarify(
  values: { value: number; index: number }[],
  rect: Rect
): PlacedCell[] {
  const total = values.reduce((s, v) => s + v.value, 0);
  if (total <= 0) return [];
  // Scale values to area units of the rect.
  const scale = (rect.w * rect.h) / total;
  const items = values.map((v) => ({ ...v, area: v.value * scale }));

  const placed: { area: number; index: number; rect: Rect }[] = [];
  let free: Rect = { ...rect };
  let i = 0;

  while (i < items.length) {
    const row: number[] = [];
    const rowItems: { area: number; index: number }[] = [];
    const side = Math.min(free.w, free.h);
    let rowSum = 0;

    // Grow the row while aspect ratios keep improving.
    while (i < items.length) {
      const next = items[i];
      const withNext = [...row, next.area];
      if (
        row.length === 0 ||
        worst(withNext, side, rowSum + next.area) <=
          worst(row, side, rowSum)
      ) {
        row.push(next.area);
        rowItems.push({ area: next.area, index: next.index });
        rowSum += next.area;
        i += 1;
      } else {
        break;
      }
    }

    // Lay the completed row along the shorter side.
    const horizontal = free.w >= free.h;
    const thickness = rowSum / (horizontal ? free.h : free.w);
    let offset = horizontal ? free.y : free.x;
    for (const it of rowItems) {
      const length = it.area / (thickness || 1);
      if (horizontal) {
        placed.push({
          area: it.area,
          index: it.index,
          rect: { x: free.x, y: offset, w: thickness, h: length },
        });
        offset += length;
      } else {
        placed.push({
          area: it.area,
          index: it.index,
          rect: { x: offset, y: free.y, w: length, h: thickness },
        });
        offset += length;
      }
    }

    // Shrink the free rect by the row thickness.
    if (horizontal) {
      free = { x: free.x + thickness, y: free.y, w: free.w - thickness, h: free.h };
    } else {
      free = { x: free.x, y: free.y + thickness, w: free.w, h: free.h - thickness };
    }
  }

  return placed.map((p) => ({
    ...p.rect,
    datum: { label: "", value: 0 },
    index: p.index,
  }));
}

/**
 * Treemap — nested rectangles sized by value via a squarified layout. Single
 * level, pure SVG, tone/palette fills, labels and values inside cells.
 */
export const Treemap = forwardRef<HTMLDivElement, TreemapProps>(function Treemap(
  {
    data,
    width = 480,
    height = 300,
    padding = 2,
    cellRadius = 3,
    showLabels = true,
    showValues = true,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const positive = data
    .map((d, index) => ({ value: Math.max(0, d.value), index }))
    .filter((d) => d.value > 0);

  const layout = squarify(positive, { x: 0, y: 0, w: width, h: height });
  const cells: PlacedCell[] = layout.map((c) => ({
    ...c,
    datum: data[c.index],
  }));

  const colorFor = (d: TreemapDatum, i: number) =>
    d.color ?? (d.tone ? toneColor(d.tone, paletteColor(i)) : paletteColor(i));

  const summary =
    ariaLabel ??
    `Treemap with ${data.length} cells: ` +
      data.map((d) => `${d.label} ${formatNumber(d.value)}`).join(", ");

  return (
    <div ref={ref} className={cn("nova-treemap", className)} {...rest}>
      <svg
        className="nova-treemap__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
      >
        {cells.map((c) => {
          const px = c.x + padding / 2;
          const py = c.y + padding / 2;
          const pw = Math.max(0, c.w - padding);
          const ph = Math.max(0, c.h - padding);
          const fill = colorFor(c.datum, c.index);
          const canLabel = pw > 36 && ph > 22;
          return (
            <g key={`cell-${c.index}`} className="nova-treemap__group">
              <rect
                className="nova-treemap__cell"
                x={px}
                y={py}
                width={pw}
                height={ph}
                rx={Math.min(cellRadius, pw / 2, ph / 2)}
                fill={fill}
              >
                <title>{`${c.datum.label}: ${formatNumber(c.datum.value)}`}</title>
              </rect>
              {showLabels && canLabel && (
                <text
                  className="nova-treemap__label"
                  x={px + 6}
                  y={py + 16}
                >
                  {c.datum.label}
                </text>
              )}
              {showValues && canLabel && ph > 36 && (
                <text
                  className="nova-treemap__value"
                  x={px + 6}
                  y={py + 32}
                >
                  {formatNumber(c.datum.value)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <table className="nova-visually-hidden">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={`row-${i}`}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
