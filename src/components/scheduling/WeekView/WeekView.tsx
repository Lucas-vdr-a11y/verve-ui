import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import {
  clamp,
  formatHour,
  formatTime,
  isSameDay,
  layoutOverlaps,
  minutesSinceMidnight,
  startOfDay,
  weekDays,
  type SchedulerEvent,
  type WeekStart,
} from "../utils";
import "./WeekView.css";

export interface WeekViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Any date inside the week to render. Drives the layout (stable). */
  date: Date;
  /** Events to position in the grid. */
  events?: SchedulerEvent[];
  /** First hour shown in the grid (0–23). Defaults to `0`. */
  startHour?: number;
  /** Last hour shown (exclusive top boundary, 1–24). Defaults to `24`. */
  endHour?: number;
  /** Pixel height of one hour row. Defaults to `48`. */
  slotHeight?: number;
  /** Granularity (minutes) for slot clicks. Defaults to `60`. */
  slotInterval?: number;
  /** First day of week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: WeekStart;
  /** 12-hour clock labels. Defaults to `true`. */
  hour12?: boolean;
  /** Show the live current-time indicator line. Defaults to `true`. */
  showCurrentTime?: boolean;
  /** Fired when an empty slot is clicked, with the slot's start datetime. */
  onSlotClick?: (start: Date) => void;
  /** Fired when an event chip is clicked. */
  onEventClick?: (event: SchedulerEvent) => void;
}

