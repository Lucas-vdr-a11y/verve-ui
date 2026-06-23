import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Tag.css";

export type TagTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type TagVariant = "solid" | "soft" | "outline";
export type TagSize = "sm" | "md" | "lg";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. Defaults to `"neutral"`. */
  tone?: TagTone;
  /** Visual style. Defaults to `"soft"`. */
  variant?: TagVariant;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TagSize;
  /** Optional leading slot (icon, dot, avatar). */
  leading?: React.ReactNode;
  /** When provided, renders a remove (×) button that calls this handler. */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the remove button. Defaults to `"Remove"`. */
  removeLabel?: string;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    tone = "neutral",
    variant = "soft",
    size = "md",
    leading,
    onRemove,
    removeLabel = "Remove",
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "nova-tag",
        `nova-tag--${tone}`,
        `nova-tag--${variant}`,
        `nova-tag--${size}`,
        onRemove && "nova-tag--removable",
        className
      )}
      {...rest}
    >
      {leading && <span className="nova-tag__leading">{leading}</span>}
      <span className="nova-tag__label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="nova-tag__remove"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <svg
            className="nova-tag__remove-icon"
            viewBox="0 0 16 16"
            width="1em"
            height="1em"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
});
