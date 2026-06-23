import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./LikeButton.css";

export interface LikeButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled liked state. Omit for uncontrolled. */
  liked?: boolean;
  /** Initial liked state when uncontrolled. Defaults `false`. */
  defaultLiked?: boolean;
  /** Called with the next liked state on toggle. */
  onChange?: (liked: boolean) => void;
  /** Show a like count next to the heart that bumps on change. */
  count?: number;
  /** Number of particles flung on like. Defaults `8`. */
  particles?: number;
}

const BURST_MS = 700;

/**
 * A heart toggle that fills and bursts particles on like, with a satisfying
 * scale pop and an optional count that bumps. Particles are DOM spans flung
 * along even angles via per-piece CSS vars and removed after the burst through a
 * tracked timer (cleared on unmount). Controlled via `liked` or uncontrolled via
 * `defaultLiked`.
 *
 * Real `<button>` with `aria-pressed`. No burst/pop under reduced motion.
 */
export const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(
  function LikeButton(
    {
      liked: likedProp,
      defaultLiked = false,
      onChange,
      count,
      particles = 8,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = likedProp !== undefined;
    const [internalLiked, setInternalLiked] = useState(defaultLiked);
    const liked = isControlled ? likedProp : internalLiked;

    const [bursts, setBursts] = useState<number[]>([]);
    const idRef = useRef(0);
    const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(
      () => () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
      },
      []
    );

    const n = Math.max(0, Math.min(16, particles));

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !liked;
        if (!isControlled) setInternalLiked(next);
        onChange?.(next);

        if (next && !reduced && n > 0) {
          const id = idRef.current++;
          setBursts((prev) => [...prev, id]);
          const t = setTimeout(() => {
            setBursts((prev) => prev.filter((b) => b !== id));
            timers.current.delete(t);
          }, BURST_MS);
          timers.current.add(t);
        }
      },
      [isControlled, liked, n, onChange, onClick, reduced]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-like", liked && "nova-like--on", className)}
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={ariaLabel ?? (liked ? "Unlike" : "Like")}
        {...rest}
      >
        <span className="nova-like__heart-wrap" aria-hidden="true">
          <svg className="nova-like__heart" viewBox="0 0 24 24">
            <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.4 5.7 4.2 4.7 6.3 4 8.5 4.9 9.8 6.7L12 9.6l2.2-2.9c1.3-1.8 3.5-2.7 5.6-2 2.8 1 3.6 4.3 2.2 7.1C19.5 16.4 12 21 12 21z" />
          </svg>
          <span className="nova-like__burst">
            {bursts.map((id) =>
              Array.from({ length: n }, (_, i) => (
                <span
                  key={`${id}-${i}`}
                  className="nova-like__particle"
                  style={
                    {
                      "--nova-like-angle": `${(i / n) * 360}deg`,
                    } as React.CSSProperties
                  }
                />
              ))
            )}
          </span>
        </span>
        {count !== undefined && (
          <span className="nova-like__count" key={liked ? "on" : "off"}>
            {count}
          </span>
        )}
      </button>
    );
  }
);
