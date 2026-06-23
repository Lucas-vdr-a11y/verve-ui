import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./ColorVariantSelector.css";

export type ColorVariantSelectorSize = "sm" | "md" | "lg";

export interface ColorOption {
  /** Stable value committed via onChange. */
  value: string;
  /** Human-readable color name for the accessible label, e.g. "Midnight Blue". */
  name: string;
  /** CSS color used to fill the swatch (hex, rgb, etc.). This is product data. */
  color: string;
  /** Selectable but disabled. */
  disabled?: boolean;
  /** Out of stock — disabled with a diagonal strike. */
  outOfStock?: boolean;
}

export interface ColorVariantSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "color"> {
  /** Available color options. */
  options: ColorOption[];
  /** Controlled selected value. */
  value?: string;
  /** Called with the newly selected value. */
  onChange?: (value: string) => void;
  /** Accessible label for the group. @default "Color" */
  label?: string;
  /** Swatch size. @default "md" */
  size?: ColorVariantSelectorSize;
  /** Disable the whole control. */
  disabled?: boolean;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ColorVariantSelector — a radiogroup of color swatches. The selected swatch
 * gets a ring; out-of-stock swatches show a diagonal strike. Swatch fill comes
 * from arbitrary product data via inline style (not theming).
 */
export const ColorVariantSelector = forwardRef<HTMLDivElement, ColorVariantSelectorProps>(
  function ColorVariantSelector(
    { options, value, onChange, label = "Color", size = "md", disabled = false, className, ...rest },
    ref,
  ) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const enabledIndexes = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled && !o.outOfStock)
      .map(({ i }) => i);

    const select = (opt: ColorOption) => {
      if (disabled || opt.disabled || opt.outOfStock) return;
      if (opt.value !== value) onChange?.(opt.value);
    };

    const focusAndSelect = (index: number) => {
      refs.current[index]?.focus();
      select(options[index]);
    };

    const moveFocus = (fromIndex: number, dir: 1 | -1) => {
      if (enabledIndexes.length === 0) return;
      const pos = enabledIndexes.indexOf(fromIndex);
      const start = pos === -1 ? (dir === 1 ? -1 : 0) : pos;
      const nextPos = (start + dir + enabledIndexes.length) % enabledIndexes.length;
      focusAndSelect(enabledIndexes[nextPos]);
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
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[0]);
          break;
        case "End":
          e.preventDefault();
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[enabledIndexes.length - 1]);
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
          "nova-color-variant-selector",
          `nova-color-variant-selector--${size}`,
          disabled && "nova-color-variant-selector--disabled",
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
              aria-label={opt.outOfStock ? `${opt.name}, out of stock` : opt.name}
              title={opt.name}
              tabIndex={disabled ? -1 : isTabStop ? 0 : -1}
              className={cn(
                "nova-color-variant-selector__swatch",
                checked && "nova-color-variant-selector__swatch--selected",
                opt.outOfStock && "nova-color-variant-selector__swatch--out-of-stock",
              )}
              disabled={disabled || unavailable}
              onClick={() => select(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span
                className="nova-color-variant-selector__fill"
                style={{ backgroundColor: opt.color }}
                aria-hidden="true"
              />
              {checked && (
                <span className="nova-color-variant-selector__check" aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);
