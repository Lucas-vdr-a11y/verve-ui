import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import { WeekView } from "../WeekView";
import { DayView } from "../DayView";
import { AgendaView } from "../AgendaView";
import {
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  monthGrid,
  MONTH_NAMES,
  orderedWeekdays,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDayKey,
  weekDays,
  type EventTone,
  type SchedulerEvent,
  type WeekStart,
} from "../utils";
import "./Scheduler.css";

export type SchedulerViewMode = "month" | "week" | "day" | "agenda";

export interface SchedulerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Events shared across all sub-views. */
  events?: SchedulerEvent[];
  /** Controlled active date. */
  date?: Date;
  /** Initial active date (uncontrolled). Defaults to today. */
  defaultDate?: Date;
  /** Fired when the active date changes (nav / today / cell click). */
  onDateChange?: (date: Date) => void;
  /** Controlled active view. */
  view?: SchedulerViewMode;
  /** Initial active view (uncontrolled). Defaults to `"week"`. */
  defaultView?: SchedulerViewMode;
  /** Fired when the active view changes. */
  onViewChange?: (view: SchedulerViewMode) => void;
  /** Which views to offer in the switcher. Defaults to all four. */
  views?: SchedulerViewMode[];
  /** First day of week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: WeekStart;
  /** 12-hour clock labels. Defaults to `true`. */
  hour12?: boolean;
  /** Time-grid start hour (week/day). Defaults to `7`. */
  startHour?: number;
  /** Time-grid end hour (week/day). Defaults to `21`. */
  endHour?: number;
  /** Fired when an event is clicked in any sub-view. */
  onEventClick?: (event: SchedulerEvent) => void;
  /** Fired when an empty time slot is clicked (week/day). */
  onSlotClick?: (start: Date) => void;
}

const VIEW_LABEL: Record<SchedulerViewMode, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "Agenda",
};

