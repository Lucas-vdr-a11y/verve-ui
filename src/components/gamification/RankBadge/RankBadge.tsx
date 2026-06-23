import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./RankBadge.css";

export type Rank =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master";

export interface RankBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Tier/rank. Drives the gradient + emblem color. */
  rank: Rank;
  /** Optional division within the rank (e.g. "I", "II", 3). */
  division?: React.ReactNode;
  /** Optional points / LP shown beneath the rank name. */
  points?: number;
  /** Unit suffix for points. Defaults to `"LP"`. */
  pointsUnit?: string;
  /** Display name override (defaults to a capitalised `rank`). */
  name?: string;
  /** Size of the emblem. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const RANK_LABEL: Record<Rank, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  master: "Master",
};

const EmblemIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="m12 7 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6L7 10.8l3.6-.5L12 7Z"
      fill="rgb(255 255 255 / 0.85)"
    />
  </svg>
);

export const RankBadge = forwardRef<HTMLDivElement, RankBadgeProps>(
  function RankBadge(
    {
      rank,
      division,
      points,
      pointsUnit = "LP",
      name,
      size = "md",
      className,
      ...rest
    },
    ref
  ) {
    const title = name ?? RANK_LABEL[rank];
    return (
      <div
        ref={ref}
        className={cn(
          "nova-rank-badge",
          `nova-rank-badge--${rank}`,
          `nova-rank-badge--${size}`,
          className
        )}
        {...rest}
      >
        <span className="nova-rank-badge__emblem">
          <EmblemIcon />
          {division != null && (
            <span className="nova-rank-badge__division">{division}</span>
          )}
        </span>
        <span className="nova-rank-badge__info">
          <span className="nova-rank-badge__name">
            {title}
            {division != null && (
              <span className="nova-rank-badge__div-text"> {division}</span>
            )}
          </span>
          {points != null && (
            <span className="nova-rank-badge__points">
              {points.toLocaleString()} {pointsUnit}
            </span>
          )}
        </span>
      </div>
    );
  }
);
