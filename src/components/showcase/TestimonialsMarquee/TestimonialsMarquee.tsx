import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TestimonialsMarquee.css";

export interface Testimonial {
  /** Quote body. */
  quote: React.ReactNode;
  /** Author name. */
  name: React.ReactNode;
  /** Author role / company. */
  role?: React.ReactNode;
  /** Optional avatar image URL. */
  avatar?: string;
}

export interface TestimonialsMarqueeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Testimonials to display, split across rows. */
  testimonials: Testimonial[];
  /** Number of marquee rows (alternating direction). Defaults `3`. */
  rows?: number;
  /** Seconds for one full marquee loop. Defaults `40`. */
  speed?: number;
  /** Pause the marquee while hovered. Defaults `true`. */
  pauseOnHover?: boolean;
  /** Show a left/right fade mask over the edges. Defaults `true`. */
  edgeFade?: boolean;
}

function chunk<T>(items: T[], groups: number): T[][] {
  const out: T[][] = Array.from({ length: groups }, () => []);
  items.forEach((item, i) => out[i % groups].push(item));
  return out;
}

/**
 * A polished testimonials wall: quote cards marquee horizontally across multiple
 * rows in alternating directions, with optional pause-on-hover and edge fade.
 * Pure CSS animation (content duplicated for a seamless loop); reduced motion is
 * handled in CSS by halting the animation.
 */
export const TestimonialsMarquee = forwardRef<
  HTMLDivElement,
  TestimonialsMarqueeProps
>(function TestimonialsMarquee(
  {
    testimonials,
    rows = 3,
    speed = 40,
    pauseOnHover = true,
    edgeFade = true,
    className,
    ...rest
  },
  ref
) {
  const lanes = chunk(testimonials, Math.max(1, rows));

  return (
    <div
      ref={ref}
      className={cn(
        "nova-testimonials-marquee",
        edgeFade && "nova-testimonials-marquee--fade",
        pauseOnHover && "nova-testimonials-marquee--pausable",
        className
      )}
      {...rest}
    >
      {lanes.map((lane, laneIndex) => {
        if (lane.length === 0) return null;
        const reverse = laneIndex % 2 === 1;
        return (
          <div
            key={laneIndex}
            className={cn(
              "nova-testimonials-marquee__row",
              reverse && "nova-testimonials-marquee__row--reverse"
            )}
            style={
              { "--nova-tm-speed": `${speed}s` } as React.CSSProperties
            }
          >
            <div className="nova-testimonials-marquee__track">
              {[0, 1].map((dup) => (
                <div
                  className="nova-testimonials-marquee__group"
                  key={dup}
                  aria-hidden={dup === 1 ? "true" : undefined}
                >
                  {lane.map((t, i) => (
                    <figure
                      className="nova-testimonials-marquee__card"
                      key={i}
                    >
                      <blockquote className="nova-testimonials-marquee__quote">
                        {t.quote}
                      </blockquote>
                      <figcaption className="nova-testimonials-marquee__author">
                        {t.avatar && (
                          <img
                            className="nova-testimonials-marquee__avatar"
                            src={t.avatar}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span className="nova-testimonials-marquee__meta">
                          <span className="nova-testimonials-marquee__name">
                            {t.name}
                          </span>
                          {t.role && (
                            <span className="nova-testimonials-marquee__role">
                              {t.role}
                            </span>
                          )}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
