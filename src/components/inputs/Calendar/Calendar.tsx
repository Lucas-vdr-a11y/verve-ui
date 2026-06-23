import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Calendar.css";

export type CalendarSize = "sm" | "md" | "lg";

export interface CalendarProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: CalendarSize;
  /** Controlled selected date. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Fired with the newly selected date. */
  onChange?: (date: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** First day of week: 0 = Sunday (default), 1 = Monday, … */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Returns true to disable an individual date. */
  disabledDate?: (date: Date) => boolean;
  /** Locale used for month/weekday labels. Defaults to the runtime locale. */
  locale?: string;
}

const MS_PER_DAY = 86400000;

/** Strip time → midnight local. */
const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const addMonths = (d: Date, n: number): Date => {
  const next = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return next;
};

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(
    {
      size = "md",
      value,
      defaultValue,
      onChange,
      min,
      max,
      weekStartsOn = 0,
      disabledDate,
      locale,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null
    );
    const selected = isControlled ? value ?? null : internalValue;

    // The month currently shown in the grid (view), independent of selection.
    const [viewDate, setViewDate] = useState<Date>(() =>
      startOfDay(selected ?? defaultValue ?? new Date())
    );

    // The date the keyboard "cursor" is on (for arrow navigation / focus).
    const [focusDate, setFocusDate] = useState<Date>(() =>
      startOfDay(selected ?? new Date())
    );

    const gridRef = useRef<HTMLDivElement | null>(null);

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
      // 2021-08-01 is a Sunday → reliable reference week.
      const base = new Date(2021, 7, 1);
      let fmt: Intl.DateTimeFormat | null = null;
      try {
        fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
      } catch {
        fmt = null;
      }
      const fallback = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      for (let i = 0; i < 7; i++) {
        const dayIndex = (weekStartsOn + i) % 7;
        if (fmt) {
          labels.push(fmt.format(addDays(base, dayIndex)));
        } else {
          labels.push(fallback[dayIndex]);
        }
      }
      return labels;
    }, [weekStartsOn, locale]);

    // Build the 6-week grid (always 42 cells for stable layout).
    const weeks = useMemo(() => {
      const firstOfMonth = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        1
      );
      const offset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
      const gridStart = addDays(firstOfMonth, -offset);
      const rows: Date[][] = [];
      for (let w = 0; w < 6; w++) {
        const row: Date[] = [];
        for (let d = 0; d < 7; d++) {
          row.push(addDays(gridStart, w * 7 + d));
        }
        rows.push(row);
      }
      return rows;
    }, [viewDate, weekStartsOn]);

    const today = useMemo(() => startOfDay(new Date()), []);

    const focusCell = useCallback((d: Date) => {
      const node = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-date="${d.getFullYear()}-${d.getMonth()}-${d.getDate()}"]`
      );
      node?.focus();
    }, []);

    const moveFocus = useCallback(
      (next: Date) => {
        setFocusDate(next);
        if (
          next.getMonth() !== viewDate.getMonth() ||
          next.getFullYear() !== viewDate.getFullYear()
        ) {
          setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
        }
        // Defer focus until after the grid re-renders.
        requestAnimationFrame(() => focusCell(next));
      },
      [viewDate, focusCell]
    );

    const select = useCallback(
      (d: Date) => {
        if (isDisabled(d)) return;
        const picked = startOfDay(d);
        if (!isControlled) setInternalValue(picked);
        setFocusDate(picked);
        onChange?.(picked);
      },
      [isDisabled, isControlled, onChange]
    );

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        let next: Date | null = null;
        switch (e.key) {
          case "ArrowLeft":
            next = addDays(focusDate, -1);
            break;
          case "ArrowRight":
            next = addDays(focusDate, 1);
            break;
          case "ArrowUp":
            next = addDays(focusDate, -7);
            break;
          case "ArrowDown":
            next = addDays(focusDate, 7);
            break;
          case "PageUp":
            next = addMonths(focusDate, e.shiftKey ? -12 : -1);
            break;
          case "PageDown":
            next = addMonths(focusDate, e.shiftKey ? 12 : 1);
            break;
          case "Home": {
            const offset = (focusDate.getDay() - weekStartsOn + 7) % 7;
            next = addDays(focusDate, -offset);
            break;
          }
          case "End": {
            const offset = (focusDate.getDay() - weekStartsOn + 7) % 7;
            next = addDays(focusDate, 6 - offset);
            break;
          }
          case "Enter":
          case " ":
            e.preventDefault();
            select(focusDate);
            return;
          default:
            return;
        }
        if (next) {
          e.preventDefault();
          moveFocus(next);
        }
      },
      [focusDate, weekStartsOn, select, moveFocus]
    );

    return (
      <div
        ref={ref}
        className={cn("nova-calendar", `nova-calendar--${size}`, className)}
        {...rest}
      >
        <div className="nova-calendar__header">
          <button
            type="button"
            className="nova-calendar__nav nova-focusable"
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
          <div className="nova-calendar__label" aria-live="polite">
            {monthLabel}
          </div>
          <button
            type="button"
            className="nova-calendar__nav nova-focusable"
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

        <div className="nova-calendar__weekdays" aria-hidden="true">
          {weekdayLabels.map((label, i) => (
            <span key={i} className="nova-calendar__weekday">
              {label}
            </span>
          ))}
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-label={monthLabel}
          className="nova-calendar__grid"
          onKeyDown={onKeyDown}
        >
          {weeks.map((week, wi) => (
            <div role="row" className="nova-calendar__week" key={wi}>
              {week.map((day) => {
                const outside = day.getMonth() !== viewDate.getMonth();
                const isSelected = isSameDay(day, selected);
                const isToday = isSameDay(day, today);
                const isFocusTarget = isSameDay(day, focusDate);
                const disabled = isDisabled(day);
                return (
                  <div
                    role="gridcell"
                    aria-selected={isSelected}
                    className="nova-calendar__cell"
                    key={day.getTime()}
                  >
                    <button
                      type="button"
                      data-date={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                      className={cn(
                        "nova-calendar__day",
                        "nova-focusable",
                        outside && "nova-calendar__day--outside",
                        isSelected && "nova-calendar__day--selected",
                        isToday && "nova-calendar__day--today",
                        disabled && "nova-calendar__day--disabled"
                      )}
                      tabIndex={isFocusTarget ? 0 : -1}
                      disabled={disabled}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={day.toDateString()}
                      onClick={() => select(day)}
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
    );
  }
);

export { isSameDay, startOfDay, addDays, MS_PER_DAY };
