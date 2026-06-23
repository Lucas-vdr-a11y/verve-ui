import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./CardHoverGrid.css";

export interface CardHoverItem {
  /** Stable key. */
  id: string | number;
  /** Card title. */
  title?: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Optional link; renders the card as an anchor when provided. */
  href?: string;
}

export interface CardHoverGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The cards to render. */
  items: CardHoverItem[];
  /** Column count on the widest breakpoint. Defaults `3`. */
  columns?: 1 | 2 | 3 | 4;
  /** Custom renderer for a card's body (overrides title/description). */
  render?: (item: CardHoverItem) => React.ReactNode;
}

/**
 * CardHoverGrid — a grid of cards where hovering one slides a soft highlighted
 * background behind it (the Aceternity hover-effect card grid). The highlight
 * is a single positioned element moved to the hovered card via shared state +
 * CSS transitions, so it appears to glide between cards. SSR-safe, no
 * measurement; respects reduced-motion (the highlight cross-fades instead of
 * sliding via the global duration tokens).
 */
export const CardHoverGrid = forwardRef<HTMLDivElement, CardHoverGridProps>(
  function CardHoverGrid(
    { items, columns = 3, render, className, ...rest },
    ref
  ) {
    const [hovered, setHovered] = useState<string | number | null>(null);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-card-hover-grid",
          `nova-card-hover-grid--cols-${columns}`,
          className
        )}
        onMouseLeave={() => setHovered(null)}
        {...rest}
      >
        {items.map((item) => {
          const Tag = (item.href ? "a" : "div") as React.ElementType;
          return (
            <Tag
              key={item.id}
              className="nova-card-hover-grid__item"
              href={item.href}
              onMouseEnter={() => setHovered(item.id)}
              data-active={hovered === item.id ? "" : undefined}
            >
              <span
                className="nova-card-hover-grid__bg"
                aria-hidden="true"
                data-show={hovered === item.id ? "" : undefined}
              />
              <span className="nova-card-hover-grid__card">
                {render ? (
                  render(item)
                ) : (
                  <>
                    {item.title && (
                      <span className="nova-card-hover-grid__title">
                        {item.title}
                      </span>
                    )}
                    {item.description && (
                      <span className="nova-card-hover-grid__desc">
                        {item.description}
                      </span>
                    )}
                  </>
                )}
              </span>
            </Tag>
          );
        })}
      </div>
    );
  }
);
