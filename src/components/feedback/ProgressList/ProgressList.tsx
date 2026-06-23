import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import { Spinner } from "../Spinner";
import "./ProgressList.css";

export type ProgressListStatus =
  | "pending"
  | "in-progress"
  | "done"
  | "error";

export interface ProgressListItem {
  /** Stable identifier. */
  id: string;
  /** Primary label for the task. */
  label: React.ReactNode;
  /** Optional secondary description. */
  description?: React.ReactNode;
  /** Current status. Defaults to `"pending"`. */
  status?: ProgressListStatus;
}

export interface ProgressListProps
  extends React.HTMLAttributes<HTMLOListElement> {
  /** Tasks to render. */
  items: ProgressListItem[];
  /** Show the overall "n of m done" progress summary. Defaults to `true`. */
  showSummary?: boolean;
}

const ICONS: Record<Exclude<ProgressListStatus, "in-progress">, string> = {
  pending: "",
  done: "M5 10.5l3 3 7-7",
  error: "M6 6l8 8M14 6l-8 8",
};

function StatusIcon({ status }: { status: ProgressListStatus }) {
  if (status === "in-progress") {
    return <Spinner size="sm" label="In progress" />;
  }
  if (status === "pending") {
    return <span className="nova-progress-list__bullet" aria-hidden="true" />;
  }
  return (
    <svg
      className="nova-progress-list__icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={ICONS[status]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ProgressList = forwardRef<HTMLOListElement, ProgressListProps>(
  function ProgressList(
    { items, showSummary = true, className, ...rest },
    ref
  ) {
    const total = items.length;
    const done = items.filter((it) => (it.status ?? "pending") === "done")
      .length;

    return (
      <div className="nova-progress-list">
        {showSummary && (
          <div
            className="nova-progress-list__summary"
            role="status"
            aria-live="polite"
          >
            {done} of {total} complete
          </div>
        )}
        <ol
          ref={ref}
          className={cn("nova-progress-list__items", className)}
          {...rest}
        >
          {items.map((item) => {
            const status = item.status ?? "pending";
            return (
              <li
                key={item.id}
                className={cn(
                  "nova-progress-list__item",
                  `nova-progress-list__item--${status}`
                )}
                aria-current={status === "in-progress" ? "step" : undefined}
              >
                <span className="nova-progress-list__marker">
                  <StatusIcon status={status} />
                </span>
                <span className="nova-progress-list__body">
                  <span className="nova-progress-list__label">
                    {item.label}
                  </span>
                  {item.description != null && (
                    <span className="nova-progress-list__description">
                      {item.description}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);
