import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ProductGallery.css";

export interface ProductGalleryImage {
  /** Full-size image source for the main view. */
  src: string;
  /** Alt text (required for accessibility). */
  alt: string;
  /** Optional separate thumbnail source. Falls back to `src`. */
  thumbnail?: string;
}

export interface ProductGalleryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Images to display. The first is shown by default. */
  images: ProductGalleryImage[];
  /** Controlled active index. */
  activeIndex?: number;
  /** Initial active index (uncontrolled). @default 0 */
  defaultActiveIndex?: number;
  /** Called when the active image changes. */
  onChange?: (index: number) => void;
  /** Enable zoom-on-hover of the main image. @default false */
  zoom?: boolean;
  /** Optional badges rendered over the main image (e.g. "Sale"). */
  badges?: React.ReactNode;
}

/**
 * ProductGallery — a main image plus a thumbnail strip selector. Thumbnails are
 * keyboard operable (arrow keys move, Enter/Space select). SSR-safe: zoom is a
 * pure pointer-driven CSS transform with no window/document access at render.
 */
export const ProductGallery = forwardRef<HTMLDivElement, ProductGalleryProps>(
  function ProductGallery(
    {
      images,
      activeIndex,
      defaultActiveIndex = 0,
      onChange,
      zoom = false,
      badges,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = activeIndex !== undefined;
    const safeDefault = Math.min(
      Math.max(defaultActiveIndex, 0),
      Math.max(images.length - 1, 0),
    );
    const [internal, setInternal] = useState(safeDefault);
    const current = isControlled
      ? Math.min(Math.max(activeIndex, 0), Math.max(images.length - 1, 0))
      : internal;

    // Zoom transform origin, expressed as a percentage, updated on hover.
    const [origin, setOrigin] = useState<{ x: number; y: number }>({
      x: 50,
      y: 50,
    });
    const [zooming, setZooming] = useState(false);

    const select = (index: number) => {
      if (index < 0 || index >= images.length) return;
      if (!isControlled) setInternal(index);
      if (index !== current) onChange?.(index);
    };

    const handleThumbKey = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        select(Math.min(index + 1, images.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        select(Math.max(index - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        select(0);
      } else if (e.key === "End") {
        e.preventDefault();
        select(images.length - 1);
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoom) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOrigin({ x, y });
    };

    if (images.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("nova-product-gallery", className)}
          {...rest}
        >
          <div className="nova-product-gallery__main nova-product-gallery__main--empty" />
        </div>
      );
    }

    const active = images[current];

    return (
      <div
        ref={ref}
        className={cn(
          "nova-product-gallery",
          zoom && "nova-product-gallery--zoomable",
          className,
        )}
        {...rest}
      >
        <div
          className={cn(
            "nova-product-gallery__main",
            zooming && "nova-product-gallery__main--zooming",
          )}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => zoom && setZooming(true)}
          onMouseLeave={() => {
            setZooming(false);
            setOrigin({ x: 50, y: 50 });
          }}
        >
          {badges !== undefined && (
            <div className="nova-product-gallery__badges">{badges}</div>
          )}
          <img
            className="nova-product-gallery__main-img"
            src={active.src}
            alt={active.alt}
            style={
              zoom
                ? { transformOrigin: `${origin.x}% ${origin.y}%` }
                : undefined
            }
            draggable={false}
          />
        </div>

        {images.length > 1 && (
          <div
            className="nova-product-gallery__thumbs"
            role="tablist"
            aria-label="Product images"
          >
            {images.map((img, i) => {
              const selected = i === current;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`View image ${i + 1}: ${img.alt}`}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "nova-product-gallery__thumb",
                    selected && "nova-product-gallery__thumb--active",
                  )}
                  onClick={() => select(i)}
                  onKeyDown={(e) => handleThumbKey(e, i)}
                >
                  <img
                    className="nova-product-gallery__thumb-img"
                    src={img.thumbnail ?? img.src}
                    alt=""
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
