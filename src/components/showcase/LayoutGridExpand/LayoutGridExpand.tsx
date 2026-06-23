import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import "./LayoutGridExpand.css";

export interface LayoutGridItem {
  /** Stable key. */
  id: string | number;
  /** Compact tile content (shown in the grid). */
  thumb: React.ReactNode;
  /** Expanded content (shown in the overlay card). Falls back to `thumb`. */
  content?: React.ReactNode;
  /** Column span in the grid (1–2). Defaults `1`. */
  colSpan?: 1 | 2;
}

export interface LayoutGridExpandProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The tiles. */
  items: LayoutGridItem[];
  /** Column count on the widest breakpoint. Defaults `3`. */
  columns?: 2 | 3 | 4;
}

/**
 * LayoutGridExpand — a grid of tiles; clicking one expands it into a large
 * overlay card centred over a backdrop. Click the backdrop, press the tile
 * again, or hit Escape to collapse. Tiles are buttons (keyboard operable), the
 * overlay traps Escape, and the backdrop has a dialog role. SSR-safe (Escape
 * listener lives in an effect) and uses the global duration tokens so motion is
 * reduced automatically.
 */
export const LayoutGridExpand = forwardRef<
  HTMLDivElement,
  LayoutGridExpandProps
>(function LayoutGridExpand({ items, columns = 3, className, ...rest }, ref) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  useEffect(() => {
    if (activeId == null || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  const active = items.find((i) => i.id === activeId) ?? null;

  return (
    <div
      ref={ref}
      className={cn(
        "nova-layout-grid",
        `nova-layout-grid--cols-${columns}`,
        className
      )}
      {...rest}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "nova-layout-grid__tile",
            item.colSpan === 2 && "nova-layout-grid__tile--wide"
          )}
          aria-expanded={activeId === item.id}
          onClick={() =>
            setActiveId((cur) => (cur === item.id ? null : item.id))
          }
        >
          {item.thumb}
        </button>
      ))}

      {active && (
        <div
          className="nova-layout-grid__backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveId(null)}
        >
          <div
            className="nova-layout-grid__expanded"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="nova-layout-grid__close"
              aria-label="Close"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>
            <div className="nova-layout-grid__expanded-body">
              {active.content ?? active.thumb}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
