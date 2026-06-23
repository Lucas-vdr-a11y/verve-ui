import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import {
  isSameDay,
  isSameMonth,
  monthGrid,
  MONTH_NAMES,
  orderedWeekdays,
  startOfDay,
  toDate,
  toDayKey,
  type EventTone,
  type WeekStart,
} from "../utils";
import "./YearView.css";

/** Marker contributing to a day's density dot. */
export interface YearViewEvent {
  /** Date the event belongs to (`Date` or `YYYY-MM-DD`). */
  date: Date | string;
  /** Tone of the density dot. Defaults to `"primary"`. */
  tone?: EventTone;
}

export interface YearViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Controlled year. */
  year?: number;
  /** Initial year (uncontrolled). Defaults to current year. */
  defaultYear?: number;
  /** Event markers — drive per-day density dots. */
  events?: YearViewEvent[];
  /** First day of week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: WeekStart;
  /** Mark this date as today (defaults to the real today). */
  today?: Date;
  /** Fired when a month title is clicked. */
  onMonthClick?: (month: Date) => void;
  /** Fired when a day cell is clicked. */
  onDayClick?: (date: Date) => void;
}

export const YearView = forwardRef<HTMLDivElement, YearViewProps>(
  function YearView(
    {
      year,
      defaultYear,
      events,
      weekStartsOn = 0,
      today,
      onMonthClick,
      onDayClick,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = year !== undefined;
    const [internalYear] = useState<number>(
      () => defaultYear ?? new Date().getFullYear()
    );
    const activeYear = isControlled ? year! : internalYear;

    const weekdays = useMemo(
      () => orderedWeekdays(weekStartsOn, true),
      [weekStartsOn]
    );

    // Map of dayKey → density count for that day.
    const densityByDay = useMemo(() => {
      const map = new Map<string, { count: number; tone: EventTone }>();
      for (const e of events ?? []) {
        const d = toDate(e.date);
        if (d.getFullYear() !== activeYear) continue;
        const key = toDayKey(d);
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else map.set(key, { count: 1, tone: e.tone ?? "primary" });
      }
      return map;
    }, [events, activeYear]);

    const todayDate = useMemo(() => startOfDay(today ?? new Date()), [today]);

    const months = useMemo(
      () => Array.from({ length: 12 }, (_, m) => new Date(activeYear, m, 1)),
      [activeYear]
    );

    const densityLevel = (count: number): 1 | 2 | 3 =>
      count >= 4 ? 3 : count >= 2 ? 2 : 1;

    return (
      <div
        ref={ref}
        className={cn("nova-year-view", className)}
        role="group"
        aria-label={`Year ${activeYear}`}
        {...rest}
      >
        <div className="nova-year-view__months">
          {months.map((month) => {
            const cells = monthGrid(month, weekStartsOn);
            return (
              <section
                key={month.getMonth()}
                className="nova-year-view__month"
                aria-label={`${MONTH_NAMES[month.getMonth()]} ${activeYear}`}
              >
                <button
                  type="button"
                  className="nova-year-view__month-title nova-focusable"
                  onClick={() => onMonthClick?.(month)}
                >
                  {MONTH_NAMES[month.getMonth()]}
                </button>

                <div className="nova-year-view__weekdays" aria-hidden="true">
                  {weekdays.map((w, i) => (
                    <span key={i} className="nova-year-view__weekday">
                      {w}
                    </span>
                  ))}
                </div>

                <div
                  className="nova-year-view__grid"
                  role="grid"
                  aria-label={MONTH_NAMES[month.getMonth()]}
                >
                  {cells.map((day) => {
                    const outside = !isSameMonth(day, month);
                    const isToday = isSameDay(day, todayDate);
                    const density = outside
                      ? undefined
                      : densityByDay.get(toDayKey(day));
                    return (
                      <button
                        key={day.getTime()}
                        type="button"
                        role="gridcell"
                        aria-current={isToday ? "date" : undefined}
                        aria-label={day.toDateString()}
                        className={cn(
                          "nova-year-view__day",
                          "nova-focusable",
                          outside && "nova-year-view__day--outside",
                          isToday && "nova-year-view__day--today",
                          density &&
                            `nova-year-view__day--density-${densityLevel(
                              density.count
                            )}`,
                          density && `nova-year-view__day--${density.tone}`
                        )}
                        onClick={() => onDayClick?.(startOfDay(day))}
                      >
                        {outside ? "" : day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }
);
