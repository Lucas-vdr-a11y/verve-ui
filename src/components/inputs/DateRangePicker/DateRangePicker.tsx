import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import {
  addDays,
  isSameDay,
  startOfDay,
  type CalendarProps,
} from "../Calendar";
import "./DateRangePicker.css";

export type DateRangePickerSize = "sm" | "md" | "lg";

/** A start/end date range. Either side may be `null` while selecting. */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: DateRangePickerSize;
  /** Controlled range value. */
  value?: DateRange;
  /** Initial range for uncontrolled usage. */
  defaultValue?: DateRange;
  /** Fired with the new range. Fires after each endpoint pick. */
  onChange?: (range: DateRange) => void;
  /** Placeholder shown when no range is selected. */
  placeholder?: string;
  /** Formats a single date into field text. */
  formatDate?: (date: Date) => string;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** First day of week. */
  weekStartsOn?: CalendarProps["weekStartsOn"];
  /** Disable individual dates. */
  disabledDate?: CalendarProps["disabledDate"];
  /** Locale for formatting + labels. */
  locale?: string;
  /** Show a clear button when a range is selected. Defaults to `true`. */
  clearable?: boolean;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Disables the control. */
  disabled?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const addMonths = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

const defaultFormat = (date: Date, locale?: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
};

export const DateRangePicker = forwardRef<
  HTMLDivElement,
  DateRangePickerProps
