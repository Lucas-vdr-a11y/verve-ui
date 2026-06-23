import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ConfettiButton.css";

export interface ConfettiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number of confetti pieces per burst. Defaults `14`. */
  pieces?: number;
  /** Burst spread radius (px). Defaults `90`. */
  spread?: number;
  /** Confetti colors cycled across pieces. */
  colors?: string[];
  children?: React.ReactNode;
}

interface Burst {
  id: number;
  bits: { angle: number; dist: number; color: string; delay: number }[];
}

const DEFAULT_COLORS = [
  "var(--nova-brand-400)",
  "var(--nova-info-500)",
  "var(--nova-success-500)",
  "var(--nova-warning-500)",
  "var(--nova-danger-500)",
];

const BURST_MS = 900;

/**
 * A button that pops a small confetti burst from its center on click. Each
 * burst is a set of DOM spans flung outward along randomized angles/distances
 * (driven by per-piece CSS variables) and gravity-dropped; the whole burst is
 * removed after its animation via a tracked timer, with all timers cleared on
 * unmount.
 *
 * Real `<button>`. Under reduced motion no confetti is emitted.
 */
export const ConfettiButton = forwardRef<
  HTMLButtonElement,
  ConfettiButtonProps
>(function ConfettiButton(
  {
    pieces = 14,
    spread = 90,
    colors = DEFAULT_COLORS,
    className,
    children,
    onClick,
    style,
    type,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    []
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (reduced) return;
      const n = Math.max(1, Math.min(40, pieces));
      const bits = Array.from({ length: n }, (_, i) => ({
        angle: (i / n) * 360 + (Math.random() * 40 - 20),
        dist: spread * (0.5 + Math.random() * 0.5),
        color: colors[i % colors.length],
        delay: Math.random() * 60,
      }));
      const id = idRef.current++;
      setBursts((prev) => [...prev, { id, bits }]);
      const t = setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
        timers.current.delete(t);
      }, BURST_MS);
      timers.current.add(t);
    },
    [colors, onClick, pieces, reduced, spread]
  );

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn("nova-confetti", className)}
      onClick={handleClick}
      style={style}
      {...rest}
    >
      <span className="nova-confetti__label">{children}</span>
      <span className="nova-confetti__layer" aria-hidden="true">
        {bursts.map((b) =>
          b.bits.map((bit, i) => (
            <span
              key={`${b.id}-${i}`}
              className="nova-confetti__bit"
              style={
                {
                  "--nova-cf-x": `${Math.cos((bit.angle * Math.PI) / 180) * bit.dist}px`,
                  "--nova-cf-y": `${Math.sin((bit.angle * Math.PI) / 180) * bit.dist}px`,
                  "--nova-cf-rot": `${Math.random() * 720 - 360}deg`,
                  background: bit.color,
                  animationDelay: `${bit.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))
        )}
      </span>
    </button>
  );
});
