import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ExpandableFeatureCards.css";

export interface ExpandableFeatureItem {
  /** Stable key. */
  id: string | number;
  /** Title shown both collapsed (rotated) and expanded. */
  title: React.ReactNode;
  /** Background image URL for the panel. */
  image?: string;
  /** Content revealed when the card is expanded. */
  content?: React.ReactNode;
}

export interface ExpandableFeatureCardsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The panels to render in a row. */
  items: ExpandableFeatureItem[];
  /** Index of the panel expanded initially. Defaults `0`. */
  defaultIndex?: number;
}

/**
 * ExpandableFeatureCards — a horizontal row of image panels where the active
 * panel grows (flex-grow) to reveal its content while the others shrink to a
 * slim rail (the "accordion images" pattern). Activates on hover and on focus,
 * fully keyboard accessible: each panel is a button in a tablist, arrow keys and
 * Tab move between them, and the expanded panel is announced via `aria-expanded`.
 *
 * Stateful only — no scroll/observer — so it is SSR-safe. Width transitions slow
 * to near-instant under reduced motion via the global duration tokens.
 */
export const ExpandableFeatureCards = forwardRef<
  HTMLDivElement,
  ExpandableFeatureCardsProps
>(function ExpandableFeatureCards(
  { items, defaultIndex = 0, className, ...rest },
  ref
) {
  const [active, setActive] = useState(defaultIndex);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((index + 1) % items.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((index - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    }
  };

  return (
    <div
      ref={ref}
      className={cn("nova-expandable-feature-cards", className)}
      role="tablist"
      aria-orientation="horizontal"
      {...rest}
    >
      {items.map((item, i) => {
        const expanded = i === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={expanded}
            aria-expanded={expanded}
            tabIndex={expanded ? 0 : -1}
            className="nova-expandable-feature-cards__panel nova-focusable"
            data-active={expanded ? "" : undefined}
            style={
              item.image
                ? ({
                    "--nova-efc-img": `url("${item.image}")`,
                  } as React.CSSProperties)
                : undefined
            }
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="nova-expandable-feature-cards__scrim" aria-hidden="true" />
            <span className="nova-expandable-feature-cards__label">
              {item.title}
            </span>
            <span className="nova-expandable-feature-cards__detail" aria-hidden={!expanded}>
              <span className="nova-expandable-feature-cards__detail-title">
                {item.title}
              </span>
              {item.content && (
                <span className="nova-expandable-feature-cards__detail-content">
                  {item.content}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
});
