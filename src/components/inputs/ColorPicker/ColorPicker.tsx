import { forwardRef, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ColorPicker.css";

export type ColorPickerSize = "sm" | "md" | "lg";

export interface ColorSwatchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "value"
  > {
  /** The CSS color this swatch represents. */
  color: string;
  /** Whether this swatch is the selected one. */
  selected?: boolean;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ColorPickerSize;
  /** Accessible label. Falls back to the color value. */
  label?: string;
}

/** A single selectable color swatch button. */
export const ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>(
  function ColorSwatch(
    { color, selected = false, size = "md", label, className, style, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={label ?? color}
        title={label ?? color}
        className={cn(
          "nova-swatch",
          `nova-swatch--${size}`,
          selected && "nova-swatch--selected",
          "nova-focusable",
          className
        )}
        style={{ ["--nova-swatch-color" as string]: color, ...style }}
        {...rest}
      >
        <span className="nova-swatch__fill" aria-hidden="true" />
        <svg
          className="nova-swatch__check"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
);

export interface ColorPickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue" | "color"
  > {
  /** The palette of selectable colors. */
  colors: string[];
  /** Controlled selected color. */
  value?: string;
  /** Uncontrolled initial color. */
  defaultValue?: string;
  /** Called with the newly-selected color. */
  onChange?: (color: string) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ColorPickerSize;
  /** Disable interaction. */
  disabled?: boolean;
  /**
   * Show a native `<input type="color">` trigger for picking an arbitrary
   * custom color. Defaults to `false`.
   */
  allowCustom?: boolean;
  /** Accessible label for the palette group. */
  "aria-label"?: string;
  /** Map color value to an accessible swatch label. */
  getColorLabel?: (color: string) => string;
}

/** A palette of color swatches with optional custom-color trigger. */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      colors,
      value,
      defaultValue,
      onChange,
      size = "md",
      disabled = false,
      allowCustom = false,
      className,
      getColorLabel,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | undefined>(defaultValue);
    const selected = isControlled ? value : internal;

    const nativeRef = useRef<HTMLInputElement | null>(null);
    const reactId = useId();

    const commit = (color: string) => {
      if (disabled) return;
      if (!isControlled) setInternal(color);
      onChange?.(color);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (disabled || e.defaultPrevented) return;
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const idx = colors.findIndex((c) => c === selected);
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      const start = idx < 0 ? (dir === 1 ? -1 : 0) : idx;
      const next = (start + dir + colors.length) % colors.length;
      const color = colors[next];
      if (color) {
        commit(color);
        const root = e.currentTarget;
        root
          .querySelectorAll<HTMLElement>(".nova-swatch")
          [next]?.focus();
      }
    };

    const customIsActive =
      selected != null && !colors.includes(selected);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-colorpicker",
          `nova-colorpicker--${size}`,
          disabled && "nova-colorpicker--disabled",
          className
        )}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {colors.map((color) => {
          const isSelected = color === selected;
          return (
            <ColorSwatch
              key={color}
              color={color}
              size={size}
              selected={isSelected}
              disabled={disabled}
              tabIndex={isSelected || (!selected && color === colors[0]) ? 0 : -1}
              label={getColorLabel ? getColorLabel(color) : undefined}
              onClick={() => commit(color)}
            />
          );
        })}

        {allowCustom && (
          <span
            className={cn(
              "nova-colorpicker__custom",
              `nova-swatch--${size}`,
              customIsActive && "nova-colorpicker__custom--active",
              "nova-focusable"
            )}
            style={
              customIsActive
                ? ({
                    ["--nova-swatch-color" as string]: selected,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <input
              ref={nativeRef}
              id={`nova-colorpicker-custom-${reactId}`}
              type="color"
              className="nova-colorpicker__native"
              value={customIsActive ? selected : "#000000"}
              disabled={disabled}
              aria-label="Custom color"
              onChange={(e) => commit(e.target.value)}
            />
            {!customIsActive && (
              <svg
                className="nova-colorpicker__custom-icon"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        )}
      </div>
    );
  }
);
