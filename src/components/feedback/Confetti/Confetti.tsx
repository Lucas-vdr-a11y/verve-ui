import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Confetti.css";

/** Imperative handle exposed via ref. */
export interface ConfettiHandle {
  /** Spawn a fresh burst of confetti pieces. */
  fire: () => void;
}

/** Origin of the burst, as fractions (0–1) of the container box. */
export interface ConfettiOrigin {
  x?: number;
  y?: number;
}

export interface ConfettiProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When toggled to `true`, fires a burst. Each rising edge (false→true)
   * triggers a new burst. You can also fire imperatively via the ref.
   */
  fire?: boolean;
  /** Number of pieces per burst. Defaults to `80`. */
  pieceCount?: number;
  /** Lifetime of each piece in ms. Defaults to `2400`. */
  duration?: number;
  /** Origin point as fractions of the box (0–1). Defaults to centered top. */
  origin?: ConfettiOrigin;
}

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  scale: number;
  color: string;
  shape: "rect" | "circle";
}

/** Tone/brand scale tokens — Confetti MAY use these for piece colors. */
const PIECE_COLORS = [
  "var(--nova-primary)",
  "var(--nova-success)",
  "var(--nova-warning)",
  "var(--nova-danger)",
  "var(--nova-info)",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let pieceSeq = 0;

function buildPieces(
  count: number,
  duration: number,
  origin: ConfettiOrigin
): Piece[] {
  const ox = (origin.x ?? 0.5) * 100;
  const oy = (origin.y ?? 0) * 100;
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      id: pieceSeq++,
      left: ox + (Math.random() - 0.5) * 30,
      delay: Math.random() * 150,
      duration: duration * (0.7 + Math.random() * 0.5),
      drift: (Math.random() - 0.5) * 240,
      rotate: (Math.random() - 0.5) * 720,
      scale: 0.6 + Math.random() * 0.8,
      color: PIECE_COLORS[i % PIECE_COLORS.length],
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
    // origin y nudges the start position
    pieces[i].delay += oy * 0.5;
  }
  return pieces;
}

export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(
  function Confetti(
    {
      fire = false,
      pieceCount = 80,
      duration = 2400,
      origin,
      className,
      ...rest
    },
    ref
  ) {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevFire = useRef(false);

    const clearTimer = useCallback(() => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const doFire = useCallback(() => {
      if (prefersReducedMotion()) return; // no-op under reduced motion
      const next = buildPieces(pieceCount, duration, origin ?? {});
      setPieces(next);
      clearTimer();
      const maxLife =
        next.reduce((m, p) => Math.max(m, p.delay + p.duration), 0) + 100;
      timerRef.current = setTimeout(() => {
        setPieces([]); // cleanup spent pieces
        timerRef.current = null;
      }, maxLife);
    }, [pieceCount, duration, origin, clearTimer]);

    useImperativeHandle(ref, () => ({ fire: doFire }), [doFire]);

    // Fire on rising edge of the `fire` prop.
    useEffect(() => {
      if (fire && !prevFire.current) doFire();
      prevFire.current = fire;
    }, [fire, doFire]);

    useEffect(() => () => clearTimer(), [clearTimer]);

    return (
      <div
        className={cn("nova-confetti", className)}
        aria-hidden="true"
        {...rest}
      >
        {pieces.map((p) => (
          <span
            key={p.id}
            className={cn(
              "nova-confetti__piece",
              `nova-confetti__piece--${p.shape}`
            )}
            style={
              {
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}ms`,
                animationDuration: `${p.duration}ms`,
                "--nova-confetti-drift": `${p.drift}px`,
                "--nova-confetti-rotate": `${p.rotate}deg`,
                "--nova-confetti-scale": p.scale,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }
);
