import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./InfiniteMovingCards.css";

export interface InfiniteMovingCardsItem {
  /** Stable key. */
  id: string | number;
  /** Card content. */
  content: React.ReactNode;
}

export interface InfiniteMovingCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Cards to scroll. */
  items: InfiniteMovingCardsItem[];
  /** Scroll direction. Defaults `"left"`. */
  direction?: "left" | "right";
  /** Loop duration. Slower values take longer. Defaults `"40s"`. */
  speed?: "slow" | "normal" | "fast" | string;
  /** Pause the scroll while hovered. Defaults `true`. */
  pauseOnHover?: boolean;
  /** Fade the leading/trailing edges. Defaults `true`. */
  fade?: boolean;
  /** Gap between cards. Defaults `"1rem"`. */
  gap?: number | string;
}

const SPEED_MAP: Record<string, string> = {
  slow: "60s",
  normal: "40s",
  fast: "20s",
};

/**
 * A row of cards that scrolls infinitely and seamlessly: the list is duplicated
 * and translated a full track-width, so the loop has no visible seam. Supports
 * direction, speed presets (or a raw duration), pause-on-hover and edge fades.
 *
 * Pure CSS animation (SSR-safe, no measurement). The duplicate copy is hidden
 * from assistive tech. Under reduced motion the scroll is paused.
 */
export const InfiniteMovingCards = forwardRef<
  HTMLDivElement,
  InfiniteMovingCardsProps
>(function InfiniteMovingCards(
  {
    items,
    direction = "left",
    speed = "normal",
    pauseOnHover = true,
    fade = true,
    gap = "1rem",
    className,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const duration = SPEED_MAP[speed] ?? speed;
  const gapValue = typeof gap === "number" ? `${gap}px` : gap;

  return (
    <div
      ref={ref}
      className={cn(
        "nova-moving",
        `nova-moving--${direction}`,
        pauseOnHover && "nova-moving--pause-hover",
        fade && "nova-moving--fade",
        className
      )}
      data-paused={reduced ? "" : undefined}
      style={
        {
          "--nova-moving-duration": duration,
          "--nova-moving-gap": gapValue,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <ul className="nova-moving__track">
        {items.map((item) => (
          <li key={item.id} className="nova-moving__card">
            {item.content}
          </li>
        ))}
      </ul>
      <ul className="nova-moving__track" aria-hidden="true">
        {items.map((item) => (
          <li key={item.id} className="nova-moving__card">
            {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
});
