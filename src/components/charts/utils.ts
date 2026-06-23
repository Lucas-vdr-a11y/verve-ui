/**
 * Shared, pure (window-free) helpers for the charts category.
 * No React, no DOM — safe for SSR and unit use.
 */

/** Semantic single-tone names used across charts. */
export type ChartTone =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

/** Maps a tone to its semantic color token. */
export const TONE_VAR: Record<ChartTone, string> = {
  brand: "var(--nova-primary)",
  success: "var(--nova-success)",
  warning: "var(--nova-warning)",
  danger: "var(--nova-danger)",
  info: "var(--nova-info)",
  neutral: "var(--nova-text-muted)",
};

/**
 * Categorical palette for multi-series charts. Charts legitimately need a
 * stable set of distinguishable hues, so we reference the raw scale tokens
 * here (allowed for charts only).
 */
export const CATEGORICAL_PALETTE: string[] = [
  "var(--nova-brand-500)",
  "var(--nova-success-500)",
  "var(--nova-warning-500)",
  "var(--nova-danger-500)",
  "var(--nova-info-500)",
  "var(--nova-brand-300)",
];

/** Returns the palette color for a given series index, cycling as needed. */
export function paletteColor(index: number): string {
  return CATEGORICAL_PALETTE[
    ((index % CATEGORICAL_PALETTE.length) + CATEGORICAL_PALETTE.length) %
      CATEGORICAL_PALETTE.length
  ];
}

/** Resolves a tone to a color string. */
export function toneColor(tone: ChartTone | undefined, fallback: string): string {
  return tone ? TONE_VAR[tone] : fallback;
}

/** Clamp a number to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Format a number compactly without locale/window assumptions. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000)
    return trimZero(value / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return trimZero(value / 1_000_000) + "M";
  if (abs >= 1_000) return trimZero(value / 1_000) + "k";
  return trimZero(value);
}

function trimZero(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Cartesian point on a circle. Angle in degrees, 0° at 12 o'clock,
 * increasing clockwise.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * SVG arc path between two angles (degrees, clockwise from 12 o'clock).
 * `inner` > 0 produces a donut ring segment; `inner` === 0 produces a pie wedge.
 */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  startAngle: number,
  endAngle: number
): string {
  const sweep = endAngle - startAngle;
  // Guard full-circle: SVG can't draw a 360° arc in one command.
  const safeEnd = sweep >= 360 ? startAngle + 359.999 : endAngle;
  const largeArc = safeEnd - startAngle > 180 ? 1 : 0;

  const oStart = polarToCartesian(cx, cy, outer, startAngle);
  const oEnd = polarToCartesian(cx, cy, outer, safeEnd);

  if (inner <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${oStart.x} ${oStart.y}`,
      `A ${outer} ${outer} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
      "Z",
    ].join(" ");
  }

  const iStart = polarToCartesian(cx, cy, inner, safeEnd);
  const iEnd = polarToCartesian(cx, cy, inner, startAngle);
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outer} ${outer} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${iEnd.x} ${iEnd.y}`,
    "Z",
  ].join(" ");
}

/**
 * Build an SVG path `d` string from points. When `smooth` is true a
 * Catmull-Rom spline is converted to cubic béziers for a soft curve.
 */
export function buildLinePath(
  points: { x: number; y: number }[],
  smooth = false
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (!smooth) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Stable unique id helper for gradient/clip defs (deterministic, SSR-safe). */
let idCounter = 0;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
