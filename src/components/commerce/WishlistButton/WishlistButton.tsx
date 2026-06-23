import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./WishlistButton.css";

export type WishlistButtonSize = "sm" | "md" | "lg";

export interface WishlistButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  /** Controlled active (wishlisted) state. */
  active?: boolean;
  /** Initial active state for uncontrolled usage. @default false */
  defaultActive?: boolean;
  /** Called with the next active state on toggle. */
  onChange?: (active: boolean) => void;
  /** Optional count to display beside the heart. */
  count?: number;
  /** Show the count. @default count !== undefined */
  showCount?: boolean;
  /** Size variant. @default "md" */
  size?: WishlistButtonSize;
  /** Accessible label. @default "Add to wishlist" / "Remove from wishlist" */
  label?: string;
}

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.92 4.02 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 17.98 3 20 4.92 20 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * WishlistButton — a heart toggle with an animated fill. Works controlled
 * (`active` + `onChange`) or uncontrolled (`defaultActive`). Optionally shows a
 * saved count. Exposes `aria-pressed` for state.
 */
export const WishlistButton = forwardRef<HTMLButtonElement, WishlistButtonProps>(
  function WishlistButton(
    {
      active,
      defaultActive = false,
      onChange,
      count,
      showCount,
      size = "md",
      label,
      className,
      onClick,
      disabled,
      ...rest
    },
    ref,
  ) {
    const isControlled = active !== undefined;
    const [internal, setInternal] = useState(defaultActive);
    const current = isControlled ? active : internal;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || disabled) return;
        const next = !current;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [current, disabled, isControlled, onChange, onClick],
    );

    const resolvedLabel =
      label ?? (current ? "Remove from wishlist" : "Add to wishlist");
    const displayCount = (showCount ?? count !== undefined) && count !== undefined;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "nova-wishlist-button",
          `nova-wishlist-button--${size}`,
          current && "nova-wishlist-button--active",
          className,
        )}
        aria-pressed={current}
        aria-label={resolvedLabel}
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        <span className="nova-wishlist-button__icon" aria-hidden="true">
          <HeartIcon />
        </span>
        {displayCount && (
          <span className="nova-wishlist-button__count">{count}</span>
        )}
      </button>
    );
  },
);
