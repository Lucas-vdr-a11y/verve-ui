import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ImageCardSelect.css";

export type ImageCardSelectSize = "sm" | "md" | "lg";

export interface ImageCardOption {
  /** The value committed when this card is selected. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional secondary description. */
  description?: React.ReactNode;
  /** Image URL. Mutually usable with `node`. */
  image?: string;
  /** Custom illustration node (rendered instead of `image`). */
  node?: React.ReactNode;
  /** Disables this single card. */
  disabled?: boolean;
}

export interface ImageCardSelectProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The selectable cards. */
  options: ImageCardOption[];
  /** Allow multiple selection. Defaults to `false`. */
  multiple?: boolean;
  /** Controlled value. String for single, string[] for multiple. */
  value?: string | string[];
  /** Uncontrolled initial value. */
  defaultValue?: string | string[];
  /** Called with the new value (string for single, string[] for multiple). */
  onChange?: (value: string | string[]) => void;
  /** Number of columns. Defaults to `3`. */
  columns?: number;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ImageCardSelectSize;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

export const ImageCardSelect = forwardRef<HTMLDivElement, ImageCardSelectProps>(
  function ImageCardSelect(
    {
      options,
      multiple = false,
      value,
      defaultValue,
      onChange,
      columns = 3,
      size = "md",
      disabled = false,
      className,
      "aria-label": ariaLabel = "Choose an option",
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return multiple ? [] : "";
    });
    const raw = isControlled ? (value as string | string[]) : internal;

    const selectedSet = new Set(
      multiple
        ? Array.isArray(raw)
          ? raw
          : raw
          ? [raw]
          : []
        : raw
        ? [raw as string]
        : []
    );

    const reactId = useId();

    const commit = (next: string | string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const toggle = (val: string) => {
      if (disabled) return;
      if (multiple) {
        const arr = Array.isArray(raw) ? raw : raw ? [raw as string] : [];
        const next = arr.includes(val)
          ? arr.filter((v) => v !== val)
          : [...arr, val];
        commit(next);
      } else {
        commit(val);
      }
    };

    const enabled = options.filter((o) => !o.disabled);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (disabled || e.defaultPrevented || enabled.length === 0) return;
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (keys.includes(e.key)) {
        e.preventDefault();
        const focusedValue = (e.target as HTMLElement)?.getAttribute(
          "data-value"
        );
        const idx = enabled.findIndex((o) => o.value === focusedValue);
        const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
        const start = idx < 0 ? 0 : idx;
        const nextIdx = (start + dir + enabled.length) % enabled.length;
        const nextOpt = enabled[nextIdx];
        if (nextOpt) {
          if (!multiple) commit(nextOpt.value);
          e.currentTarget
            .querySelector<HTMLElement>(`[data-value="${cssEscape(nextOpt.value)}"]`)
            ?.focus();
        }
      } else if (e.key === " " || e.key === "Enter") {
        const focusedValue = (e.target as HTMLElement)?.getAttribute(
          "data-value"
        );
        if (focusedValue != null) {
          e.preventDefault();
          toggle(focusedValue);
        }
      }
    };

    const firstFocusable =
      options.find((o) => selectedSet.has(o.value) && !o.disabled)?.value ??
      enabled[0]?.value;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-imagecardselect",
          `nova-imagecardselect--${size}`,
          disabled && "nova-imagecardselect--disabled",
          className
        )}
        role={multiple ? "group" : "radiogroup"}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        style={{ ["--nova-ics-cols" as string]: String(columns) }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {options.map((opt, i) => {
          const isSelected = selectedSet.has(opt.value);
          const isDisabled = disabled || opt.disabled;
          const tabbable = multiple
            ? opt.value === firstFocusable
            : isSelected || (!selectedSet.size && opt.value === firstFocusable);
          return (
            <button
              key={opt.value}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              data-value={opt.value}
              data-index={i}
              tabIndex={isDisabled ? -1 : tabbable ? 0 : -1}
              id={`${reactId}-${i}`}
              className={cn(
                "nova-imagecardselect__card nova-focusable",
                isSelected && "nova-imagecardselect__card--selected"
              )}
              onClick={() => toggle(opt.value)}
            >
              <span className="nova-imagecardselect__media" aria-hidden="true">
                {opt.node != null ? (
                  opt.node
                ) : opt.image ? (
                  <img
                    className="nova-imagecardselect__img"
                    src={opt.image}
                    alt=""
                  />
                ) : null}
                <span className="nova-imagecardselect__check">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
              {(opt.label != null || opt.description != null) && (
                <span className="nova-imagecardselect__body">
                  {opt.label != null && (
                    <span className="nova-imagecardselect__label">
                      {opt.label}
                    </span>
                  )}
                  {opt.description != null && (
                    <span className="nova-imagecardselect__desc">
                      {opt.description}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

// Minimal CSS.escape fallback for attribute selectors (SSR-safe).
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\\]\[]/g, "\\$&");
}
