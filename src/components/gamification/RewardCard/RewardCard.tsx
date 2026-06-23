import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./RewardCard.css";

export interface RewardCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onClick"> {
  /** Reward title. */
  title: string;
  /** Optional supporting text. */
  description?: React.ReactNode;
  /** Icon node or image URL. */
  icon?: React.ReactNode;
  /** Image URL used in place of `icon`. */
  image?: string;
  /** Cost/points shown on the claim button. */
  cost?: number;
  /** Unit label next to the cost. Defaults to `"pts"`. */
  costUnit?: string;
  /** Controlled claimed state. */
  claimed?: boolean;
  /** Disable the claim button. */
  disabled?: boolean;
  /** Text for the claim button. Defaults to `"Claim"`. */
  claimLabel?: string;
  /** Text shown once claimed. Defaults to `"Claimed"`. */
  claimedLabel?: string;
  /** Fired when the claim button is pressed (when not already claimed). */
  onClaim?: () => void;
}

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <rect x="3" y="9" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 13h18M12 9v11" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 9S10.5 4 8 5.2C6.2 6 7 9 9 9h3Zm0 0s1.5-5 4-3.8C16.8 6 16 9 14 9h-2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M5 12.5 10 17.5 19 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RewardCard = forwardRef<HTMLDivElement, RewardCardProps>(
  function RewardCard(
    {
      title,
      description,
      icon,
      image,
      cost,
      costUnit = "pts",
      claimed: claimedProp,
      disabled = false,
      claimLabel = "Claim",
      claimedLabel = "Claimed",
      onClaim,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const [internalClaimed, setInternalClaimed] = useState(false);
    const [pop, setPop] = useState(false);
    const claimed = claimedProp ?? internalClaimed;

    const handleClaim = () => {
      if (claimed || disabled) return;
      if (claimedProp === undefined) setInternalClaimed(true);
      if (!reduced) {
        setPop(true);
        window.setTimeout(() => setPop(false), 600);
      }
      onClaim?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-reward-card",
          claimed && "nova-reward-card--claimed",
          disabled && "nova-reward-card--disabled",
          className
        )}
        {...rest}
      >
        <div className="nova-reward-card__media">
          {image ? (
            <img className="nova-reward-card__img" src={image} alt="" />
          ) : (
            <span className="nova-reward-card__icon">
              {icon ?? <GiftIcon />}
            </span>
          )}
          {pop && (
            <span className="nova-reward-card__pop" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="nova-reward-card__spark"
                  style={{ ["--i" as string]: i }}
                />
              ))}
            </span>
          )}
        </div>
        <div className="nova-reward-card__body">
          <span className="nova-reward-card__title">{title}</span>
          {description != null && (
            <span className="nova-reward-card__description">{description}</span>
          )}
        </div>
        <button
          type="button"
          className="nova-reward-card__claim"
          onClick={handleClaim}
          disabled={claimed || disabled}
          aria-pressed={claimed}
        >
          {claimed ? (
            <>
              <span className="nova-reward-card__claim-icon">
                <CheckIcon />
              </span>
              {claimedLabel}
            </>
          ) : (
            <>
              {claimLabel}
              {cost != null && (
                <span className="nova-reward-card__cost">
                  {cost.toLocaleString()} {costUnit}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    );
  }
);
