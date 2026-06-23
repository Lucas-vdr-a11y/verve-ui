import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressQuest.css";

export interface QuestObjective {
  /** Objective label. */
  label: React.ReactNode;
  /** Whether the objective is complete. */
  done?: boolean;
}

export interface ProgressQuestProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Quest title. */
  title: string;
  /** Optional short description / flavour text. */
  description?: React.ReactNode;
  /** Checklist of objectives. Progress ring is derived from these. */
  objectives: QuestObjective[];
  /** Reward preview (icon + label). */
  reward?: React.ReactNode;
  /** Icon for the reward preview (defaults to a chest). */
  rewardIcon?: React.ReactNode;
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M5 12.5 10 17.5 19 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChestIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2H4V9Z" fill="currentColor" opacity="0.9" />
    <rect x="4" y="11" width="16" height="8" rx="1.5" fill="currentColor" opacity="0.7" />
    <rect x="10.5" y="10" width="3" height="4" rx="1" fill="rgb(255 255 255 / 0.9)" />
  </svg>
);

const RING = { d: 56, stroke: 6 };

export const ProgressQuest = forwardRef<HTMLDivElement, ProgressQuestProps>(
  function ProgressQuest(
    {
      title,
      description,
      objectives,
      reward,
      rewardIcon,
      className,
      ...rest
    },
    ref
  ) {
    const total = objectives.length;
    const completed = objectives.filter((o) => o.done).length;
    const ratio = total > 0 ? completed / total : 0;
    const complete = total > 0 && completed === total;

    const r = (RING.d - RING.stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - ratio);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-progress-quest",
          complete && "nova-progress-quest--complete",
          className
        )}
        {...rest}
      >
        <div className="nova-progress-quest__head">
          <div className="nova-progress-quest__heading">
            <span className="nova-progress-quest__title">{title}</span>
            {description != null && (
              <span className="nova-progress-quest__description">
                {description}
              </span>
            )}
          </div>
          <div
            className="nova-progress-quest__ring"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
            aria-label="Quest progress"
          >
            <svg
              width={RING.d}
              height={RING.d}
              viewBox={`0 0 ${RING.d} ${RING.d}`}
              aria-hidden="true"
            >
              <circle
                className="nova-progress-quest__ring-track"
                cx={RING.d / 2}
                cy={RING.d / 2}
                r={r}
                fill="none"
                strokeWidth={RING.stroke}
              />
              <circle
                className="nova-progress-quest__ring-fill"
                cx={RING.d / 2}
                cy={RING.d / 2}
                r={r}
                fill="none"
                strokeWidth={RING.stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${RING.d / 2} ${RING.d / 2})`}
              />
            </svg>
            <span className="nova-progress-quest__ring-text">
              {completed}/{total}
            </span>
          </div>
        </div>

        <ul className="nova-progress-quest__objectives">
          {objectives.map((o, i) => (
            <li
              key={i}
              className={cn(
                "nova-progress-quest__objective",
                o.done && "nova-progress-quest__objective--done"
              )}
            >
              <span className="nova-progress-quest__check" aria-hidden="true">
                {o.done && <CheckIcon />}
              </span>
              <span className="nova-progress-quest__objective-label">
                {o.label}
              </span>
              <span className="nova-progress-quest__sr">
                {o.done ? " (complete)" : " (incomplete)"}
              </span>
            </li>
          ))}
        </ul>

        {reward != null && (
          <div className="nova-progress-quest__reward">
            <span className="nova-progress-quest__reward-icon">
              {rewardIcon ?? <ChestIcon />}
            </span>
            <span className="nova-progress-quest__reward-label">{reward}</span>
          </div>
        )}
      </div>
    );
  }
);
