import { forwardRef, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { getActiveDrag } from "../Draggable/dndBridge";
import "./DropZone.css";

export interface DropZoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  /** Called with a dragged content payload (from a `Draggable`) on release. */
  onDrop?: (data: unknown, e: React.DragEvent) => void;
  /** Called with dropped files when the OS provides them. */
  onDropFiles?: (files: File[], e: React.DragEvent) => void;
  /** Headline shown inside the zone. */
  label?: React.ReactNode;
  /** Secondary helper text under the label. */
  hint?: React.ReactNode;
  /** Visual size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Disable the zone. */
  disabled?: boolean;
}

function defaultIcon() {
  return (
    <svg
      className="nova-dropzone__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * DropZone — a generic, dashed-outline content/file drop target styled like an
 * upload affordance. Highlights on drag-over and accepts both `Draggable`
 * payloads and OS file drops. Distinct from file-specific inputs: this is a
 * neutral content surface. SSR-safe.
 */
export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZone(
    {
      onDrop,
      onDropFiles,
      label = "Drop here",
      hint,
      size = "md",
      disabled = false,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const [over, setOver] = useState(false);
    const depth = useRef(0);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-dropzone",
          `nova-dropzone--${size}`,
          over && "nova-dropzone--over",
          disabled && "nova-dropzone--disabled",
          className
        )}
        role="region"
        aria-label={typeof label === "string" ? label : "Drop zone"}
        aria-disabled={disabled || undefined}
        data-over={over || undefined}
        onDragEnter={(e) => {
          if (disabled) return;
          e.preventDefault();
          depth.current += 1;
          if (depth.current === 1) setOver(true);
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          if (disabled) return;
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setOver(false);
        }}
        onDrop={(e) => {
          depth.current = 0;
          setOver(false);
          if (disabled) return;
          e.preventDefault();
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            onDropFiles?.(Array.from(files), e);
          }
          const { payload } = getActiveDrag();
          if (payload !== undefined) onDrop?.(payload, e);
        }}
        {...rest}
      >
        {children ?? (
          <div className="nova-dropzone__body">
            {defaultIcon()}
            <span className="nova-dropzone__label">{label}</span>
            {hint && <span className="nova-dropzone__hint">{hint}</span>}
          </div>
        )}
      </div>
    );
  }
);
