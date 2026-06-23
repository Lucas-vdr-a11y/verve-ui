import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./StackingCards.css";

export interface StackingCard {
  /** Stable key. */
  id: string | number;
  /** Card content. */
  children: React.ReactNode;
}

export interface StackingCardsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The cards to stack. */
  items: StackingCard[];
  /** Distance (rem) each successive pinned card is offset down. Defaults `2`. */
  offset?: number;
  /** Scale applied to a card as the next overlaps it (0–1). Defaults `0.05`. */
  scaleStep?: number;
}

/**
 * StackingCards — cards that pin to the top of the viewport one after another as
 * you scroll; each card sticks, then the next slides up and overlaps it, the
 * earlier card scaling back slightly to create a deck. Built on CSS
 * `position: sticky` plus a rAF scroll read that scales/dims the card behind the
 * incoming one.
 *
 * SSR-safe: the scroll listener is created in an effect that guards `window` and
 * cleans up. Under reduced motion the cards render as a simple stacked column
 * with no scaling.
 */
export const StackingCards = forwardRef<HTMLDivElement, StackingCardsProps>(
  function StackingCards(
    { items, offset = 2, scaleStep = 0.05, className, style, ...rest },
    ref
  ) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();
    const [scales, setScales] = useState<number[]>(() => items.map(() => 1));
    const frame = useRef<number | null>(null);

    useEffect(() => {
      if (reduced) return;
      if (typeof window === "undefined") return;
      const wrap = wrapRef.current;
      if (!wrap) return;

      const measure = () => {
        frame.current = null;
        const cards = Array.from(
          wrap.querySelectorAll<HTMLElement>(".nova-stacking-cards__card")
        );
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const pinTop = vh * 0.16; // matches CSS sticky top
        const next = cards.map((_card, i) => {
          if (i === cards.length - 1) return 1;
          const nextCard = cards[i + 1];
          if (!nextCard) return 1;
          const nextRect = nextCard.getBoundingClientRect();
          // progress: 0 while next card is below pinTop, 1 once it reaches pinTop
          const dist = nextRect.top - pinTop;
          const p = 1 - Math.min(Math.max(dist / vh, 0), 1);
          return 1 - p * scaleStep;
        });
        setScales(next);
      };
      const schedule = () => {
        if (frame.current === null) {
          frame.current = window.requestAnimationFrame(measure);
        }
      };
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame.current !== null) {
          window.cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, [reduced, scaleStep, items.length]);

    return (
      <div
        ref={mergeRefs(ref, wrapRef)}
        className={cn(
          "nova-stacking-cards",
          reduced && "nova-stacking-cards--static",
          className
        )}
        style={
          {
            "--nova-stacking-cards-offset": `${offset}rem`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="nova-stacking-cards__slot"
            style={{ "--nova-stacking-index": i } as React.CSSProperties}
          >
            <div
              className="nova-stacking-cards__card"
              style={
                {
                  "--nova-stacking-scale": scales[i] ?? 1,
                  top: `calc(16vh + ${i * offset}rem)`,
                } as React.CSSProperties
              }
            >
              {item.children}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
