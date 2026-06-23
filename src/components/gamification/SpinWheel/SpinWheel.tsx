import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./SpinWheel.css";

export interface SpinWheelSegment {
  /** Label rendered on the wedge. */
  label: string;
  /** Optional explicit wedge color (CSS color). Falls back to a palette. */
  color?: string;
  /** Arbitrary value passed back through `onResult`. */
  value?: unknown;
}

export interface SpinWheelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onResult"> {
  /** Wedges around the wheel (min 2). */
  segments: SpinWheelSegment[];
  /** Diameter in px. Defaults to `260`. */
  size?: number;
  /** Force a landing segment index. Omit for a random pick. */
  targetIndex?: number;
  /** Spin duration in ms. Defaults to `4000`. */
  duration?: number;
  /** Label for the spin button. Defaults to `"Spin"`. */
  spinLabel?: string;
  /** Fired with the winning segment + its index once the wheel settles. */
  onResult?: (segment: SpinWheelSegment, index: number) => void;
}

const PALETTE = [
  "#10b981",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#0ea5e9",
  "#14b8a6",
  "#ec4899",
  "#14b8a6",
];

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
};

export const SpinWheel = forwardRef<HTMLDivElement, SpinWheelProps>(
  function SpinWheel(
    {
      segments,
      size = 260,
      targetIndex,
      duration = 4000,
      spinLabel = "Spin",
      onResult,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [angle, setAngle] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const rafRef = useRef<number | null>(null);
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;

    const n = Math.max(segments.length, 1);
    const slice = 360 / n;

    useEffect(
      () => () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      },
      []
    );

    const settle = useCallback(
      (index: number, finalAngle: number) => {
        setAngle(finalAngle);
        setSpinning(false);
        onResultRef.current?.(segments[index], index);
      },
      [segments]
    );

    const spin = useCallback(() => {
      if (spinning || n < 2) return;

      const index =
        targetIndex != null
          ? ((targetIndex % n) + n) % n
          : Math.floor(Math.random() * n);

      // Pointer sits at top (12 o'clock). Rotate so the chosen slice center
      // aligns to the pointer.
      const sliceCenter = index * slice + slice / 2;
      const base = angle - (angle % 360);

      if (reduced || typeof requestAnimationFrame === "undefined") {
        const final = base + 360 - sliceCenter;
        settle(index, final);
        return;
      }

      const turns = 5;
      const start = angle;
      const target = base + turns * 360 + (360 - sliceCenter);
      const startTime = performance.now();
      setSpinning(true);

      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = easeOutQuart(t);
        setAngle(start + (target - start) * eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          settle(index, target);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, [angle, duration, n, reduced, settle, slice, spinning, targetIndex]);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;

    return (
      <div
        ref={ref}
        className={cn("nova-spin-wheel", className)}
        style={{ width: size }}
        {...rest}
      >
        <div className="nova-spin-wheel__stage" style={{ width: size, height: size }}>
          <span className="nova-spin-wheel__pointer" aria-hidden="true" />
          <svg
            className="nova-spin-wheel__svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`Prize wheel with ${n} segments`}
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {segments.map((seg, i) => {
              const startDeg = i * slice;
              const endDeg = startDeg + slice;
              const [x1, y1] = polar(cx, cy, r, startDeg);
              const [x2, y2] = polar(cx, cy, r, endDeg);
              const large = slice > 180 ? 1 : 0;
              const fill = seg.color ?? PALETTE[i % PALETTE.length];
              const [tx, ty] = polar(cx, cy, r * 0.62, startDeg + slice / 2);
              const rot = startDeg + slice / 2;
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                    fill={fill}
                    stroke="rgb(255 255 255 / 0.6)"
                    strokeWidth="1"
                  />
                  <text
                    className="nova-spin-wheel__label"
                    x={tx}
                    y={ty}
                    transform={`rotate(${rot} ${tx} ${ty})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={r * 0.12} className="nova-spin-wheel__hub" />
          </svg>
        </div>
        <button
          type="button"
          className="nova-spin-wheel__button"
          onClick={spin}
          disabled={spinning || n < 2}
          aria-busy={spinning}
        >
          {spinning ? "Spinning…" : spinLabel}
        </button>
      </div>
    );
  }
);
