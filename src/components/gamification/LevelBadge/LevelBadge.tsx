import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LevelBadge.css";

export type LevelTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface LevelBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Level number shown in the center. */
  level: number;
  /** Progress toward next level, 0–1. Drives the ring. Defaults to `0`. */
  progress?: number;
  /** Tier coloring of the ring + number. Defaults to `"bronze"`. */
  tier?: LevelTier;
  /** Diameter token. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Optional caption beneath the number (e.g. "LVL"). */
  caption?: React.ReactNode;
}

const SIZES = {
  sm: { d: 48, stroke: 4 },
  md: { d: 72, stroke: 6 },
  lg: { d: 96, stroke: 7 },
} as const;

export const LevelBadge = forwardRef<HTMLDivElement, LevelBadgeProps>(
  function LevelBadge(
    {
      level,
      progress = 0,
      tier = "bronze",
      size = "md",
      caption,
      className,
      ...rest
    },
    ref
  ) {
    const { d, stroke } = SIZES[size];
    const r = (d - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const offset = c * (1 - clamped);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-level-badge",
          `nova-level-badge--${tier}`,
          `nova-level-badge--${size}`,
          className
        )}
        role="img"
        aria-label={`Level ${level}, ${Math.round(clamped * 100)}% to next`}
        {...rest}
      >
        <svg
          className="nova-level-badge__ring"
          width={d}
          height={d}
          viewBox={`0 0 ${d} ${d}`}
          aria-hidden="true"
        >
          <circle
            className="nova-level-badge__track"
            cx={d / 2}
            cy={d / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className="nova-level-badge__progress"
            cx={d / 2}
            cy={d / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${d / 2} ${d / 2})`}
          />
        </svg>
        <span className="nova-level-badge__inner">
          <span className="nova-level-badge__num">{level}</span>
          {caption != null && (
            <span className="nova-level-badge__caption">{caption}</span>
          )}
        </span>
      </div>
    );
  }
);