>(function DateRangePicker(
  {
    size = "md",
    value,
    defaultValue,
    onChange,
    placeholder = "Select date range",
    formatDate,
    min,
    max,
    weekStartsOn = 0,
    disabledDate,
    locale,
    clearable = true,
    invalid = false,
    disabled = false,
    className,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DateRange>(
    defaultValue ?? { start: null, end: null }
  );
  const range = isControlled ? (value as DateRange) : internal;

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfDay(range.start ?? new Date())
  );

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const commit = useCallback(
    (next: DateRange) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const minDay = useMemo(() => (min ? startOfDay(min) : undefined), [min]);
  const maxDay = useMemo(() => (max ? startOfDay(max) : undefined), [max]);

  const isDisabled = useCallback(
    (d: Date): boolean => {
      if (minDay && d.getTime() < minDay.getTime()) return true;
      if (maxDay && d.getTime() > maxDay.getTime()) return true;
      return disabledDate ? disabledDate(d) : false;
    },
    [minDay, maxDay, disabledDate]
  );

  const handleSelect = useCallback(
    (day: Date) => {
      if (isDisabled(day)) return;
      const picked = startOfDay(day);
      const { start, end } = range;
      // No start yet, or a complete range exists → begin a fresh range.
      if (!start || (start && end)) {
        commit({ start: picked, end: null });
        return;
      }
      // Have a start, picking the end. Order them.
      if (picked.getTime() < start.getTime()) {
        commit({ start: picked, end: start });
      } else {
        commit({ start, end: picked });
      }
    },
    [isDisabled, range, commit]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      commit({ start: null, end: null });
    },
    [commit]
  );

  // The provisional end while hovering between picks.
  const provisionalEnd = useMemo(() => {
    if (range.start && !range.end && hovered) return hovered;
    return range.end;
  }, [range, hovered]);

  const inRange = useCallback(
    (d: Date): boolean => {
      const a = range.start;
      const b = provisionalEnd;
      if (!a || !b) return false;
      const lo = Math.min(a.getTime(), b.getTime());
      const hi = Math.max(a.getTime(), b.getTime());
      const t = d.getTime();
      return t > lo && t < hi;
    },
    [range.start, provisionalEnd]
  );

  // Click-outside / Escape close.
  useEffect(() => {
    if (!open || !canUseDOM()) return;
    const onPointerDown = (e: MouseEvent) => {
      const node = wrapperRef.current;
      if (node && !node.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const monthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(viewDate);
    } catch {
      return `${viewDate.getMonth() + 1} ${viewDate.getFullYear()}`;
    }
  }, [viewDate, locale]);

  const weekdayLabels = useMemo(() => {
    const labels: string[] = [];
    const base = new Date(2021, 7, 1); // a Sunday
    let fmt: Intl.DateTimeFormat | null = null;
    try {
      fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    } catch {
      fmt = null;
    }
    const fallback = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (weekStartsOn + i) % 7;
      labels.push(fmt ? fmt.format(addDays(base, dayIndex)) : fallback[dayIndex]);
    }
    return labels;
  }, [weekStartsOn, locale]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const offset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
    const gridStart = addDays(firstOfMonth, -offset);
    const rows: Date[][] = [];
    for (let w = 0; w < 6; w++) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d++) row.push(addDays(gridStart, w * 7 + d));
      rows.push(row);
    }
    return rows;
  }, [viewDate, weekStartsOn]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const display = useMemo(() => {
    const fmt = (d: Date) =>
      formatDate ? formatDate(d) : defaultFormat(d, locale);
    if (range.start && range.end)
      return `${fmt(range.start)} – ${fmt(range.end)}`;
    if (range.start) return `${fmt(range.start)} – …`;
    return "";
  }, [range, formatDate, locale]);

  return (
    <div ref={setRefs} className={cn("nova-daterangepicker", className)} {...rest}>
      <div
        className={cn(
          "nova-daterangepicker__control",
          `nova-daterangepicker__control--${size}`,
          invalid && "nova-daterangepicker__control--invalid",
          disabled && "nova-daterangepicker__control--disabled"
        )}
        data-disabled={disabled || undefined}
      >
        <span className="nova-daterangepicker__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <button
          ref={triggerRef}
          type="button"
          className="nova-daterangepicker__field nova-focusable"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={invalid || undefined}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          {display ? (
            <span className="nova-daterangepicker__value">{display}</span>
          ) : (
            <span className="nova-daterangepicker__placeholder">
              {placeholder}
            </span>
          )}
        </button>
        {clearable && (range.start || range.end) && !disabled && (
          <button
            type="button"
            className="nova-daterangepicker__clear nova-focusable"
            aria-label="Clear range"
            onClick={handleClear}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose date range"
          className="nova-daterangepicker__panel"
        >
          <div
            className={cn(
              "nova-daterangepicker__calendar",
              `nova-daterangepicker__calendar--${size}`
            )}
          >
            <div className="nova-daterangepicker__header">
              <button
                type="button"
                className="nova-daterangepicker__nav nova-focusable"
                aria-label="Previous month"
                onClick={() => setViewDate((v) => addMonths(v, -1))}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M15 18l-6-6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="nova-daterangepicker__label" aria-live="polite">
                {monthLabel}
              </div>
              <button
                type="button"
                className="nova-daterangepicker__nav nova-focusable"
                aria-label="Next month"
                onClick={() => setViewDate((v) => addMonths(v, 1))}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="nova-daterangepicker__weekdays" aria-hidden="true">
              {weekdayLabels.map((label, i) => (
                <span key={i} className="nova-daterangepicker__weekday">
                  {label}
                </span>
              ))}
            </div>

            <div
              role="grid"
              aria-label={monthLabel}
              className="nova-daterangepicker__grid"
              onMouseLeave={() => setHovered(null)}
            >
              {weeks.map((week, wi) => (
                <div role="row" className="nova-daterangepicker__week" key={wi}>
                  {week.map((day) => {
                    const outside = day.getMonth() !== viewDate.getMonth();
                    const isStart = isSameDay(day, range.start);
                    const isEnd = isSameDay(day, provisionalEnd);
                    const isToday = isSameDay(day, today);
                    const between = inRange(day);
                    const dayDisabled = isDisabled(day);
                    const isEndpoint = isStart || isEnd;
                    return (
                      <div
                        role="gridcell"
                        aria-selected={isEndpoint}
                        className={cn(
                          "nova-daterangepicker__cell",
                          between && "nova-daterangepicker__cell--in-range",
                          isStart && "nova-daterangepicker__cell--start",
                          isEnd && "nova-daterangepicker__cell--end"
                        )}
                        key={day.getTime()}
                      >
                        <button
                          type="button"
                          className={cn(
                            "nova-daterangepicker__day",
                            "nova-focusable",
                            outside && "nova-daterangepicker__day--outside",
                            isEndpoint && "nova-daterangepicker__day--selected",
                            isToday && "nova-daterangepicker__day--today",
                            dayDisabled && "nova-daterangepicker__day--disabled"
                          )}
                          disabled={dayDisabled}
                          aria-disabled={dayDisabled || undefined}
                          aria-current={isToday ? "date" : undefined}
                          aria-label={day.toDateString()}
                          onClick={() => handleSelect(day)}
                          onMouseEnter={() => setHovered(day)}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
