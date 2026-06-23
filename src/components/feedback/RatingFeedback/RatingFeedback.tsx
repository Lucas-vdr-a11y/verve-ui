import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./RatingFeedback.css";

export type RatingFeedbackType = "star" | "emoji" | "thumbs";

export interface RatingFeedbackValue {
  /** Selected rating. For thumbs: 1 = up, 0 = down. For star/emoji: 1..count. */
  rating: number;
  /** Optional free-text comment. */
  comment?: string;
}

export interface RatingFeedbackProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onSubmit" | "onChange" | "defaultValue" | "title"
  > {
  /** Scale type. Defaults to `"star"`. */
  type?: RatingFeedbackType;
  /** Number of rating items (star/emoji only). Defaults to `5`. */
  count?: number;
  /** Prompt shown above the scale. */
  title?: React.ReactNode;
  /** Show a comment textarea once a rating is picked. Defaults to `false`. */
  withComment?: boolean;
  /** Placeholder for the comment box. */
  commentPlaceholder?: string;
  /** Label for the submit button. Defaults to `"Submit"`. */
  submitLabel?: string;
  /** Controlled rating value. */
  rating?: number;
  /** Fired whenever the rating selection changes. */
  onRatingChange?: (rating: number) => void;
  /** Fired when the user submits their feedback. */
  onSubmit?: (value: RatingFeedbackValue) => void;
}

const EMOJI = ["😡", "🙁", "😐", "🙂", "😍"];

/**
 * RatingFeedback — a compact feedback widget: a star / emoji / thumbs scale
 * with an optional comment box and a submit action. Controlled or uncontrolled
 * via `rating` / `onRatingChange`.
 */
export const RatingFeedback = forwardRef<HTMLDivElement, RatingFeedbackProps>(
  function RatingFeedback(
    {
      type = "star",
      count = 5,
      title,
      withComment = false,
      commentPlaceholder = "Tell us more (optional)",
      submitLabel = "Submit",
      rating: ratingProp,
      onRatingChange,
      onSubmit,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = ratingProp !== undefined;
    const [internalRating, setInternalRating] = useState(0);
    const rating = isControlled ? ratingProp : internalRating;
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    const setRating = (next: number) => {
      if (!isControlled) setInternalRating(next);
      onRatingChange?.(next);
    };

    const hasRating = type === "thumbs" ? rating !== 0 : rating > 0;

    const handleSubmit = () => {
      if (!hasRating) return;
      onSubmit?.({
        rating,
        comment: withComment ? comment : undefined,
      });
    };

    const renderScale = () => {
      if (type === "thumbs") {
        const items: Array<{ value: number; label: string; up: boolean }> = [
          { value: 1, label: "Thumbs up", up: true },
          { value: 0, label: "Thumbs down", up: false },
        ];
        return items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "nova-rating-feedback__item",
              "nova-rating-feedback__item--thumb",
              hasRating &&
                rating === item.value &&
                "nova-rating-feedback__item--selected nova-focusable"
            )}
            aria-pressed={hasRating && rating === item.value}
            aria-label={item.label}
            onClick={() => setRating(item.value)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d={
                  item.up
                    ? "M7 10v11H3V10h4zm3 0l4-7c1.5 0 2.5 1 2.5 2.5L15.5 10H21c1 0 1.7 1 1.4 2l-2 7c-.2.7-.9 1-1.4 1H10V10z"
                    : "M17 14V3h4v11h-4zm-3 0l-4 7c-1.5 0-2.5-1-2.5-2.5L8.5 14H3c-1 0-1.7-1-1.4-2l2-7c.2-.7.9-1 1.4-1h9v10z"
                }
                fill="currentColor"
              />
            </svg>
          </button>
        ));
      }

      // star / emoji share the 1..count selection model
      return Array.from({ length: count }, (_, i) => {
        const value = i + 1;
        const active = (hover || rating) >= value;
        const isEmoji = type === "emoji";
        const emojiGlyph = isEmoji
          ? EMOJI[Math.round(((value - 1) / Math.max(count - 1, 1)) * 4)]
          : null;
        return (
          <button
            key={value}
            type="button"
            className={cn(
              "nova-rating-feedback__item",
              `nova-rating-feedback__item--${type}`,
              active && "nova-rating-feedback__item--active",
              rating === value && "nova-rating-feedback__item--selected"
            )}
            aria-pressed={rating === value}
            aria-label={`${value} of ${count}`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(value)}
            onBlur={() => setHover(0)}
          >
            {isEmoji ? (
              <span className="nova-rating-feedback__emoji" aria-hidden="true">
                {emojiGlyph}
              </span>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.8 6.1 20.3l1.2-6.6L2.5 9l6.6-.9L12 2z"
                  fill={active ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      });
    };

    return (
      <div
        ref={ref}
        className={cn("nova-rating-feedback", className)}
        {...rest}
      >
        {title != null && (
          <div className="nova-rating-feedback__title">{title}</div>
        )}
        <div
          className={cn(
            "nova-rating-feedback__scale",
            `nova-rating-feedback__scale--${type}`
          )}
          role="group"
          aria-label={typeof title === "string" ? title : "Rating"}
        >
          {renderScale()}
        </div>
        {withComment && hasRating && (
          <textarea
            className="nova-rating-feedback__comment nova-focusable"
            placeholder={commentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        )}
        {onSubmit && (
          <button
            type="button"
            className="nova-rating-feedback__submit nova-focusable"
            disabled={!hasRating}
            aria-disabled={!hasRating}
            onClick={handleSubmit}
          >
            {submitLabel}
          </button>
        )}
      </div>
    );
  }
);
