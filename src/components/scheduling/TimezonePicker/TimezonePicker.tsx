import { forwardRef, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./TimezonePicker.css";

/** One selectable IANA timezone. */
export interface TimezoneOption {
  /** IANA zone id, e.g. `"America/New_York"`. */
  id: string;
  /** Human label, e.g. `"New York"`. */
  label: string;
  /** Region group, e.g. `"Americas"`. */
  region: string;
  /** Fixed UTC offset in minutes (standard time; DST not modeled). */
  offsetMinutes: number;
}

/**
 * A small, dependency-free list of ~25 common IANA zones with their standard
 * (non-DST) UTC offsets. Offsets are fixed numbers so the component is
 * deterministic and SSR-safe (no `Intl`/`Date` reliance at render).
 */
export const COMMON_TIMEZONES: TimezoneOption[] = [
  { id: "Pacific/Honolulu", label: "Honolulu", region: "Americas", offsetMinutes: -600 },
  { id: "America/Anchorage", label: "Anchorage", region: "Americas", offsetMinutes: -540 },
  { id: "America/Los_Angeles", label: "Los Angeles", region: "Americas", offsetMinutes: -480 },
  { id: "America/Denver", label: "Denver", region: "Americas", offsetMinutes: -420 },
  { id: "America/Chicago", label: "Chicago", region: "Americas", offsetMinutes: -360 },
  { id: "America/New_York", label: "New York", region: "Americas", offsetMinutes: -300 },
  { id: "America/Sao_Paulo", label: "São Paulo", region: "Americas", offsetMinutes: -180 },
  { id: "Atlantic/Reykjavik", label: "Reykjavik", region: "Europe & Africa", offsetMinutes: 0 },
  { id: "Europe/London", label: "London", region: "Europe & Africa", offsetMinutes: 0 },
  { id: "Europe/Paris", label: "Paris", region: "Europe & Africa", offsetMinutes: 60 },
  { id: "Europe/Berlin", label: "Berlin", region: "Europe & Africa", offsetMinutes: 60 },
  { id: "Europe/Madrid", label: "Madrid", region: "Europe & Africa", offsetMinutes: 60 },
  { id: "Africa/Lagos", label: "Lagos", region: "Europe & Africa", offsetMinutes: 60 },
  { id: "Europe/Athens", label: "Athens", region: "Europe & Africa", offsetMinutes: 120 },
  { id: "Africa/Johannesburg", label: "Johannesburg", region: "Europe & Africa", offsetMinutes: 120 },
  { id: "Europe/Moscow", label: "Moscow", region: "Europe & Africa", offsetMinutes: 180 },
  { id: "Asia/Dubai", label: "Dubai", region: "Asia & Pacific", offsetMinutes: 240 },
  { id: "Asia/Karachi", label: "Karachi", region: "Asia & Pacific", offsetMinutes: 300 },
  { id: "Asia/Kolkata", label: "Kolkata", region: "Asia & Pacific", offsetMinutes: 330 },
  { id: "Asia/Bangkok", label: "Bangkok", region: "Asia & Pacific", offsetMinutes: 420 },
  { id: "Asia/Shanghai", label: "Shanghai", region: "Asia & Pacific", offsetMinutes: 480 },
  { id: "Asia/Singapore", label: "Singapore", region: "Asia & Pacific", offsetMinutes: 480 },
  { id: "Asia/Tokyo", label: "Tokyo", region: "Asia & Pacific", offsetMinutes: 540 },
  { id: "Australia/Sydney", label: "Sydney", region: "Asia & Pacific", offsetMinutes: 600 },
  { id: "Pacific/Auckland", label: "Auckland", region: "Asia & Pacific", offsetMinutes: 720 },
];

/** Format a minute offset as `UTC±HH:MM`. */
export const formatOffset = (offsetMinutes: number): string => {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
};

export interface TimezonePickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled selected zone id. */
  value?: string | null;
  /** Initial selected zone id (uncontrolled). */
  defaultValue?: string | null;
  /** Fired with the chosen option. */
  onChange?: (option: TimezoneOption) => void;
  /** Override the zone list. Defaults to {@link COMMON_TIMEZONES}. */
  options?: TimezoneOption[];
  /** Search box placeholder. */
  placeholder?: string;
  /** Accessible label for the control. */
  "aria-label"?: string;
}

