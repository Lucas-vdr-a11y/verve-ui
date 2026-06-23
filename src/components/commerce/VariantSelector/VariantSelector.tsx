import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./VariantSelector.css";

export type VariantSelectorSize = "sm" | "md" | "lg";

export interface VariantOption {
  /** Stable value committed via onChange. */
  value: string;
  /** Visible label. Falls back to `value`. */
  label?: string;
  /** Selectable but disabled. */
  disabled?: boolean;
  /** Out of stock — disabled with a struck-through treatment. */
  outOfStock?: boolean;
}

export interface VariantSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Attribute label, e.g. "Material", "Style". */
  label: string;
  /** Available pill options. */
  options: VariantOption[];
  /** Controlled selected value. */
  value?: string;
  /** Called with the newly selected value. */
  onChange?: (value: string) => void;
  /** Show the resolved label of the selection beside the heading. @default true */
  showSelectionLabel?: boolean;
  /** Pill size. @default "md" */
  size?: VariantSelectorSize;
  /** Disable the whole control. */
  disabled?: boolean;
}

/**
 * VariantSelector — a generic labeled, single-select group of pill options for
 * an arbitrary product attribute (material, style, finish…). Compose several to
 * cover a product's variants. Renders as a radiogroup with keyboard support.
 */
export const VariantSelector = forwardRef<HTMLDivElement, VariantSelectorProps>(
  function VariantSelector(
    {
      label,
      options,
      value,
      onChange,
      showSelectionLabel = true,
      size = "md",
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const enabledIndexes = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled && !o.outOfStock)
      .map(({ i }) => i);

    const select = (opt: VariantOption) => {
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

    const selected = options.find((o) => o.value === value);
    const hasSelection = selected !== undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-variant-selector",
          `nova-variant-selector--${size}`,
          disabled && "nova-variant-selector--disabled",
          className,
        )}
        {...rest}
      >
        <div className="nova-variant-selector__header">
          <span className="nova-variant-selector__label">{label}</span>
          {showSelectionLabel && selected && (
            <span className="nova-variant-selector__selection">
              {selected.label ?? selected.value}
            </span>
          )}
        </div>
        <div
          className="nova-variant-selector__options"
          role="radiogroup"
          aria-label={label}
          aria-disabled={disabled || undefined}
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
                aria-label={
                  opt.outOfStock ? `${opt.label ?? opt.value}, out of stock` : undefined
                }
                tabIndex={disabled ? -1 : isTabStop ? 0 : -1}
                className={cn(
                  "nova-variant-selector__pill",
                  checked && "nova-variant-selector__pill--selected",
                  opt.outOfStock && "nova-variant-selector__pill--out-of-stock",
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
      </div>
    );
  },
);
