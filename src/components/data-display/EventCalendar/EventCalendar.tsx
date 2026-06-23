import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import type { ChartTone } from "../../charts/utils";
import { toneColor } from "../../charts/utils";
import "./EventCalendar.css";

export interface CalendarEvent {
  /** ISO date `YYYY-MM-DD` the event belongs to. */
  date: string;
  /** Event title. */
  title: string;
  /** Tone used for the chip / dot. Defaults to `"brand"`. */
  tone?: ChartTone;
  /** Optional arbitrary payload echoed back in `onEventClick`. */
  meta?: unknown;
}

export interface EventCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick" | "onSelect"> {
  /** Events to display. */
  events: CalendarEvent[];
  /** Initial month (uncontrolled). Defaults to today's month. */
  defaultMonth?: Date | string;
  /** Controlled month. */
  month?: Date | string;
  /** Fired when the visible month changes (prev/next/today). */
  onMonthChange?: (month: Date) => void;
  /** First day of week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** Max event chips before showing "+N more". Defaults to `3`. */
  maxPerDay?: number;
  /** Mark this date as "today" (defaults to real today). */
  today?: Date | string;
  /** Fired when a day cell is activated. */
  onDateClick?: (date: string) => void;
  /** Fired when an event chip is activated. */
  onEventClick?: (event: CalendarEvent) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDate = (d: Date | string): Date => {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00") : new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const toKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface Cell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
}

export const EventCalendar = forwardRef<HTMLDivElement, EventCalendarProps>(
  function EventCalendar(
    {
      events,
      defaultMonth,
      month,
      onMonthChange,
      weekStartsOn = 0,
      maxPerDay = 3,
      today,
      onDateClick,
      onEventClick,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = month != null;
    const [internal, setInternal] = useState<Date>(() => {
      const base = defaultMonth ? toDate(defaultMonth) : toDate(new Date());
      return new Date(base.getFullYear(), base.getMonth(), 1);
    });
    const current = isControlled
      ? (() => {
          const d = toDate(month!);
          return new Date(d.getFullYear(), d.getMonth(), 1);
        })()
      : internal;

    const goto = (next: Date) => {
      if (!isControlled) setInternal(next);
      onMonthChange?.(next);
    };

    const eventsByDay = useMemo(() => {
      const m = new Map<string, CalendarEvent[]>();
      for (const e of events) {
        const arr = m.get(e.date);
        if (arr) arr.push(e);
        else m.set(e.date, [e]);
      }
      return m;
    }, [events]);

    const weekdays = useMemo(
      () =>
        weekStartsOn === 1
          ? [...DOW_SUN.slice(1), DOW_SUN[0]]
          : DOW_SUN,
      [weekStartsOn]
    );

    const cells = useMemo<Cell[]>(() => {
      const year = current.getFullYear();
      const mon = current.getMonth();
      const first = new Date(year, mon, 1);
      const lead = (first.getDay() - weekStartsOn + 7) % 7;
      const gridStart = new Date(year, mon, 1 - lead);
      const todayKey = toKey(today ? toDate(today) : toDate(new Date()));

      const out: Cell[] = [];
      const cursor = new Date(gridStart);
      // 6 rows x 7 cols = 42 cells (stable grid)
      for (let i = 0; i < 42; i++) {
        const key = toKey(cursor);
        out.push({
          date: new Date(cursor),
          key,
          inMonth: cursor.getMonth() === mon,
          isToday: key === todayKey,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      return out;
    }, [current, weekStartsOn, today]);

    const headerLabel = `${MONTHS[current.getMonth()]} ${current.getFullYear()}`;

    return (
      <div
        ref={ref}
        className={cn("nova-event-calendar", className)}
        role="group"
        aria-label={`Event calendar, ${headerLabel}`}
        {...rest}
      >
        <div className="nova-event-calendar__header">
          <button
            type="button"
            className="nova-event-calendar__nav"
            aria-label="Previous month"
            onClick={() =>
              goto(new Date(current.getFullYear(), current.getMonth() - 1, 1))
            }
          >
            ‹
          </button>
          <h2 className="nova-event-calendar__title" aria-live="polite">
            {headerLabel}
          </h2>
          <button
            type="button"
            className="nova-event-calendar__nav"
            aria-label="Next month"
            onClick={() =>
              goto(new Date(current.getFullYear(), current.getMonth() + 1, 1))
            }
          >
            ›
          </button>
          <button
            type="button"
            className="nova-event-calendar__today-btn"
            onClick={() => {
              const t = today ? toDate(today) : toDate(new Date());
              goto(new Date(t.getFullYear(), t.getMonth(), 1));
            }}
          >
            Today
          </button>
        </div>

        <div
          className="nova-event-calendar__weekdays"
          role="row"
          aria-hidden="true"
        >
          {weekdays.map((w) => (
            <span key={w} className="nova-event-calendar__weekday">
              {w}
            </span>
          ))}
        </div>

        <div className="nova-event-calendar__grid" role="grid">
          {cells.map((cell) => {
            const dayEvents = eventsByDay.get(cell.key) ?? [];
            const visible = dayEvents.slice(0, maxPerDay);
            const overflow = dayEvents.length - visible.length;
            return (
              <div
                key={cell.key}
                className={cn(
                  "nova-event-calendar__day",
                  !cell.inMonth && "nova-event-calendar__day--outside",
                  cell.isToday && "nova-event-calendar__day--today"
                )}
                role="gridcell"
                tabIndex={onDateClick ? 0 : undefined}
                aria-label={`${cell.key}, ${dayEvents.length} event${
                  dayEvents.length === 1 ? "" : "s"
                }`}
                onClick={
                  onDateClick ? () => onDateClick(cell.key) : undefined
                }
                onKeyDown={
                  onDateClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onDateClick(cell.key);
                        }
                      }
                    : undefined
                }
              >
                <span className="nova-event-calendar__date">
                  {cell.date.getDate()}
                </span>
                <div className="nova-event-calendar__events">
                  {visible.map((ev, i) => (
                    <button
                      key={i}
                      type="button"
                      className="nova-event-calendar__chip"
                      style={{
                        ["--nova-event-tone" as string]: toneColor(
                          ev.tone,
                          "var(--nova-primary)"
                        ),
                      }}
                      title={ev.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(ev);
                      }}
                    >
                      <span className="nova-event-calendar__dot" aria-hidden="true" />
                      <span className="nova-event-calendar__chip-text">
                        {ev.title}
                      </span>
                    </button>
                  ))}
                  {overflow > 0 && (
                    <span className="nova-event-calendar__more">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