const groupByRegion = (options: TimezoneOption[]) => {
  const map = new Map<string, TimezoneOption[]>();
  for (const o of options) {
    const arr = map.get(o.region);
    if (arr) arr.push(o);
    else map.set(o.region, [o]);
  }
  return Array.from(map.entries());
};

export const TimezonePicker = forwardRef<HTMLDivElement, TimezonePickerProps>(
  function TimezonePicker(
    {
      value,
      defaultValue,
      onChange,
      options = COMMON_TIMEZONES,
      placeholder = "Search timezones…",
      className,
      "aria-label": ariaLabel = "Timezone",
      ...rest
    },
    ref
  ) {
    const listId = useId();
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | null>(
      defaultValue ?? null
    );
    const selectedId = isControlled ? value ?? null : internal;
    const [query, setQuery] = useState("");
    const [activeId, setActiveId] = useState<string | null>(selectedId);
    const listRef = useRef<HTMLDivElement>(null);

    const byId = useMemo(() => {
      const m = new Map<string, TimezoneOption>();
      for (const o of options) m.set(o.id, o);
      return m;
    }, [options]);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q) ||
          formatOffset(o.offsetMinutes).toLowerCase().includes(q)
      );
    }, [options, query]);

    const grouped = useMemo(() => groupByRegion(filtered), [filtered]);
    const flat = filtered;

    const selected = selectedId ? byId.get(selectedId) ?? null : null;

    const select = (option: TimezoneOption) => {
      if (!isControlled) setInternal(option.id);
      setActiveId(option.id);
      onChange?.(option);
    };

    const moveActive = (delta: number) => {
      if (flat.length === 0) return;
      const idx = flat.findIndex((o) => o.id === activeId);
      const next = idx === -1 ? 0 : (idx + delta + flat.length) % flat.length;
      setActiveId(flat[next].id);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveActive(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveActive(-1);
          break;
        case "Enter": {
          const opt = flat.find((o) => o.id === activeId);
          if (opt) {
            e.preventDefault();
            select(opt);
          }
          break;
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn("nova-timezone-picker", className)}
        {...rest}
      >
        <div
          className="nova-timezone-picker__combobox"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
        >
          <input
            type="text"
            className="nova-timezone-picker__search nova-focusable"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-controls={listId}
            aria-autocomplete="list"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {selected && (
            <span
              className="nova-timezone-picker__current"
              aria-label={`Current offset ${formatOffset(selected.offsetMinutes)}`}
            >
              {formatOffset(selected.offsetMinutes)}
            </span>
          )}
        </div>

        <div
          ref={listRef}
          id={listId}
          className="nova-timezone-picker__list"
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={activeId ? `${listId}-${activeId}` : undefined}
        >
          {flat.length === 0 ? (
            <div className="nova-timezone-picker__empty" role="status">
              No timezones found
            </div>
          ) : (
            grouped.map(([region, zones]) => (
              <div key={region} className="nova-timezone-picker__group">
                <div
                  className="nova-timezone-picker__group-label"
                  role="presentation"
                >
                  {region}
                </div>
                {zones.map((o) => {
                  const isSelected = o.id === selectedId;
                  const isActive = o.id === activeId;
                  return (
                    <div
                      key={o.id}
                      id={`${listId}-${o.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "nova-timezone-picker__option",
                        isActive && "nova-timezone-picker__option--active",
                        isSelected && "nova-timezone-picker__option--selected"
                      )}
                      onMouseEnter={() => setActiveId(o.id)}
                      onClick={() => select(o)}
                    >
                      <span className="nova-timezone-picker__option-label">
                        {o.label}
                      </span>
                      <span className="nova-timezone-picker__option-offset">
                        {formatOffset(o.offsetMinutes)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);
