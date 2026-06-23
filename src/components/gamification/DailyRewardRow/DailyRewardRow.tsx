import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DailyRewardRow.css";

export interface DailyReward {
  /** Day label (e.g. "Day 1" or "1"). Falls back to the index + 1. */
  day?: React.ReactNode;
  /** Reward amount/label shown on the tile. */
  reward?: React.ReactNode;
  /** Icon for the reward (defaults to a coin). */
  icon?: React.ReactNode;
}

export interface DailyRewardRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Daily tiles, typically 7. */
  rewards: DailyReward[];
  /** Index of "today" (the claimable tile). */
  today: number;
  /** How many days have already been claimed (tiles `0..claimed-1`). */
  claimedCount?: number;
  /** Label on the claim button. Defaults to `"Claim"`. */
  claimLabel?: string;
  /** Fired when the user claims today's reward. */
  onClaim?: (index: number) => void;
}

const CoinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.9" />
    <circle cx="12" cy="12" r="6.5" fill="none" stroke="rgb(255 255 255 / 0.7)" strokeWidth="1.2" />
    <path d="M12 8v8M9.5 10.5h3.2a1.5 1.5 0 0 1 0 3H9.5" stroke="rgb(255 255 255 / 0.9)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DailyRewardRow = forwardRef<HTMLDivElement, DailyRewardRowProps>(
  function DailyRewardRow(
    {
      rewards,
      today,
      claimedCount = today,
      claimLabel = "Claim",
      onClaim,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-daily-reward-row", className)}
        role="list"
        {...rest}
      >
        {rewards.map((r, i) => {
          const claimed = i < claimedCount;
          const isToday = i === today && !claimed;
          const state = claimed ? "claimed" : isToday ? "today" : "locked";
          return (
            <div
              key={i}
              role="listitem"
              className={cn(
                "nova-daily-reward-row__tile",
                `nova-daily-reward-row__tile--${state}`
              )}
              aria-label={`Day ${i + 1}: ${state}`}
            >
              <span className="nova-daily-reward-row__day">
                {r.day ?? `Day ${i + 1}`}
              </span>
              <span className="nova-daily-reward-row__icon">
                {claimed ? <CheckIcon /> : r.icon ?? <CoinIcon />}
              </span>
              {r.reward != null && (
                <span className="nova-daily-reward-row__reward">{r.reward}</span>
              )}
              {isToday && (
                <button
                  type="button"
                  className="nova-daily-reward-row__claim"
                  onClick={() => onClaim?.(i)}
                >
                  {claimLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
