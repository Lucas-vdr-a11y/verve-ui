import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import {
  formatTime,
  isSameDay,
  startOfDay,
  toDayKey,
  type SchedulerEvent,
} from "../utils";
import "./AgendaView.css";

export interface AgendaViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Events to list. Rendered chronologically, grouped by day. */
  events: SchedulerEvent[];
  /** Only show events on/after this date. Defaults to no lower bound. */
  from?: Date;
  /** Mark this date as "today" for the day-header relative label. */
  today?: Date;
  /** 12-hour clock labels. Defaults to `true`. */
  hour12?: boolean;
  /** Max days to show (after grouping). */
  maxDays?: number;
  /** Empty-state content. */
  emptyLabel?: React.ReactNode;
  /** Fired when an event row is activated. */
  onEventClick?: (event: SchedulerEvent) => void;
}

const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface DayGroup {
  key: string;
  date: Date;
  events: SchedulerEvent[];
}

export const AgendaView = forwardRef<HTMLDivElement, AgendaViewProps>(
  function AgendaView(
    {
      events,
      from,
      today,
      hour12 = true,
      maxDays,
      emptyLabel = "No upcoming events",
      onEventClick,
      className,
      ...rest
    },
    ref
  ) {
    const groups = useMemo<DayGroup[]>(() => {
      const lower = from ? startOfDay(from).getTime() : -Infinity;
      const map = new Map<string, DayGroup>();
      for (const ev of events) {
        const day = startOfDay(ev.start);
        if (day.getTime() < lower) continue;
        const key = toDayKey(day);
        let group = map.get(key);
        if (!group) {
          group = { key, date: day, events: [] };
          map.set(key, group);
        }
        group.events.push(ev);
      }
      const out = Array.from(map.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      for (const g of out) {
        g.events.sort((a, b) => a.start.getTime() - b.start.getTime());
      }
      return maxDays != null ? out.slice(0, maxDays) : out;
    }, [events, from, maxDays]);

    const todayDate = useMemo(() => startOfDay(today ?? new Date()), [today]);

    const headerLabel = (date: Date): { rel: string | null; main: string } => {
      const rel = isSameDay(date, todayDate)
        ? "Today"
        : isSameDay(date, new Date(todayDate.getTime() + 86400000))
        ? "Tomorrow"
        : null;
      return {
        rel,
        main: `${WEEKDAY_FULL[date.getDay()]}, ${
          MONTH_SHORT[date.getMonth()]
        } ${date.getDate()}`,
      };
    };

    return (
      <div
        ref={ref}
        className={cn("nova-agenda-view", className)}
        role="list"
        aria-label="Agenda"
        {...rest}
      >
        {groups.length === 0 ? (
          <div className="nova-agenda-view__empty" role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="3" y="4" width="18" height="17" rx="2"
                fill="none" stroke="currentColor" strokeWidth="1.5"
              />
              <path
                d="M3 9h18M8 2v4M16 2v4"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>{emptyLabel}</span>
          </div>
        ) : (
          groups.map((group) => {
            const { rel, main } = headerLabel(group.date);
            return (
              <section
                key={group.key}
                className="nova-agenda-view__group"
                role="listitem"
              >
                <header className="nova-agenda-view__day-header">
                  {rel && (
                    <span className="nova-agenda-view__day-rel">{rel}</span>
                  )}
                  <span className="nova-agenda-view__day-main">{main}</span>
                </header>
                <ul className="nova-agenda-view__events">
                  {group.events.map((ev) => {
                    const tone = ev.tone ?? "primary";
                    const interactive = !!onEventClick;
                    return (
                      <li
                        key={ev.id}
                        className={cn(
                          "nova-agenda-view__event",
                          `nova-agenda-view__event--${tone}`,
                          interactive && "nova-agenda-view__event--interactive"
                        )}
                        tabIndex={interactive ? 0 : undefined}
                        role={interactive ? "button" : undefined}
                        onClick={
                          interactive ? () => onEventClick(ev) : undefined
                        }
                        onKeyDown={
                          interactive
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onEventClick(ev);
                                }
                              }
                            : undefined
                        }
                      >
                        <span
                          className="nova-agenda-view__rail"
                          aria-hidden="true"
                        />
                        <div className="nova-agenda-view__time">
                          {ev.allDay ? (
                            <span className="nova-agenda-view__allday">
                              All day
                            </span>
                          ) : (
                            <>
                              <span className="nova-agenda-view__start">
                                {formatTime(ev.start, { hour12 })}
                              </span>
                              <span className="nova-agenda-view__end">
                                {formatTime(ev.end, { hour12 })}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="nova-agenda-view__details">
                          <span className="nova-agenda-view__title">
                            {ev.title}
                          </span>
                          {ev.location && (
                            <span className="nova-agenda-view__location">
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
                                  fill="none" stroke="currentColor"
                                  strokeWidth="1.6"
                                />
                                <circle
                                  cx="12" cy="10" r="2.5"
                                  fill="none" stroke="currentColor"
                                  strokeWidth="1.6"
                                />
                              </svg>
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>
    );
  }
);
