import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./EmptyCard.css";

export interface EmptyCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon slot. Defaults to a plus icon. */
  icon?: React.ReactNode;
  /** Primary label, e.g. "Add new". */
  label: React.ReactNode;
  /** Optional secondary hint below the label. */
  hint?: React.ReactNode;
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * EmptyCard — a dashed placeholder card for "add new" affordances.
 * Renders as a button so it is keyboard-operable and clickable.
 */
export const EmptyCard = forwardRef<HTMLButtonElement, EmptyCardProps>(
  function EmptyCard(
    { icon, label, hint, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn("nova-empty-card", className)}
        {...rest}
      >
        <span className="nova-empty-card__icon" aria-hidden="true">
          {icon ?? <PlusIcon />}
        </span>
        <span className="nova-empty-card__label">{label}</span>
        {hint && <span className="nova-empty-card__hint">{hint}</span>}
      </button>
    );
  },
);
