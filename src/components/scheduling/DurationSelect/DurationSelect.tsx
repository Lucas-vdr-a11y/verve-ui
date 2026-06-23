import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./DurationSelect.css";

/** Format a minute count as a compact human label, e.g. `1h 30m`. */
export const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** Default presets, in minutes. */
export const DEFAULT_DURATIONS = [15, 30, 45, 60, 90, 120];

export interface DurationSelectProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled selected duration, in minutes. */
  value?: number | null;
  /** Initial selected duration, in minutes (uncontrolled). */
  defaultValue?: number | null;
  /** Fired with the chosen duration in minutes. */
  onChange?: (minutes: number) => void;
  /** Preset durations in minutes. Defaults to {@link DEFAULT_DURATIONS}. */
  presets?: number[];
  /** Allow entering an arbitrary duration. Defaults to `true`. */
  allowCustom?: boolean;
  /** Min custom minutes. Defaults to `5`. */
  min?: number;
  /** Max custom minutes. Defaults to `1440` (24h). */
  max?: number;
  /** Step for the custom input. Defaults to `5`. */
  step?: number;
  /** Accessible label for the group. */
  "aria-label"?: string;
}

export const DurationSelect = forwardRef<HTMLDivElement, DurationSelectProps>(
  function DurationSelect(
    {
      value,
      defaultValue,
      onChange,
      presets = DEFAULT_DURATIONS,
      allowCustom = true,
      min = 5,
      max = 1440,
      step = 5,
      className,
      "aria-label": ariaLabel = "Duration",
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<number | null>(
      defaultValue ?? null
    );
    const current = isControlled ? value ?? null : internal;

    const [customOpen, setCustomOpen] = useState(
      () => current != null && !presets.includes(current)
    );
    const [customText, setCustomText] = useState(() =>
      current != null && !presets.includes(current) ? String(current) : ""
    );

    const commit = (minutes: number) => {
      const clamped = Math.min(max, Math.max(min, Math.round(minutes)));
      if (!isControlled) setInternal(clamped);
      onChange?.(clamped);
      return clamped;
    };

    const pickPreset = (minutes: number) => {
      setCustomOpen(false);
      if (!isControlled) setInternal(minutes);
      onChange?.(minutes);
    };

    const isCustomValue = current != null && !presets.includes(current);

    return (
      <div
        ref={ref}
        className={cn("nova-duration-select", className)}
        role="radiogroup"
        aria-label={ariaLabel}
        {...rest}
      >
        <div className="nova-duration-select__presets">
          {presets.map((p) => {
            const selected = !customOpen && current === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "nova-duration-select__option",
                  "nova-focusable",
                  selected && "nova-duration-select__option--selected"
                )}
                onClick={() => pickPreset(p)}
              >
                {formatDuration(p)}
              </button>
            );
          })}

          {allowCustom && (
            <button
              type="button"
              role="radio"
              aria-checked={customOpen && isCustomValue}
              className={cn(
                "nova-duration-select__option",
                "nova-duration-select__option--custom",
                "nova-focusable",
                customOpen && "nova-duration-select__option--selected"
              )}
              onClick={() => {
                setCustomOpen(true);
                if (isCustomValue) setCustomText(String(current));
              }}
            >
              Custom
            </button>
          )}
        </div>

        {allowCustom && customOpen && (
          <div className="nova-duration-select__custom">
            <input
              type="number"
              className="nova-duration-select__custom-input nova-focusable"
              inputMode="numeric"
              min={min}
              max={max}
              step={step}
              value={customText}
              aria-label="Custom duration in minutes"
              placeholder="Minutes"
              onChange={(e) => {
                setCustomText(e.target.value);
                const n = Number(e.target.value);
                if (e.target.value !== "" && Number.isFinite(n)) commit(n);
              }}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (e.target.value === "" || !Number.isFinite(n)) return;
                const clamped = commit(n);
                setCustomText(String(clamped));
              }}
            />
            <span className="nova-duration-select__custom-unit">minutes</span>
            {current != null && (
              <span className="nova-duration-select__custom-readout">
                {formatDuration(current)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
