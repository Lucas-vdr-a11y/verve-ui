import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DragHandle.css";

export interface DragHandleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size of the grip affordance. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

/**
 * DragHandle — a styled grip affordance used to initiate a drag. Renders a
 * `<button>` so it is keyboard-focusable and announces itself; consumers wire
 * pointer/keyboard handlers (Sortable does this automatically via `useHandle`).
 */
export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  function DragHandle(
    { size = "md", className, "aria-label": ariaLabel, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel ?? "Drag to reorder"}
        className={cn(
          "nova-drag-handle",
          `nova-drag-handle--${size}`,
          "nova-focusable",
          className
        )}
        {...rest}
      >
        <svg
          className="nova-drag-handle__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>
    );
  }
);
