import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./ImageMasonry.css";

export type ImageMasonryGap = "sm" | "md" | "lg";

export interface ImageMasonryItem {
  /** Image source. */
  src: string;
  /** Alt text. */
  alt?: string;
  /** Optional caption shown on hover. */
  caption?: ReactNode;
  /** Arbitrary value passed back to `onItemClick`. */
  id?: string | number;
}

export interface ImageMasonryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Images to render. */
  items: ImageMasonryItem[];
  /** Number of columns. Defaults to `3`. The grid collapses responsively. */
  columns?: number;
  /** Gap between items. Defaults to `"md"`. */
  gap?: ImageMasonryGap;
  /** Round item corners. Defaults to `true`. */
  rounded?: boolean;
  /** Show captions overlaid on hover (when an item has a `caption`). Defaults to `true`. */
  showCaptions?: boolean;
  /** Fired when an item is clicked. */
  onItemClick?: (item: ImageMasonryItem, index: number) => void;
}

const GAP_TOKEN: Record<ImageMasonryGap, string> = {
  sm: "var(--nova-space-2)",
  md: "var(--nova-space-4)",
  lg: "var(--nova-space-6)",
};

/**
 * Responsive masonry image grid built on CSS multi-columns. Images load lazily;
 * each item is independently clickable and may reveal a caption on hover.
 */
export const ImageMasonry = forwardRef<HTMLDivElement, ImageMasonryProps>(
  function ImageMasonry(
    {
      items,
      columns = 3,
      gap = "md",
      rounded = true,
      showCaptions = true,
      onItemClick,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const styleVars: React.CSSProperties = {
      ["--nova-masonry-columns" as string]: String(Math.max(1, columns)),
      ["--nova-masonry-gap" as string]: GAP_TOKEN[gap],
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-image-masonry",
          rounded && "nova-image-masonry--rounded",
          className
        )}
        style={styleVars}
        {...rest}
      >
        {items.map((item, i) => {
          const interactive = !!onItemClick;
          const hasCaption = showCaptions && item.caption != null;
          const inner = (
            <>
              <img
                className="nova-image-masonry__img"
                src={item.src}
                alt={item.alt ?? ""}
                loading="lazy"
                draggable={false}
              />
              {hasCaption && (
                <span className="nova-image-masonry__caption">
                  {item.caption}
                </span>
              )}
            </>
          );

          return interactive ? (
            <button
              key={item.id ?? i}
              type="button"
              className="nova-image-masonry__item nova-image-masonry__item--button"
              onClick={() => onItemClick?.(item, i)}
              aria-label={item.alt || `Open image ${i + 1}`}
            >
              {inner}
            </button>
          ) : (
            <figure
              key={item.id ?? i}
              className="nova-image-masonry__item"
            >
              {inner}
            </figure>
          );
        })}
      </div>
    );
  }
);
