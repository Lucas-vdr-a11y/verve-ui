import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./Gallery.css";

export type GalleryGap = "sm" | "md" | "lg";
export type GalleryLayout = "grid" | "masonry";

export interface GalleryItem {
  /** Image source. */
  src: string;
  /** Alt text. */
  alt?: string;
  /** Arbitrary value passed back to `onItemClick`. */
  id?: string | number;
}

export interface GalleryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Items to render. Alternatively, pass arbitrary `children`. */
  items?: GalleryItem[];
  /** Minimum column width (CSS length) for the auto-fitting grid. Defaults to `12rem`. */
  minColumnWidth?: string;
  /** Gap between items, mapped to spacing tokens. Defaults to `"md"`. */
  gap?: GalleryGap;
  /** Layout mode. `"masonry"` uses CSS columns. Defaults to `"grid"`. */
  layout?: GalleryLayout;
  /** Round item corners. Defaults to `true`. */
  rounded?: boolean;
  /** Fired when an item is clicked (e.g. to open a lightbox). */
  onItemClick?: (item: GalleryItem, index: number) => void;
  /** Custom content instead of `items`. */
  children?: ReactNode;
}

const GAP_TOKEN: Record<GalleryGap, string> = {
  sm: "var(--nova-space-2)",
  md: "var(--nova-space-4)",
  lg: "var(--nova-space-6)",
};

export const Gallery = forwardRef<HTMLDivElement, GalleryProps>(function Gallery(
  {
    items,
    minColumnWidth = "12rem",
    gap = "md",
    layout = "grid",
    rounded = true,
    onItemClick,
    children,
    className,
    style,
    ...rest
  },
  ref
) {
  const styleVars: React.CSSProperties = {
    ["--nova-gallery-gap" as string]: GAP_TOKEN[gap],
    ["--nova-gallery-min" as string]: minColumnWidth,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "nova-gallery",
        `nova-gallery--${layout}`,
        rounded && "nova-gallery--rounded",
        className
      )}
      style={styleVars}
      {...rest}
    >
      {items
        ? items.map((item, i) => {
            const interactive = !!onItemClick;
            return (
              <button
                key={item.id ?? i}
                type="button"
                className="nova-gallery__item"
                onClick={interactive ? () => onItemClick?.(item, i) : undefined}
                disabled={!interactive}
                aria-label={interactive ? item.alt || `Open image ${i + 1}` : undefined}
              >
                <img
                  className="nova-gallery__img"
                  src={item.src}
                  alt={item.alt ?? ""}
                  loading="lazy"
                />
              </button>
            );
          })
        : children}
    </div>
  );
});