const WEEKDAY_FMT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WeekView = forwardRef<HTMLDivElement, WeekViewProps>(
  function WeekView(
    {
      date,
      events = [],
      startHour = 0,
      endHour = 24,
      slotHeight = 48,
      slotInterval = 60,
      weekStartsOn = 0,
      hour12 = true,
      showCurrentTime = true,
      onSlotClick,
      onEventClick,
      className,
      ...rest
    },
    ref
  ) {
    const days = useMemo(
      () => weekDays(date, weekStartsOn),
      [date, weekStartsOn]
    );

    const startMin = startHour * 60;
    const endMin = endHour * 60;
    const totalMin = Math.max(1, endMin - startMin);
    const gridHeight = (totalMin / 60) * slotHeight;
    const pxPerMin = slotHeight / 60;

    const hours = useMemo(() => {
      const out: number[] = [];
      for (let h = startHour; h < endHour; h++) out.push(h);
      return out;
    }, [startHour, endHour]);

    // Split events into all-day vs timed, then bucket timed events per day.
    const { allDayByDay, timedByDay } = useMemo(() => {
      const allDay = new Map<number, SchedulerEvent[]>();
      const timed = new Map<number, SchedulerEvent[]>();
      for (let i = 0; i < days.length; i++) {
        allDay.set(i, []);
        timed.set(i, []);
      }
      for (const ev of events) {
        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          // Event belongs to this column if it overlaps the day.
          const dayStart = startOfDay(day).getTime();
          const dayEnd = dayStart + 86400000;
          if (ev.start.getTime() < dayEnd && ev.end.getTime() > dayStart) {
            if (ev.allDay) allDay.get(i)!.push(ev);
            else timed.get(i)!.push(ev);
          }
        }
      }
      return { allDayByDay: allDay, timedByDay: timed };
    }, [events, days]);

    const hasAllDay = useMemo(
      () => Array.from(allDayByDay.values()).some((a) => a.length > 0),
      [allDayByDay]
    );

    // Current-time indicator — SSR-safe: only computed inside an effect.
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
      if (!showCurrentTime) {
        setNow(null);
        return;
      }
      const tick = () => setNow(new Date());
      tick();
      const id = setInterval(tick, 60000);
      return () => clearInterval(id);
    }, [showCurrentTime]);

    const nowMinutes = now ? minutesSinceMidnight(now) : null;
    const nowInRange =
      nowMinutes != null && nowMinutes >= startMin && nowMinutes <= endMin;

    const handleSlotClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSlotClick) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = clamp(e.clientY - rect.top, 0, gridHeight);
      const minutesFromTop = offsetY / pxPerMin;
      const absMinutes = startMin + minutesFromTop;
      const snapped =
        Math.floor(absMinutes / slotInterval) * slotInterval;
      const base = startOfDay(day);
      onSlotClick(
        new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, snapped)
      );
    };

    return (
      <div
        ref={ref}
        className={cn("nova-week-view", className)}
        role="grid"
        aria-label="Week view"
        {...rest}
      >
        {/* Column headers */}
        <div className="nova-week-view__head" role="row">
          <div className="nova-week-view__gutter-head" aria-hidden="true" />
          {days.map((day) => (
            <div
              key={day.getTime()}
              className={cn(
                "nova-week-view__day-head",
                now && isSameDay(day, now) && "nova-week-view__day-head--today"
              )}
              role="columnheader"
            >
              <span className="nova-week-view__dow">
                {WEEKDAY_FMT[day.getDay()]}
              </span>
              <span className="nova-week-view__daynum">{day.getDate()}</span>
            </div>
          ))}
        </div>

        {/* All-day row */}
        {hasAllDay && (
          <div className="nova-week-view__allday" role="row">
            <div className="nova-week-view__allday-label" aria-hidden="true">
              All day
            </div>
            {days.map((day, i) => (
              <div key={day.getTime()} className="nova-week-view__allday-cell">
                {allDayByDay.get(i)!.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={cn(
                      "nova-week-view__allday-event",
                      `nova-week-view__event--${ev.tone ?? "primary"}`
                    )}
                    title={ev.title}
                    onClick={() => onEventClick?.(ev)}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable time grid */}
        <div className="nova-week-view__body">
          <div
            className="nova-week-view__gutter"
            style={{ height: gridHeight }}
            aria-hidden="true"
          >
            {hours.map((h) => (
              <div
                key={h}
                className="nova-week-view__hour-label"
                style={{ height: slotHeight }}
              >
                <span>{formatHour(h, hour12)}</span>
              </div>
            ))}
          </div>

          <div className="nova-week-view__cols">
            {days.map((day, dayIdx) => {
              const positioned = layoutOverlaps(
                timedByDay.get(dayIdx)!,
                (ev) => ev.start.getTime(),
                (ev) => ev.end.getTime()
              );
              const isToday = now ? isSameDay(day, now) : false;
              return (
                <div
                  key={day.getTime()}
                  className="nova-week-view__col"
                  style={{ height: gridHeight }}
                  role="gridcell"
                  onClick={(e) => handleSlotClick(day, e)}
                >
                  {/* Hour gridlines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="nova-week-view__gridline"
                      style={{ height: slotHeight }}
                    />
                  ))}

                  {/* Current-time line */}
                  {showCurrentTime && isToday && nowInRange && (
                    <div
                      className="nova-week-view__now"
                      style={{ top: (nowMinutes! - startMin) * pxPerMin }}
                      aria-hidden="true"
                    >
                      <span className="nova-week-view__now-dot" />
                    </div>
                  )}

                  {/* Events */}
                  {positioned.map(({ event, columnIndex, columnCount }) => {
                    const dayStartMs = startOfDay(day).getTime();
                    const dayEndMs = dayStartMs + 86400000;
                    // Clamp multi-day events to this column's day boundaries.
                    const rawStart =
                      event.start.getTime() <= dayStartMs
                        ? startMin
                        : clamp(
                            minutesSinceMidnight(event.start),
                            startMin,
                            endMin
                          );
                    const rawEnd =
                      event.end.getTime() >= dayEndMs
                        ? endMin
                        : clamp(
                            minutesSinceMidnight(event.end),
                            startMin,
                            endMin
                          );
                    const top = (rawStart - startMin) * pxPerMin;
                    const height = Math.max(
                      (rawEnd - rawStart) * pxPerMin,
                      14
                    );
                    const widthPct = 100 / columnCount;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={cn(
                          "nova-week-view__event",
                          `nova-week-view__event--${event.tone ?? "primary"}`
                        )}
                        style={{
                          top,
                          height,
                          left: `calc(${columnIndex * widthPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                        }}
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <span className="nova-week-view__event-time">
                          {formatTime(event.start, { hour12 })}
                        </span>
                        <span className="nova-week-view__event-title">
                          {event.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
