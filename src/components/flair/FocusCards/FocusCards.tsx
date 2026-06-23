import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./FocusCards.css";

export interface FocusCardItem {
  /** Stable key for the card. */
  id: string | number;
  /** Card content. */
  content: React.ReactNode;
}

export interface FocusCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Cards to render in the grid. */
  items: FocusCardItem[];
  /** Number of columns. Defaults `3`. */
  columns?: number;
}

/**
 * A grid of cards where hovering (or focusing) one keeps it crisp and slightly
 * scaled up while the others blur and dim (the Aceternity focus-cards effect).
 * Each card is a focusable button so keyboard users get the same emphasis.
 *
 * Pure CSS for the blur/dim; a tiny state hook tracks the active index so focus
 * and hover share one source of truth. Under reduced motion only the dim
 * remains (no blur transition jump).
 */
export const FocusCards = forwardRef<HTMLDivElement, FocusCardsProps>(
  function FocusCards({ items, columns = 3, className, ...rest }, ref) {
    const [active, setActive] = useState<number | null>(null);

    return (
      <div
        ref={ref}
        className={cn("nova-focus-cards", className)}
        style={
          { "--nova-focus-cols": String(columns) } as React.CSSProperties
        }
        {...rest}
      >
        {items.map((item, i) => {
          const dimmed = active !== null && active !== i;
          return (
            <button
              type="button"
              key={item.id}
              className={cn(
                "nova-focus-cards__card",
                dimmed && "nova-focus-cards__card--dimmed"
              )}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {item.content}
            </button>
          );
        })}
      </div>
    );
  }
);
