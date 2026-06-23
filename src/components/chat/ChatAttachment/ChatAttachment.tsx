import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ChatAttachment.css";

export interface ChatAttachmentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  /** File name displayed as the title. */
  name: string;
  /** Size in bytes; rendered human-readable. */
  size?: number;
  /** Image thumbnail URL. When set, an image preview is shown instead of a file icon. */
  thumbnailUrl?: string;
  /** MIME type — used to pick the file icon when no thumbnail is given. */
  mimeType?: string;
  /** Upload progress 0–100. When set (and < 100), an upload bar is shown. */
  progress?: number;
  /** Show a remove button (composer context). Fires `onRemove`. */
  onRemove?: () => void;
  /** Show a download button (message context). Fires `onDownload`. */
  onDownload?: () => void;
  /** Label for the remove button. */
  removeLabel?: string;
  /** Label for the download button. */
  downloadLabel?: string;
}

function formatSize(bytes?: number): string | null {
  if (bytes == null || !Number.isFinite(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true" focusable="false">
    <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const RemoveIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M8 2v8M5 7.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ChatAttachment = forwardRef<HTMLDivElement, ChatAttachmentProps>(
  function ChatAttachment(
    {
      name,
      size,
      thumbnailUrl,
      mimeType,
      progress,
      onRemove,
      onDownload,
      removeLabel = "Remove attachment",
      downloadLabel = "Download",
      className,
      ...rest
    },
    ref
  ) {
    const sizeLabel = formatSize(size);
    const uploading = progress != null && progress < 100;
    const clamped = progress == null ? 0 : Math.max(0, Math.min(100, progress));
    const isImage = thumbnailUrl != null || (mimeType?.startsWith("image/") ?? false);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-chat-attachment",
          uploading && "nova-chat-attachment--uploading",
          className
        )}
        {...rest}
      >
        <div
          className={cn(
            "nova-chat-attachment__media",
            isImage && "nova-chat-attachment__media--image"
          )}
          aria-hidden="true"
        >
          {thumbnailUrl != null ? (
            <img
              className="nova-chat-attachment__thumb"
              src={thumbnailUrl}
              alt=""
            />
          ) : (
            <FileIcon />
          )}
        </div>

        <div className="nova-chat-attachment__info">
          <span className="nova-chat-attachment__name" title={name}>
            {name}
          </span>
          <span className="nova-chat-attachment__meta">
            {uploading ? (
              <span className="nova-chat-attachment__progress-text">
                {clamped}%
              </span>
            ) : (
              sizeLabel && (
                <span className="nova-chat-attachment__size">{sizeLabel}</span>
              )
            )}
          </span>

          {uploading && (
            <div
              className="nova-chat-attachment__progress"
              role="progressbar"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${name}`}
            >
              <div
                className="nova-chat-attachment__progress-bar"
                style={{ width: `${clamped}%` }}
              />
            </div>
          )}
        </div>

        {onRemove && (
          <button
            type="button"
            className="nova-chat-attachment__action nova-focusable"
            aria-label={removeLabel}
            onClick={onRemove}
          >
            <RemoveIcon />
          </button>
        )}
        {!onRemove && onDownload && (
          <button
            type="button"
            className="nova-chat-attachment__action nova-focusable"
            aria-label={downloadLabel}
            onClick={onDownload}
          >
            <DownloadIcon />
          </button>
        )}
      </div>
    );
  }
);
