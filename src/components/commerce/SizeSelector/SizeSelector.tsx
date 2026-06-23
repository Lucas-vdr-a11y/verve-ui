import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./SizeSelector.css";

export type SizeSelectorSize = "sm" | "md" | "lg";

export interface SizeOption {
  /** Stable value committed via onChange. */
  value: string;
  /** Visible label. Falls back to `value`. */
  label?: string;
  /** Selectable but disabled (e.g. unavailable variant). */
  disabled?: boolean;
  /** Out of stock — disabled with a struck-through treatment. */
  outOfStock?: boolean;
}

export interface SizeSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Available size options. */
  options: SizeOption[];
  /** Controlled selected value. */
  value?: string;
  /** Called with the newly selected value. */
  onChange?: (value: string) => void;
  /** Accessible label for the group. @default "Size" */
  label?: string;
  /** Size variant of the control. @default "md" */
  size?: SizeSelectorSize;
  /** Disable the whole control. */
  disabled?: boolean;
}

/**
 * SizeSelector — a radiogroup of selectable size options (S/M/L/XL or numeric).
 * Supports per-option disabled / out-of-stock and full keyboard navigation.
 */
export const SizeSelector = forwardRef<HTMLDivElement, SizeSelectorProps>(
  function SizeSelector(
    { options, value, onChange, label = "Size", size = "md", disabled = false, className, ...rest },
    ref,
  ) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const enabledIndexes = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled && !o.outOfStock)
      .map(({ i }) => i);

    const select = (opt: SizeOption) => {
      if (disabled || opt.disabled || opt.outOfStock) return;
      if (opt.value !== value) onChange?.(opt.value);
    };

    const focusAt = (index: number) => {
      const btn = refs.current[index];
      btn?.focus();
    };

    const moveFocus = (fromIndex: number, dir: 1 | -1) => {
      if (enabledIndexes.length === 0) return;
      const pos = enabledIndexes.indexOf(fromIndex);
      const start = pos === -1 ? (dir === 1 ? -1 : 0) : pos;
      const nextPos = (start + dir + enabledIndexes.length) % enabledIndexes.length;
      const target = enabledIndexes[nextPos];
      focusAt(target);
      select(options[target]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          moveFocus(index, 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          moveFocus(index, -1);
          break;
        case "Home":
          e.preventDefault();
          if (enabledIndexes.length) {
            focusAt(enabledIndexes[0]);
            select(options[enabledIndexes[0]]);
          }
          break;
        case "End":
          e.preventDefault();
          if (enabledIndexes.length) {
            const last = enabledIndexes[enabledIndexes.length - 1];
            focusAt(last);
            select(options[last]);
          }
          break;
        default:
          break;
      }
    };

    const hasSelection = options.some((o) => o.value === value);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-size-selector",
          `nova-size-selector--${size}`,
          disabled && "nova-size-selector--disabled",
          className,
        )}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {options.map((opt, index) => {
          const checked = opt.value === value;
          const unavailable = opt.disabled || opt.outOfStock;
          // Roving tabindex: the selected option, or the first enabled when none selected.
          const isTabStop = checked || (!hasSelection && index === enabledIndexes[0]);
          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-disabled={unavailable || disabled || undefined}
              aria-label={
                opt.outOfStock
                  ? `${opt.label ?? opt.value}, out of stock`
                  : opt.label ?? opt.value
              }
              tabIndex={disabled ? -1 : isTabStop ? 0 : -1}
              className={cn(
                "nova-size-selector__option",
                checked && "nova-size-selector__option--selected",
                opt.outOfStock && "nova-size-selector__option--out-of-stock",
              )}
              disabled={disabled || unavailable}
              onClick={() => select(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {opt.label ?? opt.value}
            </button>
          );
        })}
      </div>
    );
  },
);
