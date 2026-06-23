import { forwardRef, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ToggleChipGroup.css";

export type ToggleChipGroupSize = "sm" | "md" | "lg";

export interface ToggleChipOption {
  /** The value committed when this chip is toggled. */
  value: string;
  /** Visible label. Falls back to `value`. */
  label?: React.ReactNode;
  /** Optional count badge shown on the chip. */
  count?: number;
  /** Disables this single chip. */
  disabled?: boolean;
}

export interface ToggleChipGroupProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The selectable chips. */
  options: ToggleChipOption[];
  /** Allow multiple selection. Defaults to `true`. */
  multiple?: boolean;
  /** Controlled value (string for single, string[] for multiple). */
  value?: string | string[];
  /** Uncontrolled initial value. */
  defaultValue?: string | string[];
  /** Called with the new value (string for single, string[] for multiple). */
  onChange?: (value: string | string[]) => void;
  /**
   * Allow the user to add custom chips via an input. The new value is returned
   * here so the caller can persist it; the chip is also selected. Defaults off.
   */
  onAddCustom?: (value: string) => void;
  /** Placeholder for the add-custom input. Defaults to `"Add…"`. */
  addPlaceholder?: string;
  /** Show count badges on chips that define `count`. Defaults to `true`. */
  showCounts?: boolean;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ToggleChipGroupSize;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

export const ToggleChipGroup = forwardRef<HTMLDivElement, ToggleChipGroupProps>(
  function ToggleChipGroup(
    {
      options,
      multiple = true,
      value,
      defaultValue,
      onChange,
      onAddCustom,
      addPlaceholder = "Add…",
      showCounts = true,
      size = "md",
      disabled = false,
      className,
      "aria-label": ariaLabel = "Filters",
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

    const selectedArr = multiple
      ? Array.isArray(raw)
        ? raw
        : raw
        ? [raw]
        : []
      : raw
      ? [raw as string]
      : [];
    const selectedSet = new Set(selectedArr);

    const [draft, setDraft] = useState("");
    const reactId = useId();

    const commit = (next: string | string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const toggle = (val: string) => {
      if (disabled) return;
      if (multiple) {
        const next = selectedSet.has(val)
          ? selectedArr.filter((v) => v !== val)
          : [...selectedArr, val];
        commit(next);
      } else {
        commit(selectedSet.has(val) ? "" : val);
      }
    };

    const enabled = options.filter((o) => !o.disabled);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (disabled || e.defaultPrevented) return;
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(e.key)) return;
      const focusedValue = (e.target as HTMLElement)?.getAttribute("data-value");
      if (focusedValue == null) return;
      e.preventDefault();
      const idx = enabled.findIndex((o) => o.value === focusedValue);
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      const next = enabled[(idx + dir + enabled.length) % enabled.length];
      if (next) {
        e.currentTarget
          .querySelector<HTMLElement>(`[data-value="${cssEscape(next.value)}"]`)
          ?.focus();
      }
    };

    const inputRef = useRef<HTMLInputElement | null>(null);

    const addCustom = () => {
      const v = draft.trim();
      if (!v || disabled) return;
      onAddCustom?.(v);
      // Also select it immediately.
      if (multiple) {
        if (!selectedSet.has(v)) commit([...selectedArr, v]);
      } else {
        commit(v);
      }
      setDraft("");
      inputRef.current?.focus();
    };

    const selectedCount = selectedArr.length;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-togglechipgroup",
          `nova-togglechipgroup--${size}`,
          disabled && "nova-togglechipgroup--disabled",
          className
        )}
        role={multiple ? "group" : "radiogroup"}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-selected-count={selectedCount || undefined}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {options.map((opt, i) => {
          const isSelected = selectedSet.has(opt.value);
          const isDisabled = disabled || opt.disabled;
          const tabbable =
            i === 0 ||
            (selectedArr.length > 0 && opt.value === selectedArr[0]);
          return (
            <button
              key={opt.value}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              data-value={opt.value}
              id={`${reactId}-${i}`}
              tabIndex={isDisabled ? -1 : tabbable ? 0 : -1}
              className={cn(
                "nova-togglechipgroup__chip nova-focusable",
                isSelected && "nova-togglechipgroup__chip--selected"
              )}
              onClick={() => toggle(opt.value)}
            >
              {isSelected && (
                <svg
                  className="nova-togglechipgroup__check"
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
              )}
              <span className="nova-togglechipgroup__label">
                {opt.label ?? opt.value}
              </span>
              {showCounts && opt.count != null && (
                <span className="nova-togglechipgroup__count" aria-hidden="true">
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}

        {onAddCustom && (
          <span className="nova-togglechipgroup__add">
            <input
              ref={inputRef}
              type="text"
              className="nova-togglechipgroup__add-input"
              placeholder={addPlaceholder}
              value={draft}
              disabled={disabled}
              aria-label="Add a custom filter"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <button
              type="button"
              className="nova-togglechipgroup__add-btn nova-focusable"
              aria-label="Add filter"
              disabled={disabled || draft.trim().length === 0}
              onClick={addCustom}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        )}
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
