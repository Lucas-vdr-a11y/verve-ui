import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./EmojiRating.css";

export type EmojiRatingSize = "sm" | "md" | "lg";

export interface EmojiRatingItem {
  /** The emoji glyph shown for this level. */
  emoji: string;
  /** Accessible label, e.g. "Terrible". */
  label: string;
}

export interface EmojiRatingProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value (1-based index of the selected face). `0` = none. */
  value?: number;
  /** Uncontrolled initial value. Defaults to `0`. */
  defaultValue?: number;
  /** Called with the new 1-based rating. */
  onChange?: (value: number) => void;
  /**
   * The expressive faces, worst → best. Defaults to a 5-face 😡→😍 scale.
   */
  items?: EmojiRatingItem[];
  /** Show the label of the active face beneath the row. Defaults to `true`. */
  showLabel?: boolean;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: EmojiRatingSize;
  /** Render read-only (no interaction). */
  readOnly?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

const DEFAULT_ITEMS: EmojiRatingItem[] = [
  { emoji: "😡", label: "Terrible" },
  { emoji: "🙁", label: "Bad" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😍", label: "Excellent" },
];

export const EmojiRating = forwardRef<HTMLDivElement, EmojiRatingProps>(
  function EmojiRating(
    {
      value,
      defaultValue = 0,
      onChange,
      items = DEFAULT_ITEMS,
      showLabel = true,
      size = "md",
      readOnly = false,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Rating",
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue);
    const current = isControlled ? (value as number) : internal;
    const [hover, setHover] = useState<number | null>(null);
    const reactId = useId();
    const name = `nova-emojirating-${reactId}`;

    const interactive = !readOnly && !disabled;
    const display = hover != null ? hover : current;

    const commit = (next: number) => {
      if (!interactive) return;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!interactive || e.defaultPrevented) return;
      let next = current;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        next = Math.min(items.length, current + 1 || 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        next = Math.max(1, current - 1);
      } else if (e.key === "Home") {
        next = 1;
      } else if (e.key === "End") {
        next = items.length;
      } else {
        return;
      }
      e.preventDefault();
      commit(next);
    };

    const activeItem = display > 0 ? items[display - 1] : null;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-emojirating",
          `nova-emojirating--${size}`,
          readOnly && "nova-emojirating--readonly",
          disabled && "nova-emojirating--disabled",
          className
        )}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => interactive && setHover(null)}
        {...rest}
      >
        <div className="nova-emojirating__row">
          {items.map((item, i) => {
            const idx = i + 1;
            const isSelected = current === idx;
            const isActive = display === idx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                name={name}
                aria-checked={isSelected}
                aria-label={item.label}
                title={item.label}
                disabled={disabled}
                tabIndex={isSelected || (current === 0 && idx === 1) ? 0 : -1}
                className={cn(
                  "nova-emojirating__face nova-focusable",
                  isActive && "nova-emojirating__face--active",
                  display > 0 && idx <= display && "nova-emojirating__face--lit"
                )}
                onMouseEnter={() => interactive && setHover(idx)}
                onFocus={() => interactive && setHover(idx)}
                onClick={() => commit(idx)}
              >
                <span className="nova-emojirating__emoji" aria-hidden="true">
                  {item.emoji}
                </span>
              </button>
            );
          })}
        </div>
        {showLabel && (
          <span className="nova-emojirating__label" aria-hidden="true">
            {activeItem ? activeItem.label : " "}
          </span>
        )}
      </div>
    );
  }
);
