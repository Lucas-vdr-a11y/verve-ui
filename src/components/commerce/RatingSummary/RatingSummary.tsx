import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./RatingSummary.css";

export interface RatingSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Average rating, 0–5. */
  average: number;
  /** Total number of ratings. Defaults to the sum of `distribution`. */
  total?: number;
  /**
   * Count of ratings per star, indexed 1→5 stars.
   * `{ 5: 120, 4: 30, 3: 8, 2: 2, 1: 1 }`. Missing keys count as 0.
   */
  distribution?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
  /** Maximum stars. @default 5 */
  max?: number;
  /** BCP 47 locale for number formatting. @default "en-US" */
  locale?: string;
  /** Hide the per-star distribution bars. */
  hideBreakdown?: boolean;
}

const STAR_PATH =
  "M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77 4.8 17.5l.99-5.78L1.58 7.62l5.82-.85L10 1.5z";

const Star = ({ fill, uid }: { fill: number; uid: string }) => {
  // fill: 0..1 fraction of this star that is filled.
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  const clipId = `nova-star-clip-${uid}`;
  return (
    <svg
      className="nova-rating-summary__star"
      viewBox="0 0 20 20"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="nova-rating-summary__star-bg"
        d={STAR_PATH}
        fill="currentColor"
      />
      <clipPath id={clipId}>
        <rect x="0" y="0" width={`${pct}%`} height="100%" />
      </clipPath>
      <path
        className="nova-rating-summary__star-fill"
        d={STAR_PATH}
        fill="currentColor"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
};

const Stars = ({
  value,
  max,
  uid,
}: {
  value: number;
  max: number;
  uid: string;
}) => (
  <span className="nova-rating-summary__stars" aria-hidden="true">
    {Array.from({ length: max }, (_, i) => (
      <Star key={i} fill={value - i} uid={`${uid}-${i}`} />
    ))}
  </span>
);

function formatNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return String(n);
  }
}

/**
 * RatingSummary — product rating overview: a big average, a star display, the
 * total count, and a per-star distribution breakdown (5→1).
 */
export const RatingSummary = forwardRef<HTMLDivElement, RatingSummaryProps>(
  function RatingSummary(
    {
      average,
      total,
      distribution = {},
      max = 5,
      locale = "en-US",
      hideBreakdown = false,
      className,
      ...rest
    },
    ref,
  ) {
    const stars = [5, 4, 3, 2, 1] as const;
    const sum = stars.reduce((acc, s) => acc + (distribution[s] ?? 0), 0);
    const totalCount = total ?? sum;
    const clampedAvg = Math.max(0, Math.min(max, average));
    // useId is SSR-safe; strip ":" so the value is a valid url(#…) fragment.
    const uid = useId().replace(/:/g, "");

    return (
      <div
        ref={ref}
        className={cn("nova-rating-summary", className)}
        role="group"
        aria-label={`Rated ${clampedAvg.toFixed(1)} out of ${max} from ${formatNumber(totalCount, locale)} ratings`}
        {...rest}
      >
        <div className="nova-rating-summary__overview">
          <span className="nova-rating-summary__average">
            {clampedAvg.toFixed(1)}
          </span>
          <Stars value={clampedAvg} max={max} uid={uid} />
          <span className="nova-rating-summary__count">
            {formatNumber(totalCount, locale)}{" "}
            {totalCount === 1 ? "rating" : "ratings"}
          </span>
        </div>

        {!hideBreakdown && (
          <div className="nova-rating-summary__breakdown">
            {stars.map((s) => {
              const count = distribution[s] ?? 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={s} className="nova-rating-summary__bar-row">
                  <span className="nova-rating-summary__bar-label">
                    {s} <span aria-hidden="true">★</span>
                  </span>
                  <span
                    className="nova-rating-summary__bar-track"
                    role="img"
                    aria-label={`${s} stars: ${formatNumber(count, locale)} (${Math.round(pct)}%)`}
                  >
                    <span
                      className="nova-rating-summary__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="nova-rating-summary__bar-count">
                    {formatNumber(count, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
