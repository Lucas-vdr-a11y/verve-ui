import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./StarToggle.css";

export interface StarToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled favorited state. Omit for uncontrolled. */
  favorited?: boolean;
  /** Initial favorited state when uncontrolled. Defaults `false`. */
  defaultFavorited?: boolean;
  /** Called with the next favorited state on toggle. */
  onChange?: (favorited: boolean) => void;
  /** Number of sparkles popped on favorite. Defaults `6`. */
  sparkles?: number;
}

const POP_MS = 700;

/**
 * A star favorite toggle that spins and fills on activation while popping a ring
 * of sparkles. Sparkles are DOM spans placed on even angles via per-piece CSS
 * vars and removed after the pop through a tracked timer (cleared on unmount).
 * Controlled via `favorited` or uncontrolled via `defaultFavorited`.
 *
 * Real `<button>` with `aria-pressed`. No spin/sparkles under reduced motion.
 */
export const StarToggle = forwardRef<HTMLButtonElement, StarToggleProps>(
  function StarToggle(
    {
      favorited: favProp,
      defaultFavorited = false,
      onChange,
      sparkles = 6,
      className,
      onClick,
      type,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const isControlled = favProp !== undefined;
    const [internalFav, setInternalFav] = useState(defaultFavorited);
    const fav = isControlled ? favProp : internalFav;

    const [pops, setPops] = useState<number[]>([]);
    const idRef = useRef(0);
    const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(
      () => () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
      },
      []
    );

    const n = Math.max(0, Math.min(12, sparkles));

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !fav;
        if (!isControlled) setInternalFav(next);
        onChange?.(next);

        if (next && !reduced && n > 0) {
          const id = idRef.current++;
          setPops((prev) => [...prev, id]);
          const t = setTimeout(() => {
            setPops((prev) => prev.filter((b) => b !== id));
            timers.current.delete(t);
          }, POP_MS);
          timers.current.add(t);
        }
      },
      [fav, isControlled, n, onChange, onClick, reduced]
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("nova-star", fav && "nova-star--on", className)}
        onClick={handleClick}
        aria-pressed={fav}
        aria-label={ariaLabel ?? (fav ? "Unfavorite" : "Favorite")}
        {...rest}
      >
        <span className="nova-star__icon-wrap" aria-hidden="true">
          <svg className="nova-star__icon" viewBox="0 0 24 24">
            <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21l1.1-6.5L2.6 9.8l6.5-.9z" />
          </svg>
          <span className="nova-star__sparkles">
            {pops.map((id) =>
              Array.from({ length: n }, (_, i) => (
                <span
                  key={`${id}-${i}`}
                  className="nova-star__sparkle"
                  style={
                    {
                      "--nova-star-angle": `${(i / n) * 360}deg`,
                    } as React.CSSProperties
                  }
                />
              ))
            )}
          </span>
        </span>
      </button>
    );
  }
);
