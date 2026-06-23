import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import {
  addMonths,
  formatMonthYear,
  isSameDay,
  isSameMonth,
  monthGrid,
  orderedWeekdays,
  startOfDay,
  startOfMonth,
  toDate,
  toDayKey,
  type EventTone,
  type WeekStart,
} from "../utils";
import "./MiniCalendar.css";

/** A lightweight event marker for the dot row under a day. */
export interface MiniCalendarEvent {
  /** Date the event belongs to (`Date` or `YYYY-MM-DD`). */
  date: Date | string;
  /** Tone of the dot. Defaults to `"primary"`. */
  tone?: EventTone;
}

export interface MiniCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  /** Controlled selected date. */
  value?: Date | null;
  /** Initial selected date (uncontrolled). */
  defaultValue?: Date | null;
  /** Fired when a day is chosen. */
  onSelect?: (date: Date) => void;
  /** Controlled visible month. */
  month?: Date;
  /** Initial visible month (uncontrolled). Defaults to selected/today. */
  defaultMonth?: Date;
  /** Fired when the visible month changes. */
  onMonthChange?: (month: Date) => void;
  /** Event markers rendered as dots. */
  events?: MiniCalendarEvent[];
  /** First day of week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: WeekStart;
  /** Mark this date as today (defaults to the real today). */
  today?: Date;
  /** Max distinct dots per day. Defaults to `3`. */
  maxDots?: number;
  /** Returns true to disable a date. */
  disabledDate?: (date: Date) => boolean;
}

export const MiniCalendar = forwardRef<HTMLDivElement, MiniCalendarProps>(
  function MiniCalendar(
    {
      value,
      defaultValue,
      onSelect,
      month,
      defaultMonth,
      onMonthChange,
      events,
      weekStartsOn = 0,
      today,
      maxDots = 3,
      disabledDate,
      className,
      ...rest
    },
    ref
  ) {
    const isValueControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null
    );
    const selected = isValueControlled ? value ?? null : internalValue;

    const isMonthControlled = month !== undefined;
    const [internalMonth, setInternalMonth] = useState<Date>(() =>
      startOfMonth(defaultMonth ?? selected ?? new Date())
    );
    const view = isMonthControlled ? startOfMonth(month!) : internalMonth;

    const gotoMonth = (next: Date) => {
      const normalized = startOfMonth(next);
      if (!isMonthControlled) setInternalMonth(normalized);
      onMonthChange?.(normalized);
    };

    const weekdays = useMemo(
      () => orderedWeekdays(weekStartsOn, true),
      [weekStartsOn]
    );

    const cells = useMemo(
      () => monthGrid(view, weekStartsOn),
      [view, weekStartsOn]
    );

    const dotsByDay = useMemo(() => {
      const map = new Map<string, EventTone[]>();
      for (const e of events ?? []) {
        const key = toDayKey(toDate(e.date));
        const arr = map.get(key);
        const tone = e.tone ?? "primary";
        if (arr) arr.push(tone);
        else map.set(key, [tone]);
      }
      return map;
    }, [events]);

    const todayDate = useMemo(
      () => startOfDay(today ?? new Date()),
      [today]
    );

    const label = formatMonthYear(view);

    return (
      <div
        ref={ref}
        className={cn("nova-mini-calendar", className)}
        role="group"
        aria-label={`Mini calendar, ${label}`}
        {...rest}
      >
        <div className="nova-mini-calendar__header">
          <button
            type="button"
            className="nova-mini-calendar__nav nova-focusable"
            aria-label="Previous month"
            onClick={() => gotoMonth(addMonths(view, -1))}
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
          <span className="nova-mini-calendar__label" aria-live="polite">
            {label}
          </span>
          <button
            type="button"
            className="nova-mini-calendar__nav nova-focusable"
            aria-label="Next month"
            onClick={() => gotoMonth(addMonths(view, 1))}
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

        <div className="nova-mini-calendar__weekdays" aria-hidden="true">
          {weekdays.map((w, i) => (
            <span key={i} className="nova-mini-calendar__weekday">
              {w}
            </span>
          ))}
        </div>

        <div className="nova-mini-calendar__grid" role="grid" aria-label={label}>
          {cells.map((day) => {
            const outside = !isSameMonth(day, view);
            const isSelected = isSameDay(day, selected);
            const isToday = isSameDay(day, todayDate);
            const disabled = disabledDate ? disabledDate(day) : false;
            const dots = dotsByDay.get(toDayKey(day)) ?? [];
            const shownDots = dots.slice(0, maxDots);
            return (
              <button
                key={day.getTime()}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={day.toDateString()}
                disabled={disabled}
                className={cn(
                  "nova-mini-calendar__day",
                  "nova-focusable",
                  outside && "nova-mini-calendar__day--outside",
                  isToday && "nova-mini-calendar__day--today",
                  isSelected && "nova-mini-calendar__day--selected",
                  disabled && "nova-mini-calendar__day--disabled"
                )}
                onClick={() => {
                  if (disabled) return;
                  const picked = startOfDay(day);
                  if (!isValueControlled) setInternalValue(picked);
                  if (outside) gotoMonth(startOfMonth(day));
                  onSelect?.(picked);
                }}
              >
                <span className="nova-mini-calendar__date">{day.getDate()}</span>
                {shownDots.length > 0 && (
                  <span className="nova-mini-calendar__dots" aria-hidden="true">
                    {shownDots.map((tone, i) => (
                      <span
                        key={i}
                        className={cn(
                          "nova-mini-calendar__dot",
                          `nova-mini-calendar__dot--${tone}`
                        )}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);
