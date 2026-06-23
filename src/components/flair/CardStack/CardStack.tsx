import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./CardStack.css";

export interface CardStackItem {
  /** Stable key for the card. */
  id: string | number;
  /** Card content. */
  content: React.ReactNode;
}

export interface CardStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Cards to cycle through, top-most first. */
  items: CardStackItem[];
  /** How many cards are visible in the stack. Defaults `3`. */
  visible?: number;
  /** Auto-advance interval (ms). `0` disables autoplay. Defaults `4000`. */
  interval?: number;
  /** Advance when the top card is clicked. Defaults `true`. */
  clickToAdvance?: boolean;
  /** Vertical offset (px) between stacked cards. Defaults `14`. */
  offset?: number;
  /** Scale step subtracted per card below the top. Defaults `0.05`. */
  scaleStep?: number;
  /** Called when the active (front) card changes. */
  onChange?: (index: number) => void;
}

/**
 * A stack of cards that cycles: the front card animates away (lifts, fades) and
 * the next rises to the top, looping. Cards behind are offset and scaled for
 * depth. Auto-advances on an interval (pausable by hover) and on click.
 *
 * The stack is a `role="group"`; advancing is also a focusable button for
 * keyboard users. Under reduced motion the transition is instant.
 */
export const CardStack = forwardRef<HTMLDivElement, CardStackProps>(
  function CardStack(
    {
      items,
      visible = 3,
      interval = 4000,
      clickToAdvance = true,
      offset = 14,
      scaleStep = 0.05,
      className,
      onChange,
      ...rest
    },
    ref
  ) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const count = items.length;

    const advance = useCallback(() => {
      setActive((prev) => {
        const next = count > 0 ? (prev + 1) % count : 0;
        onChangeRef.current?.(next);
        return next;
      });
    }, [count]);

    useEffect(() => {
      if (interval <= 0 || paused || count <= 1) return;
      const id = window.setInterval(advance, interval);
      return () => window.clearInterval(id);
    }, [interval, paused, count, advance]);

    if (count === 0) return null;

    const shown = Math.min(visible, count);

    return (
      <div
        ref={ref}
        className={cn("nova-cardstack", className)}
        role="group"
        aria-roledescription="card stack"
        aria-label={`Card ${active + 1} of ${count}`}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        style={
          {
            "--nova-cardstack-offset": `${offset}px`,
          } as React.CSSProperties
        }
        {...rest}
      >
        {items.map((item, i) => {
          // depth: 0 = front, increasing toward the back.
          const depth = (i - active + count) % count;
          const isVisible = depth < shown;
          const isFront = depth === 0;
          return (
            <div
              key={item.id}
              className={cn(
                "nova-cardstack__card",
                isFront && "nova-cardstack__card--front",
                !isVisible && "nova-cardstack__card--hidden"
              )}
              aria-hidden={!isFront}
              style={{
                zIndex: count - depth,
                transform: `translateY(${depth * offset}px) scale(${
                  1 - depth * scaleStep
                })`,
                opacity: isVisible ? 1 : 0,
              }}
            >
              {item.content}
            </div>
          );
        })}

        {clickToAdvance ? (
          <button
            type="button"
            className="nova-cardstack__advance"
            onClick={advance}
            aria-label="Next card"
          />
        ) : null}
      </div>
    );
  }
);
