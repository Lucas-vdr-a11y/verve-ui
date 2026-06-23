import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./StickyScrollReveal.css";

export interface StickyScrollItem {
  /** Stable identity for the section. */
  id?: string | number;
  /** Heading for the text column. */
  title: React.ReactNode;
  /** Body copy for the text column. */
  description?: React.ReactNode;
  /** Visual shown in the sticky panel while this section is active. */
  visual: React.ReactNode;
}

export interface StickyScrollRevealProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** Ordered sections to step through. */
  items: StickyScrollItem[];
  /** Which side the sticky visual panel sits on. Defaults `"right"`. */
  panelSide?: "left" | "right";
  /** Called when the active section changes. */
  onActiveChange?: (index: number) => void;
}

/**
 * Two-column scroll story: a sticky visual panel on one side swaps its content
 * as the reader scrolls through stacked text sections on the other. The active
 * section is whichever is nearest the vertical middle of the viewport.
 *
 * Active detection uses an IntersectionObserver with a centered root margin;
 * the observer is rebuilt when items change and disconnected on unmount.
 * SSR-safe.
 */
export const StickyScrollReveal = forwardRef<
  HTMLDivElement,
  StickyScrollRevealProps
>(function StickyScrollReveal(
  { items, panelSide = "right", onActiveChange, className, ...rest },
  ref
) {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.index ?? -1
            );
            if (idx >= 0 && idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
              onActiveChange?.(idx);
            }
          }
        }
      },
      // A thin band across the middle of the viewport.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    const nodes = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [items, onActiveChange]);

  return (
    <div
      ref={ref}
      className={cn(
        "nova-sticky-reveal",
        `nova-sticky-reveal--panel-${panelSide}`,
        className
      )}
      {...rest}
    >
      <div className="nova-sticky-reveal__text">
        {items.map((item, i) => (
          <div
            key={item.id ?? i}
            data-index={i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={cn(
              "nova-sticky-reveal__section",
              i === active && "nova-sticky-reveal__section--active"
            )}
            aria-current={i === active ? "true" : undefined}
          >
            <h3 className="nova-sticky-reveal__title">{item.title}</h3>
            {item.description && (
              <p className="nova-sticky-reveal__desc">{item.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="nova-sticky-reveal__panel" aria-hidden="true">
        <div className="nova-sticky-reveal__panel-inner">
          {items.map((item, i) => (
            <div
              key={item.id ?? i}
              className={cn(
                "nova-sticky-reveal__visual",
                i === active && "nova-sticky-reveal__visual--active"
              )}
            >
              {item.visual}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