const DEFAULT_VIEWS: SchedulerViewMode[] = ["month", "week", "day", "agenda"];
const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const Scheduler = forwardRef<HTMLDivElement, SchedulerProps>(
  function Scheduler(
    {
      events = [],
      date,
      defaultDate,
      onDateChange,
      view,
      defaultView = "week",
      onViewChange,
      views = DEFAULT_VIEWS,
      weekStartsOn = 0,
      hour12 = true,
      startHour = 7,
      endHour = 21,
      onEventClick,
      onSlotClick,
      className,
      ...rest
    },
    ref
  ) {
    const isDateControlled = date !== undefined;
    const [internalDate, setInternalDate] = useState<Date>(() =>
      startOfDay(defaultDate ?? new Date())
    );
    const activeDate = isDateControlled ? startOfDay(date!) : internalDate;

    const isViewControlled = view !== undefined;
    const [internalView, setInternalView] =
      useState<SchedulerViewMode>(defaultView);
    const activeView = isViewControlled ? view! : internalView;

    const setDate = (next: Date) => {
      const d = startOfDay(next);
      if (!isDateControlled) setInternalDate(d);
      onDateChange?.(d);
    };

    const setView = (next: SchedulerViewMode) => {
      if (!isViewControlled) setInternalView(next);
      onViewChange?.(next);
    };

    const navigate = (dir: -1 | 1) => {
      switch (activeView) {
        case "month":
          setDate(addMonths(activeDate, dir));
          break;
        case "week":
          setDate(addDays(activeDate, 7 * dir));
          break;
        case "agenda":
          setDate(addDays(activeDate, 7 * dir));
          break;
        case "day":
        default:
          setDate(addDays(activeDate, dir));
          break;
      }
    };

    const goToday = () => setDate(new Date());

    // Toolbar label varies by view.
    const label = useMemo(() => {
      switch (activeView) {
        case "month":
          return `${MONTH_NAMES[activeDate.getMonth()]} ${activeDate.getFullYear()}`;
        case "day":
          return `${WEEKDAY_FULL[activeDate.getDay()]}, ${
            MONTH_NAMES[activeDate.getMonth()]
          } ${activeDate.getDate()}, ${activeDate.getFullYear()}`;
        case "week":
        case "agenda": {
          const days = weekDays(activeDate, weekStartsOn);
          const start = days[0];
          const end = days[6];
          const sameMonth = isSameMonth(start, end);
          const startStr = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
          const endStr = sameMonth
            ? `${end.getDate()}`
            : `${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`;
          return `${startStr} – ${endStr}, ${end.getFullYear()}`;
        }
        default:
          return "";
      }
    }, [activeView, activeDate, weekStartsOn]);

    const offered = views.filter((v) => DEFAULT_VIEWS.includes(v));

    return (
      <div
        ref={ref}
        className={cn("nova-scheduler", className)}
        {...rest}
      >
        <div className="nova-scheduler__toolbar">
          <div className="nova-scheduler__nav-group">
            <button
              type="button"
              className="nova-scheduler__today nova-focusable"
              onClick={goToday}
            >
              Today
            </button>
            <button
              type="button"
              className="nova-scheduler__nav nova-focusable"
              aria-label="Previous"
              onClick={() => navigate(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="nova-scheduler__nav nova-focusable"
              aria-label="Next"
              onClick={() => navigate(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 6l6 6-6 6"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <h2 className="nova-scheduler__label" aria-live="polite">
            {label}
          </h2>

          {offered.length > 1 && (
            <div
              className="nova-scheduler__switcher"
              role="tablist"
              aria-label="Select view"
            >
              {offered.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={v === activeView}
                  className={cn(
                    "nova-scheduler__view-btn",
                    "nova-focusable",
                    v === activeView && "nova-scheduler__view-btn--active"
                  )}
                  onClick={() => setView(v)}
                >
                  {VIEW_LABEL[v]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nova-scheduler__body">
          {activeView === "month" && (
            <SchedulerMonth
              date={activeDate}
              events={events}
              weekStartsOn={weekStartsOn}
              onDayClick={(d) => {
                setDate(d);
                setView("day");
              }}
              onEventClick={onEventClick}
            />
          )}
          {activeView === "week" && (
            <WeekView
              date={activeDate}
              events={events}
              weekStartsOn={weekStartsOn}
              startHour={startHour}
              endHour={endHour}
              hour12={hour12}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          )}
          {activeView === "day" && (
            <DayView
              date={activeDate}
              events={events}
              startHour={startHour}
              endHour={endHour}
              hour12={hour12}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          )}
          {activeView === "agenda" && (
            <AgendaView
              events={events.filter((e) => {
                const start = startOfWeek(activeDate, weekStartsOn).getTime();
                const end = start + 7 * 86400000;
                return (
                  e.start.getTime() < end && e.end.getTime() >= start
                );
              })}
              from={startOfWeek(activeDate, weekStartsOn)}
              hour12={hour12}
              onEventClick={onEventClick}
            />
          )}
        </div>
      </div>
    );
  }
);

/* -----------------------------------------------------------------------------
 * Internal month grid — composed locally so Scheduler stays self-contained.
 * -------------------------------------------------------------------------- */
interface SchedulerMonthProps {
  date: Date;
  events: SchedulerEvent[];
  weekStartsOn: WeekStart;
  onDayClick: (date: Date) => void;
  onEventClick?: (event: SchedulerEvent) => void;
}

const SchedulerMonth = ({
  date,
  events,
  weekStartsOn,
  onDayClick,
  onEventClick,
}: SchedulerMonthProps) => {
  const month = startOfMonth(date);
  const cells = monthGrid(month, weekStartsOn);
  const weekdays = orderedWeekdays(weekStartsOn, false);
  const today = startOfDay(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, SchedulerEvent[]>();
    for (const e of events) {
      const key = toDayKey(startOfDay(e.start));
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.start.getTime() - b.start.getTime());
    return map;
  }, [events]);

  return (
    <div className="nova-scheduler__month" role="grid" aria-label="Month view">
      <div className="nova-scheduler__month-weekdays" role="row" aria-hidden="true">
        {weekdays.map((w, i) => (
          <span key={i} className="nova-scheduler__month-weekday">
            {w}
          </span>
        ))}
      </div>
      <div className="nova-scheduler__month-grid">
        {cells.map((day) => {
          const outside = !isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const dayEvents = byDay.get(toDayKey(day)) ?? [];
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;
          return (
            <div
              key={day.getTime()}
              role="gridcell"
              className={cn(
                "nova-scheduler__month-cell",
                outside && "nova-scheduler__month-cell--outside",
                isToday && "nova-scheduler__month-cell--today"
              )}
              onClick={() => onDayClick(startOfDay(day))}
            >
              <span className="nova-scheduler__month-date">{day.getDate()}</span>
              <div className="nova-scheduler__month-events">
                {visible.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={cn(
                      "nova-scheduler__month-chip",
                      `nova-scheduler__month-chip--${
                        (ev.tone ?? "primary") as EventTone
                      }`
                    )}
                    title={ev.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(ev);
                    }}
                  >
                    <span
                      className="nova-scheduler__month-dot"
                      aria-hidden="true"
                    />
                    <span className="nova-scheduler__month-chip-text">
                      {ev.title}
                    </span>
                  </button>
                ))}
                {overflow > 0 && (
                  <span className="nova-scheduler__month-more">
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
};
