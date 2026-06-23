import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Steps.css";

export type StepStatus = "complete" | "current" | "upcoming";
export type StepsOrientation = "horizontal" | "vertical";

export interface StepItem {
  /** Step title. */
  title: React.ReactNode;
  /** Optional supporting description. */
  description?: React.ReactNode;
  /** Optional custom icon shown inside the index circle. */
  icon?: React.ReactNode;
}

export interface StepsProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Ordered list of steps. */
  items: StepItem[];
  /**
   * Index (0-based) of the active step. Steps before it are `complete`,
   * the step itself is `current`, and steps after it are `upcoming`.
   * Ignored for any item that supplies its own `status`.
   */
  current?: number;
  /** Layout orientation. Defaults to `"horizontal"`. */
  orientation?: StepsOrientation;
  /** Render a check icon for completed steps. Defaults to `true`. */
  showCheck?: boolean;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  {
    items,
    current = 0,
    orientation = "horizontal",
    showCheck = true,
    className,
    ...rest
  },
  ref
) {
  return (
    <ol
      ref={ref}
      className={cn(
        "nova-steps",
        `nova-steps--${orientation}`,
        className
      )}
      {...rest}
    >
      {items.map((item, index) => {
        const status: StepStatus =
          index < current
            ? "complete"
            : index === current
            ? "current"
            : "upcoming";
        const isLast = index === items.length - 1;

        return (
          <li
            key={index}
            className={cn("nova-steps__item", `nova-steps__item--${status}`)}
            aria-current={status === "current" ? "step" : undefined}
          >
            <div className="nova-steps__indicator">
              <span className="nova-steps__circle" aria-hidden="true">
                {item.icon ? (
                  item.icon
                ) : status === "complete" && showCheck ? (
                  <CheckIcon />
                ) : (
                  <span className="nova-steps__number">{index + 1}</span>
                )}
              </span>
              {!isLast && <span className="nova-steps__connector" aria-hidden="true" />}
            </div>

            <div className="nova-steps__content">
              <span className="nova-steps__title">{item.title}</span>
              {item.description != null && (
                <span className="nova-steps__description">
                  {item.description}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
