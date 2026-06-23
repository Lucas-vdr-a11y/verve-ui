import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TestimonialCard.css";

export interface TestimonialCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** The testimonial quote. */
  quote: React.ReactNode;
  /** Author name. */
  author: React.ReactNode;
  /** Author role and/or company, e.g. "CTO, Acme". */
  role?: React.ReactNode;
  /** Avatar slot (e.g. an <img> or initials element). */
  avatar?: React.ReactNode;
  /** Star rating from 0–5. Renders the star row when provided. */
  rating?: number;
}

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77 4.8 17.5l.99-5.78L1.58 7.62l5.82-.85L10 1.5z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * TestimonialCard — a quote with author identity and optional star rating.
 */
export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  function TestimonialCard(
    { quote, author, role, avatar, rating, className, ...rest },
    ref,
  ) {
    const stars =
      rating !== undefined
        ? Math.max(0, Math.min(5, Math.round(rating)))
        : undefined;

    return (
      <figure
        ref={ref}
        className={cn("nova-testimonial-card", className)}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {stars !== undefined && (
          <div
            className="nova-testimonial-card__rating"
            role="img"
            aria-label={`Rated ${stars} out of 5`}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="nova-testimonial-card__star">
                <Star filled={i < stars} />
              </span>
            ))}
          </div>
        )}

        <blockquote className="nova-testimonial-card__quote">{quote}</blockquote>

        <figcaption className="nova-testimonial-card__author">
          {avatar && (
            <span className="nova-testimonial-card__avatar" aria-hidden="true">
              {avatar}
            </span>
          )}
          <span className="nova-testimonial-card__author-meta">
            <span className="nova-testimonial-card__author-name">{author}</span>
            {role && (
              <span className="nova-testimonial-card__author-role">{role}</span>
            )}
          </span>
        </figcaption>
      </figure>
    );
  },
);
