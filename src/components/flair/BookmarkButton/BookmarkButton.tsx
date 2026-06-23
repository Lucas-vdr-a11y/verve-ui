import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./BookmarkButton.css";

export interface BookmarkButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled saved state. Omit for uncontrolled. */
  saved?: boolean;
  /** Initial saved state when uncontrolled. Defaults `false`. */
  defaultSaved?: boolean;
  /** Called with the next saved state on toggle. */
  onChange?: (saved: boolean) => void;
}

/**
 * A bookmark/save toggle whose ribbon performs a fold/flip fill on save: the
 * outline folds in 3D and reveals a filled ribbon. Controlled via `saved` or
 * uncontrolled via `defaultSaved`.
 *
 * Real `<button>` with `aria-pressed`. The flip resolves instantly under
 * reduced motion (handled in CSS).
 */
export const BookmarkButton = forwardRef<
  HTMLButtonElement,
  BookmarkButtonProps
>(function BookmarkButton(
  {
    saved: savedProp,
    defaultSaved = false,
    onChange,
    className,
    onClick,
    type,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const isControlled = savedProp !== undefined;
  const [internalSaved, setInternalSaved] = useState(defaultSaved);
  const saved = isControlled ? savedProp : internalSaved;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const next = !saved;
      if (!isControlled) setInternalSaved(next);
      onChange?.(next);
    },
    [isControlled, onChange, onClick, saved]
  );

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn("nova-bookmark", saved && "nova-bookmark--on", className)}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={ariaLabel ?? (saved ? "Remove bookmark" : "Bookmark")}
      {...rest}
    >
      <span className="nova-bookmark__flip" aria-hidden="true">
        <svg
          className="nova-bookmark__face nova-bookmark__face--front"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="nova-bookmark__face nova-bookmark__face--back"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
});
