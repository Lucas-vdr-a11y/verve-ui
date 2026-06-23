import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ReviewCard.css";

export interface ReviewCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Reviewer display name. */
  author: string;
  /** Avatar image URL. When absent, initials are shown. */
  avatarSrc?: string;
  /** Star rating 0–`maxRating`. */
  rating: number;
  /** Maximum rating. @default 5 */
  maxRating?: number;
  /** Whether this is a verified purchase. */
  verified?: boolean;
  /** Review date — a preformatted string or a Date. */
  date?: string | Date;
  /** BCP 47 locale for date formatting. @default "en-US" */
  locale?: string;
  /** Review headline. */
  title?: React.ReactNode;
  /** Review body text. */
  children?: React.ReactNode;
  /** Initial helpful count. @default 0 */
  helpfulCount?: number;
  /** Controlled "marked helpful" state. */
  marked?: boolean;
  /** Called when the helpful action is toggled. */
  onHelpfulChange?: (marked: boolean) => void;
  /** Hide the helpful action row. @default false */
  hideHelpful?: boolean;
}

const StarIcon = ({ fill }: { fill: "full" | "half" | "empty" }) => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    {fill === "half" && (
      <defs>
        <linearGradient id="nova-review-half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
    )}
    <path
      d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z"
      fill={fill === "full" ? "currentColor" : fill === "half" ? "url(#nova-review-half)" : "none"}
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M8 1l1.8 1.3 2.2-.2.6 2.1 1.8 1.3-.9 2 .9 2-1.8 1.3-.6 2.1-2.2-.2L8 15l-1.8-1.3-2.2.2-.6-2.1L1.6 10.5l.9-2-.9-2 1.8-1.3.6-2.1 2.2.2L8 1z"
      fill="currentColor"
    />
    <path
      d="M5.5 8l1.6 1.6L10.8 6"
      fill="none"
      stroke="var(--nova-surface)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThumbIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M5 7l2.5-5c.9 0 1.7.8 1.7 1.8V6h3.1c.8 0 1.4.7 1.2 1.5l-1 4c-.1.6-.7 1-1.3 1H5V7zM2 7h2v6H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
      fill="currentColor"
    />
  </svg>
);

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(date: string | Date, locale: string): string {
  if (typeof date === "string") return date;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

/**
 * ReviewCard — a single customer review: avatar/name, verified badge, star
 * rating, date, title, body and a helpful (count + thumbs) action.
 */
export const ReviewCard = forwardRef<HTMLElement, ReviewCardProps>(function ReviewCard(
  {
    author,
    avatarSrc,
    rating,
    maxRating = 5,
    verified = false,
    date,
    locale = "en-US",
    title,
    children,
    helpfulCount = 0,
    marked,
    onHelpfulChange,
    hideHelpful = false,
    className,
    ...rest
  },
  ref,
) {
  const isControlled = marked !== undefined;
  const [internalMarked, setInternalMarked] = useState(false);
  const current = isControlled ? marked : internalMarked;

  const handleHelpful = useCallback(() => {
    const next = !current;
    if (!isControlled) setInternalMarked(next);
    onHelpfulChange?.(next);
  }, [current, isControlled, onHelpfulChange]);

  const displayCount = helpfulCount + (!isControlled && current ? 1 : 0);
  const ratingLabel = `${rating} out of ${maxRating} stars`;
  const formattedDate = date !== undefined ? formatDate(date, locale) : undefined;

  return (
    <article
      ref={ref}
      className={cn("nova-review-card", className)}
      {...rest}
    >
      <header className="nova-review-card__header">
        <div className="nova-review-card__avatar" aria-hidden="true">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="nova-review-card__avatar-img" />
          ) : (
            <span className="nova-review-card__initials">{initialsOf(author)}</span>
          )}
        </div>
        <div className="nova-review-card__meta">
          <div className="nova-review-card__author-row">
            <span className="nova-review-card__author">{author}</span>
            {verified && (
              <span className="nova-review-card__verified">
                <span className="nova-review-card__verified-icon">
                  <VerifiedIcon />
                </span>
                Verified
              </span>
            )}
          </div>
          <div className="nova-review-card__rating" role="img" aria-label={ratingLabel}>
            {Array.from({ length: maxRating }, (_, i) => {
              const diff = rating - i;
              const fill = diff >= 1 ? "full" : diff >= 0.5 ? "half" : "empty";
              return (
                <span key={i} className="nova-review-card__star" aria-hidden="true">
                  <StarIcon fill={fill} />
                </span>
              );
            })}
          </div>
        </div>
        {formattedDate && (
          <time className="nova-review-card__date">{formattedDate}</time>
        )}
      </header>

      {title && <h3 className="nova-review-card__title">{title}</h3>}
      {children && <div className="nova-review-card__body">{children}</div>}

      {!hideHelpful && (
        <footer className="nova-review-card__footer">
          <button
            type="button"
            className={cn(
              "nova-review-card__helpful",
              current && "nova-review-card__helpful--active",
            )}
            aria-pressed={current}
            onClick={handleHelpful}
          >
            <span className="nova-review-card__helpful-icon" aria-hidden="true">
              <ThumbIcon />
            </span>
            Helpful
            {displayCount > 0 && (
              <span className="nova-review-card__helpful-count">({displayCount})</span>
            )}
          </button>
        </footer>
      )}
    </article>
  );
});
