import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FileCard.css";

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "archive"
  | "code"
  | "generic";

export interface FileCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** File name, e.g. "report.pdf". */
  filename: React.ReactNode;
  /** Human-readable size, e.g. "2.4 MB". */
  size?: React.ReactNode;
  /** File kind, drives the default icon. @default "generic" */
  kind?: FileKind;
  /** Custom icon slot, overrides the kind-derived icon. */
  icon?: React.ReactNode;
  /**
   * Upload/download progress as a percentage (0–100). When set, a progress
   * bar replaces the size line.
   */
  progress?: number;
  /** Download handler. Renders a built-in download action when provided. */
  onDownload?: React.MouseEventHandler<HTMLButtonElement>;
  /** Remove handler. Renders a built-in remove action when provided. */
  onRemove?: React.MouseEventHandler<HTMLButtonElement>;
}

const ICONS: Record<FileKind, React.ReactNode> = {
  image: (
    <path
      d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 12l4-4 3 3 4-5 3 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  video: (
    <path
      d="M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm12 3l4-2v10l-4-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  audio: (
    <path
      d="M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  document: (
    <path
      d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7 0v5h5M9 13h6M9 16h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  spreadsheet: (
    <path
      d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7 0v5h5M9 12h7M9 16h7M12 12v6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  archive: (
    <path
      d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm7 0v4m0 2v2m0 2v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  code: (
    <path
      d="M9 8l-4 4 4 4m6-8l4 4-4 4M13 5l-2 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  generic: (
    <path
      d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7 0v5h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RemoveIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * FileCard — file icon by type, filename, size, optional upload/download
 * progress bar and download/remove actions.
 */
export const FileCard = forwardRef<HTMLDivElement, FileCardProps>(
  function FileCard(
    {
      filename,
      size,
      kind = "generic",
      icon,
      progress,
      onDownload,
      onRemove,
      className,
      ...rest
    },
    ref,
  ) {
    const showProgress = typeof progress === "number";
    const pct = showProgress ? clamp(progress as number) : 0;

    return (
      <div
        ref={ref}
        className={cn("nova-file-card", className)}
        {...rest}
      >
        <span
          className={cn(
            "nova-file-card__icon",
            `nova-file-card__icon--${kind}`,
          )}
          aria-hidden="true"
        >
          {icon ?? (
            <svg viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
              {ICONS[kind]}
            </svg>
          )}
        </span>

        <div className="nova-file-card__body">
          <span className="nova-file-card__name" title={
            typeof filename === "string" ? filename : undefined
          }>
            {filename}
          </span>

          {showProgress ? (
            <div className="nova-file-card__progress">
              <div
                className="nova-file-card__progress-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="nova-file-card__progress-bar"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="nova-file-card__progress-label">{pct}%</span>
            </div>
          ) : (
            size && <span className="nova-file-card__size">{size}</span>
          )}
        </div>

        {(onDownload || onRemove) && (
          <div className="nova-file-card__actions">
            {onDownload && (
              <button
                type="button"
                className="nova-file-card__action"
                onClick={onDownload}
                aria-label="Download"
                title="Download"
              >
                <DownloadIcon />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="nova-file-card__action nova-file-card__action--danger"
                onClick={onRemove}
                aria-label="Remove"
                title="Remove"
              >
                <RemoveIcon />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
