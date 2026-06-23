import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Leaderboard.css";

export type LeaderboardTrend = "up" | "down" | "same";

export interface LeaderboardEntry {
  /** Stable id. Falls back to `rank` when absent. */
  id?: string | number;
  /** 1-based rank. */
  rank: number;
  /** Display name. */
  name: string;
  /** Score / points. */
  score: React.ReactNode;
  /** Optional avatar node (image, initials, etc.). */
  avatar?: React.ReactNode;
  /** Optional rank delta vs. a prior period (positive = moved up). */
  delta?: number;
  /** Explicit trend direction. Inferred from `delta` when omitted. */
  trend?: LeaderboardTrend;
}

export interface LeaderboardProps
  extends React.HTMLAttributes<HTMLOListElement> {
  /** Ranked entries. Rendered in array order. */
  entries: LeaderboardEntry[];
  /** Id (or rank) of the current user, highlighted distinctly. */
  currentUserId?: string | number;
  /** Apply medal styling to the top 3 entries by `rank`. Defaults to `true`. */
  highlightTop?: boolean;
  /** Accessible label for the list. */
  "aria-label"?: string;
}

const resolveTrend = (entry: LeaderboardEntry): LeaderboardTrend | null => {
  if (entry.trend) return entry.trend;
  if (typeof entry.delta !== "number" || entry.delta === 0) {
    return typeof entry.delta === "number" ? "same" : null;
  }
  return entry.delta > 0 ? "up" : "down";
};

const TrendIcon = ({ trend }: { trend: LeaderboardTrend }) => {
  if (trend === "same") {
    return (
      <svg viewBox="0 0 12 12" width="1em" height="1em" aria-hidden="true">
        <path d="M2 6h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const up = trend === "up";
  return (
    <svg viewBox="0 0 12 12" width="1em" height="1em" aria-hidden="true">
      <path
        d={up ? "M6 2.5 10 8H2z" : "M6 9.5 2 4h8z"}
        fill="currentColor"
      />
    </svg>
  );
};

export const Leaderboard = forwardRef<HTMLOListElement, LeaderboardProps>(
  function Leaderboard(
    {
      entries,
      currentUserId,
      highlightTop = true,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <ol ref={ref} className={cn("nova-leaderboard", className)} {...rest}>
        {entries.map((entry) => {
          const id = entry.id ?? entry.rank;
          const isCurrent =
            currentUserId != null && id === currentUserId;
          const medal =
            highlightTop && entry.rank >= 1 && entry.rank <= 3
              ? entry.rank
              : null;
          const trend = resolveTrend(entry);
          return (
            <li
              key={id}
              className={cn(
                "nova-leaderboard__row",
                medal && `nova-leaderboard__row--medal-${medal}`,
                isCurrent && "nova-leaderboard__row--current"
              )}
              aria-current={isCurrent ? "true" : undefined}
            >
              <span
                className={cn(
                  "nova-leaderboard__rank",
                  medal && "nova-leaderboard__rank--medal"
                )}
                aria-hidden={medal ? "true" : undefined}
              >
                {medal ? (
                  <span className="nova-leaderboard__medal">{entry.rank}</span>
                ) : (
                  entry.rank
                )}
              </span>
              {medal && (
                <span className="nova-sr-only">Rank {entry.rank}</span>
              )}
              {entry.avatar != null && (
                <span className="nova-leaderboard__avatar">{entry.avatar}</span>
              )}
              <span className="nova-leaderboard__name">{entry.name}</span>
              {trend && (
                <span
                  className={cn(
                    "nova-leaderboard__trend",
                    `nova-leaderboard__trend--${trend}`
                  )}
                >
                  <TrendIcon trend={trend} />
                  {typeof entry.delta === "number" && entry.delta !== 0 && (
                    <span className="nova-leaderboard__delta">
                      {Math.abs(entry.delta)}
                    </span>
                  )}
                </span>
              )}
              <span className="nova-leaderboard__score">{entry.score}</span>
            </li>
          );
        })}
      </ol>
    );
  }
);
