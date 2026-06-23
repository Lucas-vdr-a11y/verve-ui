import { forwardRef, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import type { ToggleVariant, ToggleSize } from "../Toggle/Toggle";
import "../Toggle/Toggle.css";
import "./ToggleGroup.css";

export interface ToggleGroupItem {
  /** The value committed when this item is selected. */
  value: string;
  /** Visible label. */
  label?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Disables this single item. */
  disabled?: boolean;
  /** Accessible label when the item is icon-only. */
  "aria-label"?: string;
}

interface ToggleGroupBaseProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The items in the group. */
  items: ToggleGroupItem[];
  /** Visual style of the buttons. Defaults to `"outline"`. */
  variant?: ToggleVariant;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: ToggleSize;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Stretch items to fill the container width equally. */
  fullWidth?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** Single selection mode (default). */
  type?: "single";
  /** Require a selection at all times (cannot toggle the active item off). */
  exclusive?: boolean;
  /** Controlled selected value (empty string = none). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the newly-selected value (empty when cleared). */
  onChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /** Multiple selection mode. */
  type: "multiple";
  /** Controlled selected values. */
  value?: string[];
  /** Uncontrolled initial values. */
  defaultValue?: string[];
  /** Called with the newly-selected values. */
  onChange?: (value: string[]) => void;
}

export type ToggleGroupProps =
  | ToggleGroupSingleProps
  | ToggleGroupMultipleProps;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      items,
      variant = "outline",
      size = "md",
      disabled = false,
      fullWidth = false,
      className,
    } = props;
    // Strip the non-DOM / union-specific props so only valid attrs reach the div.
    const rest = (() => {
      const {
        items: _items,
        variant: _variant,
        size: _size,
        disabled: _disabled,
        fullWidth: _fullWidth,
        className: _className,
        type: _type,
        value: _value,
        defaultValue: _defaultValue,
        onChange: _onChange,
        exclusive: _exclusive,
        ...domProps
      } = props as ToggleGroupBaseProps & {
        type?: string;
        value?: unknown;
        defaultValue?: unknown;
        onChange?: unknown;
        exclusive?: boolean;
      };
      return domProps as React.HTMLAttributes<HTMLDivElement>;
    })();
    const multiple = props.type === "multiple";

    const listRef = useRef<HTMLDivElement | null>(null);

    // ---- Selection state (controlled / uncontrolled) --------------------
    const isControlled = props.value !== undefined;
    const [internalSingle, setInternalSingle] = useState<string>(
      !multiple ? (props.defaultValue as string | undefined) ?? "" : ""
    );
    const [internalMulti, setInternalMulti] = useState<string[]>(
      multiple ? ((props.defaultValue as string[] | undefined) ?? []) : []
    );

    const selectedMulti: string[] = multiple
      ? isControlled
        ? ((props.value as string[]) ?? [])
        : internalMulti
      : [];
    const selectedSingle: string = !multiple
      ? isControlled
        ? ((props.value as string) ?? "")
        : internalSingle
      : "";

    const isSelected = (value: string) =>
      multiple ? selectedMulti.includes(value) : selectedSingle === value;

    const commit = (value: string) => {
      if (multiple) {
        const set = new Set(selectedMulti);
        if (set.has(value)) set.delete(value);
        else set.add(value);
        const next = items
          .map((i) => i.value)
          .filter((v) => set.has(v));
        if (!isControlled) setInternalMulti(next);
        (props.onChange as ((v: string[]) => void) | undefined)?.(next);
      } else {
        const exclusive = (props as ToggleGroupSingleProps).exclusive;
        const next = selectedSingle === value && !exclusive ? "" : value;
        if (next === selectedSingle && exclusive) return;
        if (!isControlled) setInternalSingle(next);
        (props.onChange as ((v: string) => void) | undefined)?.(next);
      }
    };

    // ---- Roving focus ---------------------------------------------------
    const enabled = items.filter((i) => !disabled && !i.disabled);
    // The roving tabindex anchor: first selected, else first enabled item.
    const anchorValue =
      enabled.find((i) => isSelected(i.value))?.value ?? enabled[0]?.value;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (enabled.length === 0) return;
      const currentValue = e.currentTarget.getAttribute("data-value") ?? "";
      const currentIdx = enabled.findIndex((i) => i.value === currentValue);
      let nextIdx = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIdx = (currentIdx + 1) % enabled.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIdx = (currentIdx - 1 + enabled.length) % enabled.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = enabled.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      const next = enabled[nextIdx];
      if (next) {
        listRef.current
          ?.querySelector<HTMLElement>(
            `[data-value="${cssEscape(next.value)}"]`
          )
          ?.focus();
      }
    };

    return (
      <div
        ref={mergeRefs(ref, listRef)}
        role="group"
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "nova-toggle-group",
          `nova-toggle-group--${size}`,
          fullWidth && "nova-toggle-group--full",
          disabled && "nova-toggle-group--disabled",
          className
        )}
        {...rest}
      >
        {items.map((item) => {
          const selected = isSelected(item.value);
          const itemDisabled = disabled || item.disabled;
          const isAnchor = item.value === anchorValue;
          return (
            <button
              key={item.value}
              type="button"
              data-value={item.value}
              aria-pressed={selected}
              aria-label={item["aria-label"]}
              aria-disabled={itemDisabled || undefined}
              disabled={itemDisabled}
              tabIndex={itemDisabled ? -1 : isAnchor ? 0 : -1}
              className={cn(
                "nova-toggle",
                "nova-toggle-group__item",
                "nova-focusable",
                `nova-toggle--${variant}`,
                `nova-toggle--${size}`,
                selected && "nova-toggle--on"
              )}
              onClick={() => !itemDisabled && commit(item.value)}
              onKeyDown={handleKeyDown}
            >
              {item.icon != null && (
                <span className="nova-toggle__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label != null && (
                <span className="nova-toggle__label">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === "function") r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    }
  };
}

// Minimal CSS.escape fallback for attribute selectors (SSR-safe).
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\\]\[]/g, "\\$&");
}
