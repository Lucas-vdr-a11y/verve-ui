import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Result.css";

export type ResultStatus =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "404"
  | "403"
  | "500";

export interface ResultProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Result status driving the default icon + tone. Defaults to `"info"`. */
  status?: ResultStatus;
  /** Headline. */
  title?: React.ReactNode;
  /** Supporting sub-headline. */
  subtitle?: React.ReactNode;
  /** Override the default status icon. Pass `null` to hide it. */
  icon?: React.ReactNode;
  /** Action buttons/links (e.g. "Go home", "Retry"). */
  actions?: React.ReactNode;
  /** Extra detail content rendered below actions (e.g. error stack panel). */
  extra?: React.ReactNode;
}

/** Tone bucket per status — drives the icon color. */
const STATUS_TONE: Record<ResultStatus, string> = {
  success: "success",
  error: "danger",
  info: "info",
  warning: "warning",
  "404": "info",
  "403": "warning",
  "500": "danger",
};

function StatusIcon({ status }: { status: ResultStatus }) {
  // Numeric statuses render as a large code rather than a glyph.
  if (status === "404" || status === "403" || status === "500") {
    return <span className="nova-result__code">{status}</span>;
  }
  const paths: Record<string, React.ReactNode> = {
    success: (
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    error: (
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
    warning: (
      <path
        d="M12 3l9 16H3L12 3zM12 10v4M12 17.5v.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    info: (
      <path
        d="M12 11v6M12 7.5v.5M12 21a9 9 0 100-18 9 9 0 000 18z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[status]}
    </svg>
  );
}

/**
 * Result — a centered, full-section status screen (success / error / 404 /
 * 403 / 500 / info / warning) with an icon, title, subtitle, an actions slot,
 * and optional extra content. Announced via `role="status"`.
 */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  {
    status = "info",
    title,
    subtitle,
    icon,
    actions,
    extra,
    className,
    children,
    ...rest
  },
  ref
) {
  const tone = STATUS_TONE[status];
  const isError = status === "error" || status === "500";

  return (
    <div
      ref={ref}
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "nova-result",
        `nova-result--${tone}`,
        `nova-result--${status}`,
        className
      )}
      {...rest}
    >
      {icon !== null && (
        <div className="nova-result__icon" aria-hidden={icon == null}>
          {icon != null ? icon : <StatusIcon status={status} />}
        </div>
      )}
      {title != null && <h2 className="nova-result__title">{title}</h2>}
      {subtitle != null && (
        <p className="nova-result__subtitle">{subtitle}</p>
      )}
      {children != null && (
        <div className="nova-result__body">{children}</div>
      )}
      {actions != null && (
        <div className="nova-result__actions">{actions}</div>
      )}
      {extra != null && <div className="nova-result__extra">{extra}</div>}
    </div>
  );
});
