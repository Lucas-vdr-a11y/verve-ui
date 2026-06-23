import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./StatusIndicator.css";

export type StatusIndicatorStatus =
  | "online"
  | "offline"
  | "busy"
  | "away"
  | "success"
  | "warning"
  | "error"
  | "idle";
export type StatusIndicatorSize = "sm" | "md" | "lg";

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status state driving color + default label. Defaults to `"idle"`. */
  status?: StatusIndicatorStatus;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: StatusIndicatorSize;
  /** Animated pulse halo on the dot. Defaults to `false`. */
  pulse?: boolean;
  /**
   * Visible text label. When omitted, a humanized version of `status` is used.
   * Pass `null` to render the dot only (still announced via `aria-label`).
   */
  label?: React.ReactNode;
}

const DEFAULT_LABELS: Record<StatusIndicatorStatus, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
  success: "Success",
  warning: "Warning",
  error: "Error",
  idle: "Idle",
};

/**
 * StatusIndicator — a labelled status: colored dot + text describing a state.
 * Distinct from `Indicator`, which is a positioned corner notification dot.
 */
export const StatusIndicator = forwardRef<
  HTMLSpanElement,
  StatusIndicatorProps
>(function StatusIndicator(
  { status = "idle", size = "md", pulse = false, label, className, ...rest },
  ref
) {
  const text = label === undefined ? DEFAULT_LABELS[status] : label;
  const hasText = text != null && text !== "";
  const accessibleLabel = hasText ? undefined : DEFAULT_LABELS[status];

  return (
    <span
      ref={ref}
      role="status"
      aria-label={accessibleLabel}
      className={cn(
        "nova-status-indicator",
        `nova-status-indicator--${status}`,
        `nova-status-indicator--${size}`,
        pulse && "nova-status-indicator--pulse",
        className
      )}
      {...rest}
    >
      <span className="nova-status-indicator__dot" aria-hidden="true">
        {pulse && (
          <span className="nova-status-indicator__ping" aria-hidden="true" />
        )}
      </span>
      {hasText && (
        <span className="nova-status-indicator__label">{text}</span>
      )}
    </span>
  );
});
