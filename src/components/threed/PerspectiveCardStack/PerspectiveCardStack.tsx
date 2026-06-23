import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./PerspectiveCardStack.css";

export interface PerspectiveCardStackItem {
  id: string;
  content: ReactNode;
}

export interface PerspectiveCardStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Cards in the stack, top first. */
  items: PerspectiveCardStackItem[];
  /** px each successive card recedes in Z. @default 60 */
  depth?: number;
  /** px each successive card shifts down (vertical fan). @default 24 */
  offset?: number;
  /** Send top card to back when clicked (in addition to hover peel). @default true */
  cycleOnClick?: boolean;
  /** Fired with the new top card index after a cycle. */
  onChange?: (topIndex: number) => void;
  /** Cards rendered behind the top one. @default 4 */
  visible?: number;
}

/**
 * A stack of cards receding into depth. The top card peels forward on hover and
 * can be sent to the back on click, advancing the stack.
 */
export const PerspectiveCardStack = forwardRef<
  HTMLDivElement,
  PerspectiveCardStackProps
>(function PerspectiveCardStack(
  {
    items,
    depth = 60,
    offset = 24,
    cycleOnClick = true,
    onChange,
    visible = 4,
    className,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const count = items.length;
  const [top, setTop] = useState(0);

  // Reset if the item set shrinks below the current top.
  useEffect(() => {
    if (top >= count) setTop(0);
  }, [count, top]);

  const sendToBack = useCallback(() => {
    if (count <= 1) return;
    setTop((t) => {
      const next = (t + 1) % count;
      onChange?.(next);
      return next;
    });
  }, [count, onChange]);

  const cssVars: CSSProperties = {
    ["--nova-stack-depth" as string]: `${depth}px`,
    ["--nova-stack-offset" as string]: `${offset}px`,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "nova-card-stack",
        reduced && "nova-card-stack--reduced",
        className
      )}
      style={{ ...cssVars, ...style }}
      {...rest}
    >
      <div className="nova-card-stack__scene">
        {items.map((item, i) => {
          // Position relative to the current top card.
          const pos = ((i - top) % count + count) % count;
          const hidden = pos >= visible;
          const cardVars: CSSProperties = {
            ["--nova-stack-pos" as string]: String(pos),
            zIndex: count - pos,
          };
          const isTop = pos === 0;
          return (
            <div
              key={item.id}
              className={cn(
                "nova-card-stack__card",
                isTop && "nova-card-stack__card--top"
              )}
              style={cardVars}
              hidden={hidden}
              aria-hidden={!isTop}
              onClick={isTop && cycleOnClick ? sendToBack : undefined}
              role={isTop && cycleOnClick ? "button" : undefined}
              tabIndex={isTop && cycleOnClick ? 0 : undefined}
              onKeyDown={
                isTop && cycleOnClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        sendToBack();
                      }
                    }
                  : undefined
              }
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
});
