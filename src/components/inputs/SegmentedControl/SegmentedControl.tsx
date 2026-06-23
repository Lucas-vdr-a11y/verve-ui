import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./SegmentedControl.css";

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlOption {
  /** The value committed to `onChange` when this segment is selected. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Disables this single segment. */
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The mutually-exclusive options. */
  options: SegmentedControlOption[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the newly-selected value. */
  onChange?: (value: string) => void;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SegmentedControlSize;
  /** Stretch segments to fill the container width equally. */
  fullWidth?: boolean;
  /** Disables the whole control. */
  disabled?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

// SSR-safe layout effect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    options,
    value,
    defaultValue,
    onChange,
    size = "md",
    fullWidth = false,
    disabled = false,
    className,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string | undefined>(
    defaultValue ?? options[0]?.value
  );
  const selected = isControlled ? value : internal;

  const listRef = useRef<HTMLDivElement | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      '[data-selected="true"]'
    );
    if (!active) {
      setPill(null);
      return;
    }
    setPill({ left: active.offsetLeft, width: active.offsetWidth });
  }, []);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, selected, size, fullWidth, options]);

  // Re-measure on container resize (font load, responsive changes).
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  const commit = (next: string) => {
    if (next === selected) return;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const enabled = options.filter((o) => !o.disabled);
    if (enabled.length === 0) return;
    const currentIdx = enabled.findIndex((o) => o.value === selected);
    let nextIdx = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (currentIdx + 1 + enabled.length) % enabled.length;
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
      commit(next.value);
      // Move focus to the newly-selected segment.
      const list = listRef.current;
      list
        ?.querySelector<HTMLElement>(`[data-value="${cssEscape(next.value)}"]`)
        ?.focus();
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "nova-segmented",
        `nova-segmented--${size}`,
        fullWidth && "nova-segmented--full",
        disabled && "nova-segmented--disabled",
        className
      )}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div className="nova-segmented__track" ref={listRef}>
        {pill && (
          <span
            className="nova-segmented__pill"
            aria-hidden="true"
            style={{
              transform: `translateX(${pill.left}px)`,
              width: `${pill.width}px`,
            }}
          />
        )}
        {options.map((opt) => {
          const isSelected = opt.value === selected;
          const isDisabled = disabled || opt.disabled;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              data-value={opt.value}
              data-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                "nova-segmented__segment nova-focusable",
                isSelected && "nova-segmented__segment--selected"
              )}
              onClick={() => !isDisabled && commit(opt.value)}
              onKeyDown={handleKeyDown}
            >
              {opt.icon != null && (
                <span className="nova-segmented__icon" aria-hidden="true">
                  {opt.icon}
                </span>
              )}
              <span className="nova-segmented__label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Minimal CSS.escape fallback for attribute selectors (SSR-safe).
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\\]\[]/g, "\\$&");
}
