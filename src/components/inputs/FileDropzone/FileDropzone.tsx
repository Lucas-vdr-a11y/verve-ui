import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./FileDropzone.css";

export type FileDropzoneSize = "sm" | "md" | "lg";

export interface FileRejection {
  file: File;
  /** Why the file was rejected. */
  reason: "type" | "size";
}

export interface FileDropzoneProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "onDrop"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: FileDropzoneSize;
  /** Fired with the accepted files whenever the selection changes. */
  onFiles?: (files: File[]) => void;
  /** Fired with files rejected by `accept` / `maxSize`. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Accepted file types (passed to the native input + validated). */
  accept?: string;
  /** Allow selecting multiple files. Defaults to `false`. */
  multiple?: boolean;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  /** Disables the dropzone. */
  disabled?: boolean;
  /** Marks the control as invalid. */
  invalid?: boolean;
  /** Primary prompt text. */
  label?: React.ReactNode;
  /** Secondary hint text under the label. */
  hint?: React.ReactNode;
  /** Render the selected-file list with remove buttons. Defaults to `true`. */
  showFileList?: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

/** Match a file against an `accept` string (extensions + mime, incl. wildcards). */
const matchesAccept = (file: File, accept?: string): boolean => {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
};

export const FileDropzone = forwardRef<HTMLDivElement, FileDropzoneProps>(
  function FileDropzone(
    {
      size = "md",
      onFiles,
      onReject,
      accept,
      multiple = false,
      maxSize,
      disabled = false,
      invalid = false,
      label = "Drag & drop files here",
      hint = "or click to browse",
      showFileList = true,
      className,
      ...rest
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const descId = useId();

    const validate = useCallback(
      (incoming: File[]): { accepted: File[]; rejected: FileRejection[] } => {
        const accepted: File[] = [];
        const rejected: FileRejection[] = [];
        for (const file of incoming) {
          if (!matchesAccept(file, accept)) {
            rejected.push({ file, reason: "type" });
          } else if (maxSize != null && file.size > maxSize) {
            rejected.push({ file, reason: "size" });
          } else {
            accepted.push(file);
          }
        }
        return { accepted, rejected };
      },
      [accept, maxSize]
    );

    const ingest = useCallback(
      (incoming: File[]) => {
        if (disabled || incoming.length === 0) return;
        const { accepted, rejected } = validate(incoming);
        if (rejected.length > 0) onReject?.(rejected);
        if (accepted.length === 0) return;
        const next = multiple
          ? [...files, ...accepted]
          : accepted.slice(0, 1);
        setFiles(next);
        onFiles?.(next);
      },
      [disabled, validate, onReject, multiple, files, onFiles]
    );

    const openPicker = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files ? Array.from(e.target.files) : [];
        ingest(list);
        // Reset so selecting the same file again re-fires change.
        e.target.value = "";
      },
      [ingest]
    );

    const removeAt = useCallback(
      (index: number) => {
        const next = files.filter((_, i) => i !== index);
        setFiles(next);
        onFiles?.(next);
      },
      [files, onFiles]
    );

    const onDragOver = useCallback(
      (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(true);
      },
      [disabled]
    );

    const onDragLeave = useCallback((e: React.DragEvent) => {
      // Only clear when leaving the zone itself, not entering a child.
      if (e.currentTarget === e.target) setDragOver(false);
    }, []);

    const onDrop = useCallback(
      (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(false);
        const list = e.dataTransfer?.files
          ? Array.from(e.dataTransfer.files)
          : [];
        ingest(list);
      },
      [disabled, ingest]
    );

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      },
      [disabled, openPicker]
    );

    return (
      <div
        ref={ref}
        className={cn("nova-file-dropzone", className)}
        {...rest}
      >
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-describedby={descId}
          aria-invalid={invalid || undefined}
          className={cn(
            "nova-file-dropzone__zone",
            `nova-file-dropzone__zone--${size}`,
            dragOver && "nova-file-dropzone__zone--dragover",
            invalid && "nova-file-dropzone__zone--invalid",
            disabled && "nova-file-dropzone__zone--disabled"
          )}
          onClick={openPicker}
          onKeyDown={onKeyDown}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <span className="nova-file-dropzone__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 16V5m0 0L8 9m4-4l4 4M5 17v1.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="nova-file-dropzone__label">{label}</span>
          {hint != null && (
            <span id={descId} className="nova-file-dropzone__hint">
              {hint}
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            className="nova-file-dropzone__input"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleInputChange}
          />
        </div>

        {showFileList && files.length > 0 && (
          <ul className="nova-file-dropzone__list">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${file.size}-${i}`}
                className="nova-file-dropzone__file"
              >
                <span className="nova-file-dropzone__file-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M6 3h8l5 5v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3v5h5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="nova-file-dropzone__file-name">
                  {file.name}
                </span>
                <span className="nova-file-dropzone__file-size">
                  {formatBytes(file.size)}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    className="nova-file-dropzone__remove nova-focusable"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeAt(i)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export { formatBytes };
