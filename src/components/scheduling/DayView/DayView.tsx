import { forwardRef, useEffect, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import {
  clamp,
  formatHour,
  formatTime,
  isSameDay,
  layoutOverlaps,
  minutesSinceMidnight,
  startOfDay,
  type SchedulerEvent,
} from "../utils";
import "./DayView.css";

export interface DayViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The day to render. Drives the layout (stable). */
  date: Date;
  /** Events to position in the grid. */
  events?: SchedulerEvent[];
  /** First hour shown (0–23). Defaults to `0`. */
  startHour?: number;
  /** Last hour shown (1–24). Defaults to `24`. */
  endHour?: number;
  /** Pixel height of one hour row. Defaults to `52`. */
  slotHeight?: number;
  /** Granularity (minutes) for slot clicks. Defaults to `30`. */
  slotInterval?: number;
  /** 12-hour clock labels. Defaults to `true`. */
  hour12?: boolean;
  /** Show the live current-time indicator. Defaults to `true`. */
  showCurrentTime?: boolean;
  /** Fired when an empty slot is clicked. */
  onSlotClick?: (start: Date) => void;
  /** Fired when an event is clicked. */
  onEventClick?: (event: SchedulerEvent) => void;
}

const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DayView = forwardRef<HTMLDivElement, DayViewProps>(
  function DayView(
    {
      date,
      events = [],
      startHour = 0,
      endHour = 24,
      slotHeight = 52,
      slotInterval = 30,
      hour12 = true,
      showCurrentTime = true,
      onSlotClick,
      onEventClick,
      className,
      ...rest
    },
    ref
  ) {
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

    const dayStartMs = startOfDay(date).getTime();
    const dayEndMs = dayStartMs + 86400000;

    const { allDay, timed } = useMemo(() => {
      const a: SchedulerEvent[] = [];
      const t: SchedulerEvent[] = [];
      for (const ev of events) {
        if (ev.start.getTime() < dayEndMs && ev.end.getTime() > dayStartMs) {
          if (ev.allDay) a.push(ev);
          else t.push(ev);
        }
      }
      return { allDay: a, timed: t };
    }, [events, dayStartMs, dayEndMs]);

    const positioned = useMemo(
      () =>
        layoutOverlaps(
          timed,
          (ev) => ev.start.getTime(),
          (ev) => ev.end.getTime()
        ),
      [timed]
    );

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

    const isToday = now ? isSameDay(date, now) : false;
    const nowMinutes = now ? minutesSinceMidnight(now) : null;
    const nowInRange =
      nowMinutes != null && nowMinutes >= startMin && nowMinutes <= endMin;

    const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSlotClick) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = clamp(e.clientY - rect.top, 0, gridHeight);
      const absMinutes = startMin + offsetY / pxPerMin;
      const snapped = Math.floor(absMinutes / slotInterval) * slotInterval;
      const base = startOfDay(date);
      onSlotClick(
        new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, snapped)
      );
    };

    const heading = `${WEEKDAY_FULL[date.getDay()]}, ${
      MONTH_SHORT[date.getMonth()]
    } ${date.getDate()}`;

    return (
      <div
        ref={ref}
        className={cn("nova-day-view", className)}
        role="grid"
        aria-label={`Day view, ${heading}`}
        {...rest}
      >
        <div
          className={cn(
            "nova-day-view__head",
            isToday && "nova-day-view__head--today"
          )}
          role="row"
        >
          <span className="nova-day-view__dow">
            {WEEKDAY_FULL[date.getDay()]}
          </span>
          <span className="nova-day-view__date">
            {MONTH_SHORT[date.getMonth()]} {date.getDate()}
          </span>
        </div>

        {allDay.length > 0 && (
          <div className="nova-day-view__allday" role="row">
            <span className="nova-day-view__allday-label" aria-hidden="true">
              All day
            </span>
            <div className="nova-day-view__allday-list">
              {allDay.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className={cn(
                    "nova-day-view__allday-event",
                    `nova-day-view__event--${ev.tone ?? "primary"}`
                  )}
                  title={ev.title}
                  onClick={() => onEventClick?.(ev)}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="nova-day-view__body">
          <div
            className="nova-day-view__gutter"
            style={{ height: gridHeight }}
            aria-hidden="true"
          >
            {hours.map((h) => (
              <div
                key={h}
                className="nova-day-view__hour-label"
                style={{ height: slotHeight }}
              >
                <span>{formatHour(h, hour12)}</span>
              </div>
            ))}
          </div>

          <div
            className="nova-day-view__col"
            style={{ height: gridHeight }}
            role="gridcell"
            onClick={handleSlotClick}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="nova-day-view__gridline"
                style={{ height: slotHeight }}
              />
            ))}

            {showCurrentTime && isToday && nowInRange && (
              <div
                className="nova-day-view__now"
                style={{ top: (nowMinutes! - startMin) * pxPerMin }}
                aria-hidden="true"
              >
                <span className="nova-day-view__now-dot" />
              </div>
            )}

            {positioned.map(({ event, columnIndex, columnCount }) => {
              const rawStart =
                event.start.getTime() <= dayStartMs
                  ? startMin
                  : clamp(minutesSinceMidnight(event.start), startMin, endMin);
              const rawEnd =
                event.end.getTime() >= dayEndMs
                  ? endMin
                  : clamp(minutesSinceMidnight(event.end), startMin, endMin);
              const top = (rawStart - startMin) * pxPerMin;
              const height = Math.max((rawEnd - rawStart) * pxPerMin, 16);
              const widthPct = 100 / columnCount;
              return (
                <button
                  key={event.id}
                  type="button"
                  className={cn(
                    "nova-day-view__event",
                    `nova-day-view__event--${event.tone ?? "primary"}`
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
                  <span className="nova-day-view__event-time">
                    {formatTime(event.start, { hour12 })} –{" "}
                    {formatTime(event.end, { hour12 })}
                  </span>
                  <span className="nova-day-view__event-title">
                    {event.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
