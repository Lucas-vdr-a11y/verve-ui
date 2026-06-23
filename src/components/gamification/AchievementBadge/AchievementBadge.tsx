import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AchievementBadge.css";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export interface AchievementBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Metallic tier of the medal. Defaults to `"bronze"`. */
  tier?: AchievementTier;
  /** Short title of the achievement. */
  label: string;
  /** Optional supporting description. */
  description?: React.ReactNode;
  /** When `true` the badge is greyed out and shows a lock icon. */
  locked?: boolean;
  /** Custom icon rendered inside the medal (defaults to a trophy). */
  icon?: React.ReactNode;
  /** Size of the medal. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M6 4h12v3a6 6 0 0 1-12 0V4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6 5H4a2 2 0 0 0 0 4h2M18 5h2a2 2 0 0 1 0 4h-2M12 13v3m-3 3h6m-5 0 .5-3h3l.5 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="nova-achievement-badge__lock"
  >
    <rect
      x="5"
      y="11"
      width="14"
      height="9"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 11V8a4 4 0 0 1 8 0v3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const AchievementBadge = forwardRef<
  HTMLDivElement,
  AchievementBadgeProps
>(function AchievementBadge(
  {
    tier = "bronze",
    label,
    description,
    locked = false,
    icon,
    size = "md",
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "nova-achievement-badge",
        `nova-achievement-badge--${tier}`,
        `nova-achievement-badge--${size}`,
        locked && "nova-achievement-badge--locked",
        className
      )}
      data-tier={tier}
      aria-disabled={locked || undefined}
      {...rest}
    >
      <div className="nova-achievement-badge__medal">
        <span className="nova-achievement-badge__icon">
          {locked ? <LockIcon /> : icon ?? <TrophyIcon />}
        </span>
        {!locked && <span className="nova-achievement-badge__shine" aria-hidden="true" />}
      </div>
      <div className="nova-achievement-badge__body">
        <span className="nova-achievement-badge__label">
          {label}
          <span className="nova-achievement-badge__sr">
            {locked ? " (locked)" : " (unlocked)"}
          </span>
        </span>
        {description != null && (
          <span className="nova-achievement-badge__description">
            {description}
          </span>
        )}
      </div>
    </div>
  );
});
