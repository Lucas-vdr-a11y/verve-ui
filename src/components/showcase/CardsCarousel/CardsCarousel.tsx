import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./CardsCarousel.css";

export interface CarouselCard {
  /** Stable key. */
  id: string | number;
  /** Small eyebrow above the title (e.g. category). */
  category?: React.ReactNode;
  /** Card title. */
  title?: React.ReactNode;
  /** Background image URL for the card face. */
  image?: string;
  /** Rich content revealed in the expanded overlay. */
  content?: React.ReactNode;
}

export interface CardsCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Cards to render. */
  items: CarouselCard[];
  /** Accessible label for the carousel region. */
  label?: string;
}

const SCROLL_STEP = 0.85; // fraction of viewport scrolled per arrow press

/**
 * CardsCarousel — a horizontally scroll-snapping rail of large cards that expand
 * into a full overlay on click (the Apple "cards carousel"). Drag-to-scroll with
 * the pointer, arrow buttons, and keyboard (Enter/Space to open, Escape to close).
 *
 * All pointer / scroll / key listeners live in effects with cleanup and guard
 * `window`/`document`, so it is SSR-safe. The scroll snap + transitions slow to
 * near-instant under reduced motion via the global duration tokens.
 */
export const CardsCarousel = forwardRef<HTMLDivElement, CardsCarouselProps>(
  function CardsCarousel(
    { items, label = "Cards carousel", className, ...rest },
    ref
  ) {
    const railRef = useRef<HTMLDivElement | null>(null);
    const [openId, setOpenId] = useState<string | number | null>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);

    // Track scroll position to enable/disable arrows.
    const updateArrows = useCallback(() => {
      const el = railRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft < max - 4);
    }, []);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = railRef.current;
      if (!el) return;
      updateArrows();
      el.addEventListener("scroll", updateArrows, { passive: true });
      window.addEventListener("resize", updateArrows, { passive: true });
      return () => {
        el.removeEventListener("scroll", updateArrows);
        window.removeEventListener("resize", updateArrows);
      };
    }, [updateArrows, items]);

    // Drag-to-scroll with pointer events.
    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = railRef.current;
      if (!el) return;

      let down = false;
      let startX = 0;
      let startScroll = 0;
      let moved = false;

      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        down = true;
        moved = false;
        startX = e.clientX;
        startScroll = el.scrollLeft;
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) {
          moved = true;
          el.classList.add("nova-cards-carousel__rail--dragging");
        }
        el.scrollLeft = startScroll - dx;
      };
      const onUp = () => {
        down = false;
        el.classList.remove("nova-cards-carousel__rail--dragging");
      };
      // Suppress the click that follows a drag so cards don't open.
      const onClickCapture = (e: MouseEvent) => {
        if (moved) {
          e.stopPropagation();
          e.preventDefault();
          moved = false;
        }
      };

      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      el.addEventListener("click", onClickCapture, true);
      return () => {
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        el.removeEventListener("click", onClickCapture, true);
      };
    }, []);

    // Close overlay on Escape.
    useEffect(() => {
      if (typeof window === "undefined" || openId === null) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpenId(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [openId]);

    const scrollBy = (dir: 1 | -1) => {
      const el = railRef.current;
      if (!el) return;
      el.scrollBy({ left: dir * el.clientWidth * SCROLL_STEP, behavior: "smooth" });
    };

    const openCard = items.find((c) => c.id === openId) ?? null;

    return (
      <div
        ref={ref}
        className={cn("nova-cards-carousel", className)}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        {...rest}
      >
        <div className="nova-cards-carousel__rail" ref={railRef}>
          {items.map((card) => (
            <button
              key={card.id}
              type="button"
              className="nova-cards-carousel__card nova-focusable"
              style={
                card.image
                  ? ({
                      "--nova-cards-carousel-img": `url("${card.image}")`,
                    } as React.CSSProperties)
                  : undefined
              }
              aria-haspopup="dialog"
              aria-expanded={openId === card.id}
              onClick={() => setOpenId(card.id)}
            >
              <span className="nova-cards-carousel__scrim" aria-hidden="true" />
              <span className="nova-cards-carousel__meta">
                {card.category && (
                  <span className="nova-cards-carousel__category">
                    {card.category}
                  </span>
                )}
                {card.title && (
                  <span className="nova-cards-carousel__title">
                    {card.title}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="nova-cards-carousel__nav">
          <button
            type="button"
            className="nova-cards-carousel__arrow nova-focusable"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Previous"
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            type="button"
            className="nova-cards-carousel__arrow nova-focusable"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Next"
          >
            <ArrowIcon dir="right" />
          </button>
        </div>

        {openCard && (
          <div
            className="nova-cards-carousel__overlay"
            role="dialog"
            aria-modal="true"
            aria-label={
              typeof openCard.title === "string" ? openCard.title : "Card"
            }
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenId(null);
            }}
          >
            <div className="nova-cards-carousel__panel">
              <button
                type="button"
                className="nova-cards-carousel__close nova-focusable"
                onClick={() => setOpenId(null)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
              {openCard.image && (
                <div
                  className="nova-cards-carousel__panel-media"
                  style={{ backgroundImage: `url("${openCard.image}")` }}
                  aria-hidden="true"
                />
              )}
              <div className="nova-cards-carousel__panel-body">
                {openCard.category && (
                  <span className="nova-cards-carousel__category">
                    {openCard.category}
                  </span>
                )}
                {openCard.title && (
                  <h3 className="nova-cards-carousel__panel-title">
                    {openCard.title}
                  </h3>
                )}
                <div className="nova-cards-carousel__panel-content">
                  {openCard.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
