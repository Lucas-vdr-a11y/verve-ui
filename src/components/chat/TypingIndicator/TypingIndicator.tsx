import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TypingIndicator.css";

export interface TypingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar slot shown before the bubble. */
  avatar?: React.ReactNode;
  /** Optional text label (e.g. "Nova is typing"). */
  label?: React.ReactNode;
  /** Accessible status text announced to assistive tech. Defaults to `"Typing"`. */
  ariaLabel?: string;
}

export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  function TypingIndicator(
    { avatar, label, ariaLabel = "Typing", className, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn("nova-typing-indicator", className)}
        role="status"
        aria-label={ariaLabel}
        {...rest}
      >
        {avatar != null && (
          <div className="nova-typing-indicator__avatar">{avatar}</div>
        )}
        <div className="nova-typing-indicator__bubble">
          <span className="nova-typing-indicator__dots" aria-hidden="true">
            <span className="nova-typing-indicator__dot" />
            <span className="nova-typing-indicator__dot" />
            <span className="nova-typing-indicator__dot" />
          </span>
          {label != null && (
            <span className="nova-typing-indicator__label">{label}</span>
          )}
        </div>
      </div>
    );
  }
);
