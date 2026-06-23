import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Children } from "react";
import { cn } from "../../../utils/cn";
import "./Carousel.css";

export interface CarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Slides — each direct child becomes one slide. */
  children?: React.ReactNode;
  /** Controlled active index. Leave undefined for uncontrolled behavior. */
  index?: number;
  /** Initial index when uncontrolled. Defaults to `0`. */
  defaultIndex?: number;
  /** Fired when the active slide changes. */
  onChange?: (index: number) => void;
  /** Auto-advance slides. Defaults to `false`. */
  autoPlay?: boolean;
  /** Auto-advance interval in ms. Defaults to `5000`. */
  interval?: number;
  /** Wrap around at the ends. Defaults to `true`. */
  loop?: boolean;
  /** Show previous/next arrows. Defaults to `true`. */
  arrows?: boolean;
  /** Show dot indicators. Defaults to `true`. */
  dots?: boolean;
  /** Pause auto-play while hovered. Defaults to `true`. */
  pauseOnHover?: boolean;
  /** Accessible label for the carousel region. */
  "aria-label"?: string;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      children,
      index: controlledIndex,
      defaultIndex = 0,
      onChange,
      autoPlay = false,
      interval = 5000,
      loop = true,
      arrows = true,
      dots = true,
      pauseOnHover = true,
      className,
      "aria-label": ariaLabel = "Carousel",
      ...rest
    },
    ref
  ) {
    const slides = Children.toArray(children);
    const count = slides.length;

    const trackRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    const isControlled = controlledIndex != null;
    const [internalIndex, setInternalIndex] = useState(defaultIndex);
    const active = isControlled ? controlledIndex : internalIndex;

    const [hovered, setHovered] = useState(false);
    // Guards programmatic scroll from being read back as a user-driven change.
    const scrollingTo = useRef<number | null>(null);

    const goTo = useCallback(
      (next: number) => {
        if (count === 0) return;
        let target = next;
        if (target < 0) target = loop ? count - 1 : 0;
        if (target > count - 1) target = loop ? 0 : count - 1;
        if (!isControlled) setInternalIndex(target);
        onChange?.(target);

        const track = trackRef.current;
        if (track) {
          const child = track.children[target] as HTMLElement | undefined;
          if (child) {
            scrollingTo.current = target;
            track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
          }
        }
      },
      [count, loop, isControlled, onChange]
    );

    const next = useCallback(() => goTo(active + 1), [goTo, active]);
    const prev = useCallback(() => goTo(active - 1), [goTo, active]);

    // Keep the track scroll position in sync when the controlled index changes
    // externally (without a smooth animation fighting the user).
    useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const child = track.children[active] as HTMLElement | undefined;
      if (child && Math.abs(track.scrollLeft - child.offsetLeft) > 2) {
        scrollingTo.current = active;
        track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      }
    }, [active]);

    // Auto-play timer.
    useEffect(() => {
      if (!autoPlay || count <= 1) return;
      if (pauseOnHover && hovered) return;
      if (!loop && active >= count - 1) return;
      const id = window.setInterval(() => goTo(active + 1), interval);
      return () => window.clearInterval(id);
    }, [autoPlay, count, pauseOnHover, hovered, loop, active, interval, goTo]);

    // Sync active index from user scroll/swipe.
    const handleScroll = useCallback(() => {
      const track = trackRef.current;
      if (!track || count === 0) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < track.children.length; i++) {
        const child = track.children[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - center);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
      if (scrollingTo.current != null) {
        if (scrollingTo.current === nearest) scrollingTo.current = null;
        return;
      }
      if (nearest !== active) {
        if (!isControlled) setInternalIndex(nearest);
        onChange?.(nearest);
      }
    }, [active, count, isControlled, onChange]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }

    const atStart = !loop && active <= 0;
    const atEnd = !loop && active >= count - 1;

    return (
      <div
        ref={rootRef}
        className={cn("nova-carousel", className)}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onMouseEnter={pauseOnHover ? () => setHovered(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setHovered(false) : undefined}
        {...rest}
      >
        <div
          ref={trackRef}
          className="nova-carousel__track"
          onScroll={handleScroll}
          tabIndex={0}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="nova-carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== active}
            >
              {slide}
            </div>
          ))}
        </div>

        {arrows && count > 1 && (
          <>
            <button
              type="button"
              className="nova-carousel__arrow nova-carousel__arrow--prev"
              onClick={prev}
              disabled={atStart}
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="nova-carousel__arrow nova-carousel__arrow--next"
              onClick={next}
              disabled={atEnd}
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
                <path
                  d="M9 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {dots && count > 1 && (
          <div className="nova-carousel__dots" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "nova-carousel__dot",
                  i === active && "nova-carousel__dot--active"
                )}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
