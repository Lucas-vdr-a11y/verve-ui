import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./AvatarUploader.css";

export type AvatarUploaderSize = "sm" | "md" | "lg";

export interface AvatarUploaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled preview image URL (e.g. an existing avatar). */
  value?: string;
  /** Called with the selected File when the user picks an image. */
  onFile?: (file: File) => void;
  /** Called when the avatar is removed. */
  onRemove?: () => void;
  /** Accepted file types. Defaults to `"image/*"`. */
  accept?: string;
  /** Size preset. Defaults to `"md"`. */
  size?: AvatarUploaderSize;
  /** Accessible label. Defaults to `"Upload avatar"`. */
  label?: string;
  /** Placeholder content shown when empty (e.g. initials or an icon). */
  placeholder?: ReactNode;
  /** Disable interaction. */
  disabled?: boolean;
}

const canUseDOM = (): boolean => typeof window !== "undefined";

export const AvatarUploader = forwardRef<HTMLDivElement, AvatarUploaderProps>(
  function AvatarUploader(
    {
      value,
      onFile,
      onRemove,
      accept = "image/*",
      size = "md",
      label = "Upload avatar",
      placeholder,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [internalPreview, setInternalPreview] = useState<string | undefined>(
      undefined
    );
    const [dragOver, setDragOver] = useState(false);

    const isControlled = value !== undefined;
    const preview = isControlled ? value : internalPreview;

    // Revoke any object URL we created on cleanup / replacement.
    const objectUrlRef = useRef<string | null>(null);
    useEffect(() => {
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }, []);

    const readFile = useCallback(
      (file: File) => {
        if (!file.type.startsWith("image/")) return;
        onFile?.(file);
        if (!isControlled && canUseDOM()) {
          // Prefer FileReader (guarded), fall back to object URL.
          if (typeof FileReader !== "undefined") {
            const reader = new FileReader();
            reader.onload = () => {
              setInternalPreview(
                typeof reader.result === "string" ? reader.result : undefined
              );
            };
            reader.readAsDataURL(file);
          } else if (typeof URL !== "undefined" && URL.createObjectURL) {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            const url = URL.createObjectURL(file);
            objectUrlRef.current = url;
            setInternalPreview(url);
          }
        }
      },
      [onFile, isControlled]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) readFile(file);
        // Allow re-selecting the same file.
        e.target.value = "";
      },
      [readFile]
    );

    const openPicker = useCallback(() => {
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
      },
      [disabled, readFile]
    );

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        if (!isControlled) setInternalPreview(undefined);
        onRemove?.();
      },
      [isControlled, onRemove]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "nova-avatar-uploader",
          `nova-avatar-uploader--${size}`,
          dragOver && "nova-avatar-uploader--dragover",
          disabled && "nova-avatar-uploader--disabled",
          className
        )}
        {...rest}
      >
        <button
          type="button"
          className={cn("nova-avatar-uploader__button", "nova-focusable")}
          aria-label={label}
          disabled={disabled}
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <img
              className="nova-avatar-uploader__img"
              src={preview}
              alt=""
            />
          ) : (
            <span className="nova-avatar-uploader__placeholder" aria-hidden="true">
              {placeholder ?? (
                <svg viewBox="0 0 24 24" width="40%" height="40%" fill="currentColor">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.69-8 6v1h16v-1c0-3.31-3.58-6-8-6Z" />
                </svg>
              )}
            </span>
          )}
          <span className="nova-avatar-uploader__overlay">
            <span className="nova-avatar-uploader__overlay-text">
              {preview ? "Change" : "Upload"}
            </span>
          </span>
        </button>

        {preview && !disabled && (
          <button
            type="button"
            className={cn("nova-avatar-uploader__remove", "nova-focusable")}
            aria-label="Remove avatar"
            onClick={handleRemove}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="nova-avatar-uploader__input"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleInputChange}
        />
      </div>
    );
  }
);
