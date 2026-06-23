import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./SwipeCards.css";

export type SwipeDirection = "left" | "right";

export interface SwipeCardItem {
  /** Stable key for the card. */
  id: string | number;
  /** Card content. */
  content: React.ReactNode;
}

export interface SwipeCardsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSwipe"> {
  /** Cards to swipe through, top-most first. */
  items: SwipeCardItem[];
  /** How many cards are visible behind the top card. Defaults `3`. */
  visible?: number;
  /** Distance (px) the top card must travel to commit a swipe. Defaults `120`. */
  threshold?: number;
  /** Vertical offset (px) between stacked cards. Defaults `12`. */
  offset?: number;
  /** Scale step subtracted per card below the top. Defaults `0.04`. */
  scaleStep?: number;
  /** Called when a card is flung off. Receives the direction and the item. */
  onSwipe?: (direction: SwipeDirection, item: SwipeCardItem) => void;
  /** Called when the deck is exhausted. */
  onEmpty?: () => void;
}

/**
 * A Tinder-style deck: drag or fling the top card left/right to dismiss it,
 * revealing the next. Pointer drag applies translation + rotation; releasing
 * past the threshold flings the card off-screen, otherwise it springs back.
 * Arrow keys (← / →) provide a keyboard fallback.
 *
 * SSR-safe (pointer logic in effects/handlers), cleans up pointer capture, and
 * under reduced motion the fling is instant.
 */
export const SwipeCards = forwardRef<HTMLDivElement, SwipeCardsProps>(
  function SwipeCards(
    {
      items,
      visible = 3,
      threshold = 120,
      offset = 12,
      scaleStep = 0.04,
      className,
      onSwipe,
      onEmpty,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [active, setActive] = useState(0);
    const [flying, setFlying] = useState<SwipeDirection | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
    } | null>(null);

    const onSwipeRef = useRef(onSwipe);
    onSwipeRef.current = onSwipe;
    const onEmptyRef = useRef(onEmpty);
    onEmptyRef.current = onEmpty;

    const count = items.length;

    const applyTransform = useCallback((dx: number, dy: number) => {
      const node = cardRef.current;
      if (!node) return;
      const rot = dx / 18;
      node.style.setProperty("--nova-swipe-x", `${dx}px`);
      node.style.setProperty("--nova-swipe-y", `${dy}px`);
      node.style.setProperty("--nova-swipe-rot", `${rot}deg`);
      node.style.setProperty(
        "--nova-swipe-progress",
        Math.max(-1, Math.min(1, dx / 140)).toFixed(3)
      );
    }, []);

    const resetTransform = useCallback(() => {
      applyTransform(0, 0);
    }, [applyTransform]);

    const commit = useCallback(
      (direction: SwipeDirection) => {
        if (active >= count) return;
        const item = items[active];
        const finish = () => {
          onSwipeRef.current?.(direction, item);
          setFlying(null);
          setActive((prev) => {
            const next = prev + 1;
            if (next >= count) onEmptyRef.current?.();
            return next;
          });
        };
        if (reduced) {
          finish();
          return;
        }
        setFlying(direction);
        window.setTimeout(finish, 320);
      },
      [active, count, items, reduced]
    );

    const handlePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (flying) return;
        const node = cardRef.current;
        if (!node) return;
        node.setPointerCapture?.(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
        };
        node.classList.add("nova-swipe-cards__card--dragging");
      },
      [flying]
    );

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.pointerId !== event.pointerId) return;
        applyTransform(event.clientX - d.startX, event.clientY - d.startY);
      },
      [applyTransform]
    );

    const endDrag = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.pointerId !== event.pointerId) return;
        const node = cardRef.current;
        node?.releasePointerCapture?.(event.pointerId);
        node?.classList.remove("nova-swipe-cards__card--dragging");
        drag.current = null;
        const dx = event.clientX - d.startX;
        if (Math.abs(dx) >= threshold) {
          commit(dx > 0 ? "right" : "left");
        } else {
          resetTransform();
        }
      },
      [commit, resetTransform, threshold]
    );

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (flying || active >= count) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          commit("left");
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          commit("right");
        }
      },
      [active, commit, count, flying]
    );

    // Reset the top card transform whenever a new card becomes active.
    useEffect(() => {
      resetTransform();
    }, [active, resetTransform]);

    if (count === 0 || active >= count) {
      return (
        <div
          ref={ref}
          className={cn("nova-swipe-cards", "nova-swipe-cards--empty", className)}
          {...rest}
        />
      );
    }

    const shown = Math.min(visible, count - active);

    return (
      <div
        ref={ref}
        className={cn("nova-swipe-cards", className)}
        role="group"
        aria-roledescription="swipe deck"
        aria-label={`Card ${active + 1} of ${count}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={
          {
            "--nova-swipe-offset": `${offset}px`,
          } as React.CSSProperties
        }
        {...rest}
      >
        {Array.from({ length: shown }).map((_, depth) => {
          const index = active + depth;
          const item = items[index];
          const isFront = depth === 0;
          if (isFront) {
            return (
              <div
                key={item.id}
                ref={cardRef}
                className={cn(
                  "nova-swipe-cards__card",
                  "nova-swipe-cards__card--front",
                  flying && `nova-swipe-cards__card--fly-${flying}`
                )}
                style={{ zIndex: count }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <span
                  className="nova-swipe-cards__badge nova-swipe-cards__badge--right"
                  aria-hidden="true"
                />
                <span
                  className="nova-swipe-cards__badge nova-swipe-cards__badge--left"
                  aria-hidden="true"
                />
                <div className="nova-swipe-cards__content">{item.content}</div>
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className="nova-swipe-cards__card"
              aria-hidden="true"
              style={{
                zIndex: count - depth,
                transform: `translateY(${depth * offset}px) scale(${
                  1 - depth * scaleStep
                })`,
              }}
            >
              <div className="nova-swipe-cards__content">{item.content}</div>
            </div>
          );
        })}
      </div>
    );
  }
);
